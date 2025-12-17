// Enhanced database with more functionality
const users = [
    {
        id: 1,
        username: '@johndoe',
        displayName: 'John Doe',
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'Software Developer | Tech Enthusiast | Coffee Lover ☕️',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        followers: 1234,
        following: 567,
        verified: false,
        joinDate: '2020-03-15',
        tweets: 342,
        likes: 1205
    },
    {
        id: 2,
        username: '@sarahchen',
        displayName: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'UX Designer | Digital Artist | Mountain Hiker 🏔️',
        location: 'Seattle, WA',
        website: 'https://sarahchen.design',
        followers: 2156,
        following: 892,
        verified: true,
        joinDate: '2019-07-22',
        tweets: 567,
        likes: 2341
    },
    {
        id: 3,
        username: '@mikejohnson',
        displayName: 'Mike Johnson',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'Product Manager | Startup Advisor | Dog Dad 🐕',
        location: 'Austin, TX',
        website: 'https://mikejohnson.co',
        followers: 3421,
        following: 1203,
        verified: false,
        joinDate: '2018-11-08',
        tweets: 789,
        likes: 3456
    },
    {
        id: 4,
        username: '@emilywright',
        displayName: 'Emily Wright',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'Data Scientist | AI Researcher | Book Lover 📚',
        location: 'Boston, MA',
        website: 'https://emilywright.ai',
        followers: 5643,
        following: 432,
        verified: true,
        joinDate: '2017-05-12',
        tweets: 234,
        likes: 1876
    },
    {
        id: 5,
        username: '@alexkim',
        displayName: 'Alex Kim',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'Frontend Developer | React Enthusiast | Gaming 🎮',
        location: 'Los Angeles, CA',
        website: 'https://alexkim.dev',
        followers: 987,
        following: 234,
        verified: false,
        joinDate: '2021-01-30',
        tweets: 456,
        likes: 987
    },
    {
        id: 6,
        username: '@lisagarcia',
        displayName: 'Lisa Garcia',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'Marketing Director | Content Creator | Yoga Instructor 🧘‍♀️',
        location: 'Miami, FL',
        website: 'https://lisagarcia.com',
        followers: 4321,
        following: 876,
        verified: true,
        joinDate: '2019-09-18',
        tweets: 678,
        likes: 2543
    },
    {
        id: 7,
        username: '@davidlee',
        displayName: 'David Lee',
        avatar: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'Backend Developer | Cloud Architect | Cyclist 🚴‍♂️',
        location: 'Denver, CO',
        website: 'https://davidlee.tech',
        followers: 2987,
        following: 543,
        verified: false,
        joinDate: '2020-06-25',
        tweets: 345,
        likes: 1654
    },
    {
        id: 8,
        username: '@rachelgreen',
        displayName: 'Rachel Green',
        avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?w=100&h=100&fit=crop&crop=face',
        bio: 'Fashion Designer | Sustainability Advocate | Cat Mom 🐱',
        location: 'New York, NY',
        website: 'https://rachelgreen.fashion',
        followers: 6754,
        following: 1432,
        verified: true,
        joinDate: '2018-03-07',
        tweets: 892,
        likes: 4321
    }
];

// Current user (will be set by authentication)
let currentUser = users[0];

