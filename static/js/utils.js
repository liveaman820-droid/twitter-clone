// Utility functions
class Utils {
    static formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diff = now - date;
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

    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static linkifyText(text) {
        // Simple linkification for URLs, hashtags, and mentions
        return text
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/#(\w+)/g, '<a href="/explore?q=%23$1" class="hashtag">#$1</a>')
            .replace(/@(\w+)/g, '<a href="/profile/$1" class="mention">@$1</a>');
    }

    static showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    static async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    }

    static createTweetElement(tweet) {
        const tweetElement = document.createElement('div');
        tweetElement.className = 'tweet';
        tweetElement.dataset.tweetId = tweet.id;
        
        const timeAgo = this.formatTimeAgo(tweet.created_at);
        const linkedContent = this.linkifyText(this.escapeHtml(tweet.content));
        
        tweetElement.innerHTML = `
            <img src="${tweet.user.avatar}" alt="${tweet.user.display_name}" class="tweet-avatar">
            <div class="tweet-content">
                <div class="tweet-header">
                    <span class="tweet-user-name">${this.escapeHtml(tweet.user.display_name)}</span>
                    ${tweet.user.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                    <span class="tweet-username">@${this.escapeHtml(tweet.user.username)}</span>
                    <span class="tweet-time">${timeAgo}</span>
                </div>
                <div class="tweet-text">${linkedContent}</div>
                <div class="tweet-actions">
                    <button class="action-btn reply" data-action="reply">
                        <i class="fas fa-comment"></i>
                        <span>0</span>
                    </button>
                    <button class="action-btn retweet ${tweet.is_retweeted ? 'active' : ''}" data-action="retweet">
                        <i class="fas fa-retweet"></i>
                        <span>${this.formatNumber(tweet.retweets_count)}</span>
                    </button>
                    <button class="action-btn like ${tweet.is_liked ? 'active' : ''}" data-action="like">
                        <i class="${tweet.is_liked ? 'fas' : 'far'} fa-heart"></i>
                        <span>${this.formatNumber(tweet.likes_count)}</span>
                    </button>
                    <button class="action-btn share" data-action="share">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        `;
        
        return tweetElement;
    }

    static createUserSuggestionElement(user) {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'user-suggestion';
        
        suggestionElement.innerHTML = `
            <img src="${user.avatar}" alt="${user.display_name}" class="suggestion-avatar">
            <div class="suggestion-info">
                <div class="suggestion-name">${this.escapeHtml(user.display_name)}</div>
                <div class="suggestion-username">@${this.escapeHtml(user.username)}</div>
            </div>
            <button class="follow-btn" data-user-id="${user.id}">Follow</button>
        `;
        
        return suggestionElement;
    }

    static createNotificationElement(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item ${notification.read ? '' : 'unread'}`;
        
        let iconClass, iconType;
        switch (notification.type) {
            case 'like':
                iconClass = 'fas fa-heart';
                iconType = 'like';
                break;
            case 'retweet':
                iconClass = 'fas fa-retweet';
                iconType = 'retweet';
                break;
            case 'follow':
                iconClass = 'fas fa-user-plus';
                iconType = 'follow';
                break;
            default:
                iconClass = 'fas fa-bell';
                iconType = 'default';
        }
        
        const timeAgo = this.formatTimeAgo(notification.created_at);
        
        notificationElement.innerHTML = `
            <div class="notification-icon ${iconType}">
                <i class="${iconClass}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-user">${this.escapeHtml(notification.from_user.display_name)}</div>
                <div class="notification-text">${this.escapeHtml(notification.message)}</div>
                <div class="notification-time">${timeAgo}</div>
            </div>
            <img src="${notification.from_user.avatar}" alt="${notification.from_user.display_name}" class="notification-avatar">
        `;
        
        return notificationElement;
    }

    static updateCharacterCount(textarea, countElement, progressElement) {
        const maxLength = 280;
        const currentLength = textarea.value.length;
        const remaining = maxLength - currentLength;
        
        countElement.textContent = remaining;
        
        // Update progress ring
        const circumference = 2 * Math.PI * 8; // radius = 8
        const strokeDashoffset = circumference - (currentLength / maxLength) * circumference;
        
        progressElement.style.strokeDashoffset = strokeDashoffset;
        
        // Change color based on remaining characters
        if (remaining < 20) {
            progressElement.style.stroke = '#e0245e';
            countElement.style.color = '#e0245e';
        } else if (remaining < 40) {
            progressElement.style.stroke = '#ffad1f';
            countElement.style.color = '#ffad1f';
        } else {
            progressElement.style.stroke = '#1da1f2';
            countElement.style.color = 'var(--text-secondary)';
        }
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}