from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from flask_migrate import Migrate
from datetime import datetime, timedelta
import hashlib
import uuid
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///twitter_clone.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    bio = db.Column(db.Text, default='')
    location = db.Column(db.String(100), default='')
    website = db.Column(db.String(200), default='')
    avatar = db.Column(db.String(200), default='https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=100&h=100&fit=crop&crop=face')
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tweets = db.relationship('Tweet', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    retweets = db.relationship('Retweet', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    # Self-referential relationship for followers
    followers = db.relationship(
        'User',
        secondary='followers',
        primaryjoin='User.id==followers.c.followed_id',
        secondaryjoin='User.id==followers.c.follower_id',
        backref=db.backref('following', lazy='dynamic'),
        lazy='dynamic'
    )
    
    def set_password(self, password):
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password):
        return self.password_hash == hashlib.sha256(password.encode()).hexdigest()
    
    def get_followers_count(self):
        return self.followers.count()
    
    def get_following_count(self):
        return self.following.count()
    
    def get_tweets_count(self):
        return self.tweets.count()
    
    def is_following(self, user):
        return self.following.filter(followers.c.followed_id == user.id).count() > 0
    
    def follow(self, user):
        if not self.is_following(user):
            self.following.append(user)
    
    def unfollow(self, user):
        if self.is_following(user):
            self.following.remove(user)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'display_name': self.display_name,
            'bio': self.bio,
            'location': self.location,
            'website': self.website,
            'avatar': self.avatar,
            'verified': self.verified,
            'followers_count': self.get_followers_count(),
            'following_count': self.get_following_count(),
            'tweets_count': self.get_tweets_count(),
            'created_at': self.created_at.strftime('%Y-%m-%d')
        }

# Followers association table
followers = db.Table('followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('followed_id', db.Integer, db.ForeignKey('user.id'))
)