// Enhanced tweets database with more variety
let tweets = [
    {
        id: 1,
        userId: 2,
        content: 'Just finished designing a new mobile app interface! The user testing results are amazing. Sometimes the simplest solutions are the most effective. #UXDesign #MobileFirst 📱✨',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 24,
        retweets: 8,
        replies: 5,
        likedBy: [],
        retweetedBy: [],
        media: null,
        hashtags: ['UXDesign', 'MobileFirst'],
        mentions: []
    },
    {
        id: 2,
        userId: 4,
        content: 'Machine Learning breakthrough! Our new algorithm improved prediction accuracy by 23%. The future of AI is looking brighter every day. Can\'t wait to share more details at the conference next week! 🚀🤖',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 156,
        retweets: 43,
        replies: 28,
        likedBy: [1, 3, 5],
        retweetedBy: [1, 6],
        media: null,
        hashtags: ['MachineLearning', 'AI'],
        mentions: []
    },
    {
        id: 3,
        userId: 3,
        content: 'Product launch day! After 6 months of hard work, we\'re finally releasing version 2.0. Thank you to the amazing team that made this possible. #ProductLaunch #TeamWork 🎉',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 89,
        retweets: 22,
        replies: 15,
        likedBy: [1, 2, 4, 7],
        retweetedBy: [2, 8],
        media: null,
        hashtags: ['ProductLaunch', 'TeamWork'],
        mentions: []
    },
    {
        id: 4,
        userId: 5,
        content: 'React 18 concurrent features are game-changing! The new Suspense boundaries make loading states so much smoother. Here\'s what I built today with the new features. #React18 #WebDev 💻',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likes: 67,
        retweets: 19,
        replies: 12,
        likedBy: [1, 6, 8],
        retweetedBy: [1],
        media: null,
        hashtags: ['React18', 'WebDev'],
        mentions: []
    },
    {
        id: 5,
        userId: 6,
        content: 'Content marketing tip: Authenticity beats perfection every time. Your audience wants to connect with real stories, not polished facades. Share your journey, including the struggles! ✨💪',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        likes: 203,
        retweets: 67,
        replies: 34,
        likedBy: [1, 2, 3, 5, 7],
        retweetedBy: [2, 4, 7],
        media: null,
        hashtags: ['ContentMarketing', 'Authenticity'],
        mentions: []
    },
    {
        id: 6,
        userId: 7,
        content: 'Deployed our first serverless architecture on AWS today. The scalability and cost-efficiency are impressive. Sometimes the old saying is true: less is more. #CloudComputing #Serverless ☁️',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
        likes: 45,
        retweets: 12,
        replies: 8,
        likedBy: [1, 3, 5],
        retweetedBy: [5],
        media: null,
        hashtags: ['CloudComputing', 'Serverless'],
        mentions: []
    },
    {
        id: 7,
        userId: 8,
        content: 'Sustainable fashion isn\'t just a trend—it\'s the future. Every small choice we make impacts our planet. Proud to announce our new eco-friendly collection made from 100% recycled materials! 🌱♻️',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        likes: 312,
        retweets: 89,
        replies: 56,
        likedBy: [1, 2, 4, 6],
        retweetedBy: [2, 6, 1],
        media: null,
        hashtags: ['SustainableFashion', 'EcoFriendly'],
        mentions: []
    },
    {
        id: 8,
        userId: 1,
        content: 'Coffee and code - the perfect combination for a productive morning! Working on a new JavaScript framework that could revolutionize state management. Stay tuned! ☕️💻',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
        likes: 78,
        retweets: 23,
        replies: 19,
        likedBy: [2, 3, 5, 7, 8],
        retweetedBy: [3, 5],
        media: null,
        hashtags: ['JavaScript', 'Coding'],
        mentions: []
    }
];

// Bookmarks, lists, and other user data
let bookmarks = [];
let lists = [];
let notifications = [
    {
        id: 1,
        type: 'like',
        userId: 2,
        tweetId: 8,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        read: false
    },
    {
        id: 2,
        type: 'retweet',
        userId: 3,
        tweetId: 8,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false
    },
    {
        id: 3,
        type: 'follow',
        userId: 4,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true
    }
];

// Generate unique ID for new tweets
let nextTweetId = Math.max(...tweets.map(t => t.id)) + 1;

// Helper functions
function getUserById(id) {
    return users.find(user => user.id === id);
}

function getTweetById(id) {
    return tweets.find(tweet => tweet.id === id);
}

function addNewTweet(content, userId = currentUser.id) {
    const hashtags = extractHashtags(content);
    const mentions = extractMentions(content);
    
    const newTweet = {
        id: nextTweetId++,
        userId: userId,
        content: content,
        timestamp: new Date(),
        likes: 0,
        retweets: 0,
        replies: 0,
        likedBy: [],
        retweetedBy: [],
        media: null,
        hashtags: hashtags,
        mentions: mentions
    };
    
    tweets.unshift(newTweet);
    
    // Update user's tweet count
    const user = getUserById(userId);
    if (user) {
        user.tweets++;
    }
    
    return newTweet;
}

function extractHashtags(content) {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    
    while ((match = hashtagRegex.exec(content)) !== null) {
        hashtags.push(match[1]);
    }
    
    return hashtags;
}

function extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
    }
    
    return mentions;
}

