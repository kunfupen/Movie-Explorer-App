import os
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()

app = Flask(__name__)

TMDB_API_KEY = os.environ.get('TMBD_API_KEY')
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')

TMDB_BASE = 'https://api.themoviedb.org/3'
YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3/search'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search')
def search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'Query required'}), 400
    
    resp = requests.get(f'{TMDB_BASE}/search/movie', params={
        'query': q, 'api_key': TMDB_API_KEY})
    return jsonify(resp.json())

@app.route('/api/movie/<int:movie_id>')
def movie_details(movie_id):
    detail_resp = requests.get(f'{TMDB_BASE}/movie/{movie_id}', params={
        'append_to_response': 'credits', 'api_key': TMDB_API_KEY}, timeout=15)
    data = detail_resp.json()

    title = data.get('title', '')
    video_id = None

    videos = []
    try:
        videos_resp = requests.get(
            f'{TMDB_BASE}/movie/{movie_id}/videos',
            params={'api_key': TMDB_API_KEY},
            timeout=15
        )
        videos = videos_resp.json().get('results', [])
    except requests.RequestException:
        videos = []

    youtube_videos = [
        video for video in videos
        if video.get('site') == 'YouTube' and video.get('key')
    ]

    official_trailers = [
        video for video in youtube_videos
        if video.get('type') == 'Trailer' and video.get('official')
    ]
    trailers = [video for video in youtube_videos if video.get('type') == 'Trailer']

    if official_trailers:
        video_id = official_trailers[0].get('key')
    elif trailers:
        video_id = trailers[0].get('key')
    elif youtube_videos:
        video_id = youtube_videos[0].get('key')

    if not video_id and YOUTUBE_API_KEY and title:
        try:
            yt_resp = requests.get(YOUTUBE_BASE, params={
                'part': 'snippet',
                'q': f'{title} official trailer',
                'type': 'video',
                'maxResults': 1,
                'key': YOUTUBE_API_KEY
            }, timeout=15)
            yt_data = yt_resp.json()
            items = yt_data.get('items', [])
            if items:
                video_id = items[0].get('id', {}).get('videoId')
            else:
                yt_resp = requests.get(YOUTUBE_BASE, params={
                    'part': 'snippet',
                    'q': f'{title} trailer',
                    'type': 'video',
                    'maxResults': 1,
                    'key': YOUTUBE_API_KEY
                }, timeout=15)
                yt_data = yt_resp.json()
                items = yt_data.get('items', [])
                if items:
                    video_id = items[0].get('id', {}).get('videoId')
        except requests.RequestException:
            video_id = None

    data['trailer_video_id'] = video_id
    data['trailer_url'] = f'https://www.youtube.com/watch?v={video_id}' if video_id else None

    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)