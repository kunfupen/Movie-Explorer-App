# Movie Explorer App

A Flask movie search app that lets users discover movies, view details, and watch trailers. The backend uses the TMDB API for movie search/details and can fall back to the YouTube API for trailer lookup when TMDB trailer data is unavailable.

Live app: https://movie-explorer-394422504297.us-central1.run.app/

## Features

- Search movies by title.
- View movie posters, release years, and ratings.
- Open a detailed movie view with overview, runtime, genres, top cast, and backdrop art.
- Watch embedded trailers when available.
- Uses Flask routes as a lightweight API layer for TMDB and YouTube requests.
- Includes Docker support for deployment.

## Project Structure

```text
.
├── app.py
├── Dockerfile
├── requirements.txt
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── templates/
│   └── index.html
├── docs/
│   └── process_log.txt
└── README.md
```

## Tech Stack

- Python
- Flask
- JavaScript
- HTML/CSS
- TMDB API
- YouTube Data API
- Docker
- Gunicorn

## Environment Variables

Create a `.env` file locally with:

```text
TMDB_API_KEY=your_tmdb_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

`TMDB_API_KEY` is required for movie search and details. `YOUTUBE_API_KEY` is optional, but enables fallback trailer search when TMDB does not return a trailer.

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open:

```text
http://localhost:8080
```

## Docker

```bash
docker build -t movie-explorer-app .
docker run --env-file .env -p 8080:8080 movie-explorer-app
```

## Development Notes

The AI-assisted development log is available in [docs/process_log.txt](docs/process_log.txt).