function likeTweet(tweetId, userId = currentUser.id) {
    const tweet = getTweetById(tweetId);
    if (tweet) {
        const likedIndex = tweet.likedBy.indexOf(userId);
        if (likedIndex > -1) {
            // Unlike
            tweet.likedBy.splice(likedIndex, 1);
            tweet.likes--;
        } else {
            // Like
            tweet.likedBy.push(userId);
            tweet.likes++;
            
            // Add notification for tweet owner
            if (tweet.userId !== userId) {
                addNotification('like', userId, tweet.userId, tweetId);
            }
        }
        return tweet;
    }
    return null;
}

function retweetTweet(tweetId, userId = currentUser.id) {
    const tweet = getTweetById(tweetId);
    if (tweet) {
        const retweetedIndex = tweet.retweetedBy.indexOf(userId);
        if (retweetedIndex > -1) {
            // Unretweet
            tweet.retweetedBy.splice(retweetedIndex, 1);
            tweet.retweets--;
        } else {
            // Retweet
            tweet.retweetedBy.push(userId);
            tweet.retweets++;
            
            // Add notification for tweet owner
            if (tweet.userId !== userId) {
                addNotification('retweet', userId, tweet.userId, tweetId);
            }
        }
        return tweet;
    }
    return null;
}

function addNotification(type, fromUserId, toUserId, tweetId = null) {
    const notification = {
        id: Date.now(),
        type: type,
        userId: fromUserId,
        targetUserId: toUserId,
        tweetId: tweetId,
        timestamp: new Date(),
        read: false
    };
    
    notifications.unshift(notification);
    return notification;
}

function bookmarkTweet(tweetId, userId = currentUser.id) {
    const bookmarkIndex = bookmarks.findIndex(b => b.tweetId === tweetId && b.userId === userId);
    
    if (bookmarkIndex > -1) {
        // Remove bookmark
        bookmarks.splice(bookmarkIndex, 1);
        return false;
    } else {
        // Add bookmark
        bookmarks.push({
            id: Date.now(),
            userId: userId,
            tweetId: tweetId,
            timestamp: new Date()
        });
        return true;
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return days === 1 ? '1d' : `${days}d`;
    } else if (hours > 0) {
        return hours === 1 ? '1h' : `${hours}h`;
    } else if (minutes > 0) {
        return minutes === 1 ? '1m' : `${minutes}m`;
    } else {
        return 'now';
    }
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getSuggestedUsers(userId = currentUser.id) {
    return users.filter(user => user.id !== userId).slice(0, 3);
}

function searchTweets(query) {
    const lowercaseQuery = query.toLowerCase();
    return tweets.filter(tweet => {
        const user = getUserById(tweet.userId);
        return tweet.content.toLowerCase().includes(lowercaseQuery) ||
               user.displayName.toLowerCase().includes(lowercaseQuery) ||
               user.username.toLowerCase().includes(lowercaseQuery) ||
               tweet.hashtags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
    });
}

function getTrendingHashtags() {
    const hashtagCounts = {};
    
    tweets.forEach(tweet => {
        tweet.hashtags.forEach(hashtag => {
            hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
        });
    });
    
    return Object.entries(hashtagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([hashtag, count]) => ({ hashtag, count }));
}

function getUserTweets(userId) {
    return tweets.filter(tweet => tweet.userId === userId);
}

function getUserLikedTweets(userId) {
    return tweets.filter(tweet => tweet.likedBy.includes(userId));
}

function getBookmarkedTweets(userId) {
    const userBookmarks = bookmarks.filter(b => b.userId === userId);
    return userBookmarks.map(bookmark => getTweetById(bookmark.tweetId)).filter(Boolean);
}

function getNotifications(userId) {
    return notifications.filter(n => n.targetUserId === userId);
}

function markNotificationAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
    }
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.database = {
        users,
        tweets,
        currentUser,
        getUserById,
        getTweetById,
        addNewTweet,
        likeTweet,
        retweetTweet,
        bookmarkTweet,
        getTimeAgo,
        formatNumber,
        getSuggestedUsers,
        searchTweets,
        getTrendingHashtags,
        getUserTweets,
        getUserLikedTweets,
        getBookmarkedTweets,
        getNotifications,
        markNotificationAsRead,
        addNotification
    };
}