class Tweet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    likes = db.relationship('Like', backref='tweet', lazy='dynamic', cascade='all, delete-orphan')
    retweets = db.relationship('Retweet', backref='tweet', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_likes_count(self):
        return self.likes.count()
    
    def get_retweets_count(self):
        return self.retweets.count()
    
    def is_liked_by(self, user):
        return self.likes.filter_by(user_id=user.id).first() is not None
    
    def is_retweeted_by(self, user):
        return self.retweets.filter_by(user_id=user.id).first() is not None
    
    def to_dict(self, current_user=None):
        return {
            'id': self.id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'user': self.author.to_dict(),
            'likes_count': self.get_likes_count(),
            'retweets_count': self.get_retweets_count(),
            'is_liked': self.is_liked_by(current_user) if current_user else False,
            'is_retweeted': self.is_retweeted_by(current_user) if current_user else False
        }

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tweet_id = db.Column(db.Integer, db.ForeignKey('tweet.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'tweet_id', name='unique_user_tweet_like'),)

class Retweet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tweet_id = db.Column(db.Integer, db.ForeignKey('tweet.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'tweet_id', name='unique_user_tweet_retweet'),)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tweet_id = db.Column(db.Integer, db.ForeignKey('tweet.id'), nullable=True)
    type = db.Column(db.String(20), nullable=False)  # 'like', 'retweet', 'follow'
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='notifications')
    from_user = db.relationship('User', foreign_keys=[from_user_id])
    tweet = db.relationship('Tweet', backref='notifications')
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'message': self.message,
            'read': self.read,
            'created_at': self.created_at.isoformat(),
            'from_user': self.from_user.to_dict(),
            'tweet': self.tweet.to_dict() if self.tweet else None
        }

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_sample_data():
    # Check if data already exists
    if User.query.first():
        return
    
    # Create sample users
    users_data = [
        {
            'username': 'johndoe',
            'email': 'john@example.com',
            'display_name': 'John Doe',
            'bio': 'Software Developer | Tech Enthusiast | Coffee Lover ☕️',
            'location': 'San Francisco, CA',
            'website': 'https://johndoe.dev',
            'avatar': 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=100&h=100&fit=crop&crop=face',
            'password': 'password123'
        },
        {
            'username': 'sarahchen',
            'email': 'sarah@example.com',
            'display_name': 'Sarah Chen',
            'bio': 'UX Designer | Digital Artist | Mountain Hiker 🏔️',
            'location': 'Seattle, WA',
            'website': 'https://sarahchen.design',
            'avatar': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
            'verified': True,
            'password': 'password123'
        },
        {
            'username': 'mikejohnson',
            'email': 'mike@example.com',
            'display_name': 'Mike Johnson',
            'bio': 'Product Manager | Startup Advisor | Dog Dad 🐕',
            'location': 'Austin, TX',
            'website': 'https://mikejohnson.co',
            'avatar': 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
            'password': 'password123'
        },
        {
            'username': 'emilywright',
            'email': 'emily@example.com',
            'display_name': 'Emily Wright',
            'bio': 'Data Scientist | AI Researcher | Book Lover 📚',
            'location': 'Boston, MA',
            'website': 'https://emilywright.ai',
            'avatar': 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=100&h=100&fit=crop&crop=face',
            'verified': True,
            'password': 'password123'
        },
        {
            'username': 'alexkim',
            'email': 'alex@example.com',
            'display_name': 'Alex Kim',
            'bio': 'Frontend Developer | React Enthusiast | Gaming 🎮',
            'location': 'Los Angeles, CA',
            'website': 'https://alexkim.dev',
            'avatar': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=100&h=100&fit=crop&crop=face',
            'password': 'password123'
        }
    ]
    
    created_users = []
    for user_data in users_data:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            display_name=user_data['display_name'],
            bio=user_data['bio'],
            location=user_data['location'],
            website=user_data['website'],
            avatar=user_data['avatar'],
            verified=user_data.get('verified', False)
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        created_users.append(user)
    
    db.session.commit()
    
    # Create sample tweets
    tweets_data = [
        {
            'user_index': 1,
            'content': 'Just finished designing a new mobile app interface! The user testing results are amazing. Sometimes the simplest solutions are the most effective. #UXDesign #MobileFirst 📱✨'
        },
        {
            'user_index': 3,
            'content': 'Machine Learning breakthrough! Our new algorithm improved prediction accuracy by 23%. The future of AI is looking brighter every day. Can\'t wait to share more details at the conference next week! 🚀🤖'
        },
        {
            'user_index': 2,
            'content': 'Product launch day! After 6 months of hard work, we\'re finally releasing version 2.0. Thank you to the amazing team that made this possible. #ProductLaunch #TeamWork 🎉'
        },
        {
            'user_index': 4,
            'content': 'React 18 concurrent features are game-changing! The new Suspense boundaries make loading states so much smoother. Here\'s what I built today with the new features. #React18 #WebDev 💻'
        },
        {
            'user_index': 0,
            'content': 'Coffee and code - the perfect combination for a productive morning! Working on a new JavaScript framework that could revolutionize state management. Stay tuned! ☕️💻'
        },
        {
            'user_index': 1,
            'content': 'Content marketing tip: Authenticity beats perfection every time. Your audience wants to connect with real stories, not polished facades. Share your journey, including the struggles! ✨💪'
        },
        {
            'user_index': 3,
            'content': 'Just deployed my first machine learning model to production! The feeling of seeing your code make real-world impact is incredible. #MachineLearning #AI #DataScience'
        },
        {
            'user_index': 2,
            'content': 'Startup life: 20% brilliant ideas, 30% execution, 50% coffee. The entrepreneurial journey is wild but worth every moment! #StartupLife #Entrepreneurship'
        },
        {
            'user_index': 4,
            'content': 'Hot take: TypeScript isn\'t just JavaScript with types. It\'s a completely different developer experience that makes you think about code structure differently. #TypeScript #WebDev'
        },
        {
            'user_index': 0,
            'content': 'Debugging is like being the detective in a crime movie where you are also the murderer. Anyone else relate? 😅 #Programming #DevLife'
        }
    ]
    
    for tweet_data in tweets_data:
        tweet = Tweet(
            content=tweet_data['content'],
            user_id=created_users[tweet_data['user_index']].id,
            created_at=datetime.utcnow() - timedelta(hours=tweet_data.get('hours_ago', 1))
        )
        db.session.add(tweet)
    
    db.session.commit()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
@login_required
def home():
    return render_template('home.html')

@app.route('/profile/<username>')
@login_required
def profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    return render_template('profile.html', profile_user=user)

@app.route('/notifications')
@login_required
def notifications():
    return render_template('notifications.html')

@app.route('/explore')
@login_required
def explore():
    return render_template('explore.html')

@app.route('/messages')
@login_required
def messages():
    return render_template('messages.html')

@app.route('/bookmarks')
@login_required
def bookmarks():
    return render_template('bookmarks.html')

# API Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        display_name=data['display_name']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    login_user(user)
    return jsonify({'success': True, 'user': user.to_dict()})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({'success': True, 'user': user.to_dict()})
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})

@app.route('/api/tweets', methods=['GET', 'POST'])
@login_required
def tweets():
    if request.method == 'POST':
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content or len(content) > 280:
            return jsonify({'error': 'Invalid tweet content'}), 400
        
        tweet = Tweet(content=content, user_id=current_user.id)
        db.session.add(tweet)
        db.session.commit()
        
        return jsonify({'success': True, 'tweet': tweet.to_dict(current_user)})
    
    # GET tweets
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    tweets_query = Tweet.query.order_by(Tweet.created_at.desc())
    tweets_paginated = tweets_query.paginate(page=page, per_page=per_page, error_out=False)
    
    tweets_data = [tweet.to_dict(current_user) for tweet in tweets_paginated.items]
    
    return jsonify({
        'tweets': tweets_data,
        'has_next': tweets_paginated.has_next,
        'has_prev': tweets_paginated.has_prev,
        'page': page,
        'pages': tweets_paginated.pages
    })

@app.route('/api/tweets/<int:tweet_id>/like', methods=['POST'])
@login_required
def like_tweet(tweet_id):
    tweet = Tweet.query.get_or_404(tweet_id)
    
    existing_like = Like.query.filter_by(user_id=current_user.id, tweet_id=tweet_id).first()
    
    if existing_like:
        db.session.delete(existing_like)
        liked = False
    else:
        like = Like(user_id=current_user.id, tweet_id=tweet_id)
        db.session.add(like)
        liked = True
        
        # Create notification
        if tweet.user_id != current_user.id:
            notification = Notification(
                user_id=tweet.user_id,
                from_user_id=current_user.id,
                tweet_id=tweet_id,
                type='like',
                message=f'{current_user.display_name} liked your tweet'
            )
            db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'liked': liked,
        'likes_count': tweet.get_likes_count()
    })

