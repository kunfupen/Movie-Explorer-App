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
        'append_to_response': 'credits', 'api_key': TMDB_API_KEY})
    data = detail_resp.json()

    title = data.get('title', '')
    yt_resp = requests.get(YOUTUBE_BASE, params={
        'part': 'snippet', 'q': f'{title} trailer',
        'type': 'video',
        'maxResults': 1,
        'key': YOUTUBE_API_KEY})
    yt_data = yt_resp.json()
    items = yt_data.get('items', [])
    video_id = items[0]['id']['videoId'] if items else None
    data['trailer_video_id'] = video_id

    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)