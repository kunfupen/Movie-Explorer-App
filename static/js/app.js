const searchForm = document.getElementById('search-form');
const resultsContainer = document.getElementById('results');
const resultsHeading = document.getElementById('results-heading');
const errorMessage = document.getElementById('error-message');

let lastMovies = [];

errorMessage.hidden = true;
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();

    if (!query){
        errorMessage.hidden = false;
        errorMessage.textContent = 'Please enter a search term';
        resultsContainer.innerHTML = '';
        return;
    }
    
    errorMessage.hidden = true;
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p class="loading-text">Searching for movies...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Search request failed');
        const data = await response.json();
        const movies = data.results || [];
        lastMovies = movies;

        if (!movies.length){
            resultsContainer.innerHTML = `
            <p class="no-results">No movies found. Try a different search term.</p>
            `;
            return;
        }
        
        renderMovieCards(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        resultsContainer.innerHTML = `
            <p class="error-message">An error occurred while searching. Please try again later.</p>
        `;
    }
});

resultsContainer.addEventListener('click', async (e) => {
    const card = e.target.closest('.movie-card[data-id]');
    if (card) {
        e.preventDefault();
        await renderMovieDetails(card.dataset.id);
        return;
    }

    if (e.target.id === 'back-to-results') {
        renderMovieCards(lastMovies);
    }
});

function renderMovieCards(movies) {
    resultsContainer.innerHTML = movies.map(movie => {
        const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const poster = movie.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title} poster" class="movie-poster">`
            : `<div class="no-poster">No Poster Available</div>`
        return `
            <article class="movie-card" data-id="${movie.id}" role="button" tabindex="0">
                ${poster}
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${year}</span>
                        <span class="movie-rating">⭐ ${rating}</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function formatRuntime(minutes) {
    if (!minutes || Number.isNaN(minutes)) return 'N/A';
    const totalMinutes = Number(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    if (!hours) return `${remainingMinutes} min`;
    return `${hours}h ${remainingMinutes}m`;
}

async function renderMovieDetails(movieId) {
    showLoading('Loading movie details...');

    try {
        const response = await fetch(`/api/movie/${movieId}`);
        if (!response.ok) throw new Error('Movie details request failed');
        
        const movie = await response.json();
        const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : '';
        const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
        const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const runtime = formatRuntime(movie.runtime);
        const tagline = movie.tagline || '';
        const overview = movie.overview || 'No overview available.';
        const genres = (movie.genres || []).map(g => `<span class="pill">${g.name}</span>`).join('');
        const cast = (movie.credits?.cast || []).slice(0, 6).map(c => `<span class="pill">${c.name}</span>`).join('');
        const trailer = movie.trailer_video_id
            ? `<div class="trailer-wrap"><iframe src="https://www.youtube.com/embed/${movie.trailer_video_id}" title="${movie.title} trailer" frameborder="0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="trailer"></iframe><p class="muted"><a href="${movie.trailer_url || `https://www.youtube.com/watch?v=${movie.trailer_video_id}`}" target="_blank" rel="noopener noreferrer">Watch trailer on YouTube</a></p></div>`
            : `<p class="muted">Trailer not available</p>`;

        resultsContainer.innerHTML = `
            <section class="detail-view">
                <button id="back-to-results" class="back-button">← Back to results</button>
                ${backdrop ? `<img src="${backdrop}" alt="${movie.title} backdrop" class="detail-backdrop">` : ''}
                <div class="detail-content">
                    ${poster ? `<img src="${poster}" alt="${movie.title} poster" class="detail-poster">` : `<div class="no-poster">No Poster Available</div>`}
                    <div class="detail-main">
                        <h2 class="detail-title">${movie.title}</h2>
                        ${tagline ? `<p class="detail-tagline">${tagline}</p>` : ''}
                        <div class="detail-row">
                            <span class="pill rating-pill">⭐ ${rating}/10</span>
                            <span class="pill">${runtime}</span>
                            <span class="pill">${year}</span>
                            ${genres}
                        </div>
                        <div class="section-title">Overview</div>
                        <p class="detail-overview">${overview}</p>
                        <h3 class="section-title">Top Cast</h3>
                        <div class="detail-row">${cast || `<span class="pill">Not Available</span>`}</div>
                        <h3 class="section-title">Trailer</h3>
                        ${trailer}
                    </div>
                </div>
            </section>
        `;
    } catch (error) {
        resultsContainer.innerHTML = `<p class="error-message">Unable to load movie details. Please try again later.</p>`;
    }
}
        
function showLoading(text){
    resultsContainer.innerHTML = `
    <div class="loading">
        <div class="spinner"></div>
        <p class="loading-text">${text}</p>
    </div>
    `;
}