@app.route('/api/tweets/<int:tweet_id>/retweet', methods=['POST'])
@login_required
def retweet_tweet(tweet_id):
    tweet = Tweet.query.get_or_404(tweet_id)
    
    existing_retweet = Retweet.query.filter_by(user_id=current_user.id, tweet_id=tweet_id).first()
    
    if existing_retweet:
        db.session.delete(existing_retweet)
        retweeted = False
    else:
        retweet = Retweet(user_id=current_user.id, tweet_id=tweet_id)
        db.session.add(retweet)
        retweeted = True
        
        # Create notification
        if tweet.user_id != current_user.id:
            notification = Notification(
                user_id=tweet.user_id,
                from_user_id=current_user.id,
                tweet_id=tweet_id,
                type='retweet',
                message=f'{current_user.display_name} retweeted your tweet'
            )
            db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'retweeted': retweeted,
        'retweets_count': tweet.get_retweets_count()
    })

@app.route('/api/users/<int:user_id>/follow', methods=['POST'])
@login_required
def follow_user(user_id):
    user = User.query.get_or_404(user_id)
    
    if current_user.is_following(user):
        current_user.unfollow(user)
        following = False
    else:
        current_user.follow(user)
        following = True
        
        # Create notification
        notification = Notification(
            user_id=user_id,
            from_user_id=current_user.id,
            type='follow',
            message=f'{current_user.display_name} started following you'
        )
        db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'following': following,
        'followers_count': user.get_followers_count()
    })

@app.route('/api/users/<username>')
@login_required
def get_user(username):
    user = User.query.filter_by(username=username).first_or_404()
    user_data = user.to_dict()
    user_data['is_following'] = current_user.is_following(user) if current_user.is_authenticated else False
    return jsonify({'user': user_data})

@app.route('/api/users/<username>/tweets')
@login_required
def get_user_tweets(username):
    user = User.query.filter_by(username=username).first_or_404()
    tweets = Tweet.query.filter_by(user_id=user.id).order_by(Tweet.created_at.desc()).all()
    tweets_data = [tweet.to_dict(current_user) for tweet in tweets]
    return jsonify({'tweets': tweets_data})

@app.route('/api/search')
@login_required
def search():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'tweets': [], 'users': []})
    
    # Search tweets
    tweets = Tweet.query.filter(Tweet.content.contains(query)).order_by(Tweet.created_at.desc()).limit(20).all()
    tweets_data = [tweet.to_dict(current_user) for tweet in tweets]
    
    # Search users
    users = User.query.filter(
        db.or_(
            User.username.contains(query),
            User.display_name.contains(query)
        )
    ).limit(10).all()
    users_data = [user.to_dict() for user in users]
    
    return jsonify({
        'tweets': tweets_data,
        'users': users_data
    })

@app.route('/api/notifications')
@login_required
def get_notifications():
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(20).all()
    notifications_data = [notification.to_dict() for notification in notifications]
    return jsonify({'notifications': notifications_data})

@app.route('/api/suggested-users')
@login_required
def get_suggested_users():
    # Get users not followed by current user
    followed_ids = [user.id for user in current_user.following.all()]
    followed_ids.append(current_user.id)  # Exclude self
    
    suggested = User.query.filter(~User.id.in_(followed_ids)).limit(3).all()
    users_data = [user.to_dict() for user in suggested]
    return jsonify({'users': users_data})

@app.route('/api/trending')
@login_required
def get_trending():
    # Simple trending implementation - most used hashtags in last 24 hours
    # This is a basic implementation; in production, you'd use more sophisticated algorithms
    trending_topics = [
        {'hashtag': 'JavaScript', 'tweets': '42.1K'},
        {'hashtag': 'WebDevelopment', 'tweets': '28.5K'},
        {'hashtag': 'CSS', 'tweets': '15.2K'},
        {'hashtag': 'HTML', 'tweets': '9.8K'},
        {'hashtag': 'ReactJS', 'tweets': '35.7K'}
    ]
    return jsonify({'trending': trending_topics})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_sample_data()
    app.run(debug=True, port=5000)