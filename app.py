from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# In-memory database (in production, use a real database)
users_db = {}
tweets_db = {}
follows_db = {}  # user_id -> [list of followed user_ids]
notifications_db = {}  # user_id -> [list of notifications]

# Sample data initialization
def init_sample_data():
    sample_users = [
        {
            'id': '1',
            'username': 'johndoe',
            'display_name': 'John Doe',
            'email': 'john@example.com',
            'avatar': 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=100&h=100&fit=crop&crop=face',
            'bio': 'Software Developer | Tech Enthusiast | Coffee Lover',
            'location': 'San Francisco, CA',
            'website': 'https://johndoe.dev',
            'followers_count': 1234,
            'following_count': 567,
            'verified': False,
            'join_date': '2020-03-15',
            'password_hash': generate_password_hash('password123')
        },
        {
            'id': '2',
            'username': 'sarahchen',
            'display_name': 'Sarah Chen',
            'email': 'sarah@example.com',
            'avatar': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
            'bio': 'UX Designer | Digital Artist | Mountain Hiker',
            'location': 'Seattle, WA',
            'website': 'https://sarahchen.design',
            'followers_count': 2156,
            'following_count': 892,
            'verified': True,
            'join_date': '2019-07-22',
            'password_hash': generate_password_hash('password123')
        }
    ]
    
    for user in sample_users:
        users_db[user['id']] = user
        follows_db[user['id']] = []
        notifications_db[user['id']] = []

init_sample_data()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = None
    for uid, u in users_db.items():
        if u['username'] == username:
            user = u
            break
    
    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        return jsonify({'success': True, 'user': {k: v for k, v in user.items() if k != 'password_hash'}})
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    display_name = data.get('display_name')
    
    # Check if user exists
    for user in users_db.values():
        if user['username'] == username or user['email'] == email:
            return jsonify({'success': False, 'message': 'User already exists'}), 400
    
    user_id = str(uuid.uuid4())
    new_user = {
        'id': user_id,
        'username': username,
        'display_name': display_name,
        'email': email,
        'avatar': 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=100&h=100&fit=crop&crop=face',
        'bio': '',
        'location': '',
        'website': '',
        'followers_count': 0,
        'following_count': 0,
        'verified': False,
        'join_date': datetime.now().strftime('%Y-%m-%d'),
        'password_hash': generate_password_hash(password)
    }
    
    users_db[user_id] = new_user
    follows_db[user_id] = []
    notifications_db[user_id] = []
    
    session['user_id'] = user_id
    return jsonify({'success': True, 'user': {k: v for k, v in new_user.items() if k != 'password_hash'}})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True})

@app.route('/api/tweets', methods=['GET', 'POST'])
def tweets():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content or len(content) > 280:
            return jsonify({'error': 'Invalid tweet content'}), 400
        
        tweet_id = str(uuid.uuid4())
        new_tweet = {
            'id': tweet_id,
            'user_id': session['user_id'],
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'likes': 0,
            'retweets': 0,
            'replies': 0,
            'liked_by': [],
            'retweeted_by': []
        }
        
        tweets_db[tweet_id] = new_tweet
        return jsonify({'success': True, 'tweet': new_tweet})
    
    # GET tweets
    tweets_list = list(tweets_db.values())
    tweets_list.sort(key=lambda x: x['timestamp'], reverse=True)
    return jsonify({'tweets': tweets_list})

@app.route('/api/users')
def get_users():
    users_list = [{k: v for k, v in user.items() if k != 'password_hash'} for user in users_db.values()]
    return jsonify({'users': users_list})

if __name__ == '__main__':
    app.run(debug=True, port=5000)