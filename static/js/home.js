// Home page functionality
class TwitterHome {
    constructor() {
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMoreTweets = true;
        this.tweets = [];
        this.init();
    }

    init() {
        this.setupEventHandlers();
        this.loadUserData();
        this.loadTweets();
        this.loadSuggestedUsers();
        this.loadTrendingTopics();
        this.setupInfiniteScroll();
    }

    setupEventHandlers() {
        // Navigation
        this.setupNavigation();
        
        // Tweet composition
        this.setupTweetComposer();
        
        // Profile menu
        this.setupProfileMenu();
        
        // Search
        this.setupSearch();
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshFeed());
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        
        [...navItems, ...mobileNavItems].forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });
    }

    navigateToPage(page) {
        switch (page) {
            case 'home':
                window.location.href = '/home';
                break;
            case 'explore':
                window.location.href = '/explore';
                break;
            case 'notifications':
                window.location.href = '/notifications';
                break;
            case 'messages':
                window.location.href = '/messages';
                break;
            case 'bookmarks':
                window.location.href = '/bookmarks';
                break;
            case 'profile':
                // Navigate to current user's profile
                if (this.currentUser) {
                    window.location.href = `/profile/${this.currentUser.username}`;
                }
                break;
        }
    }

    setupTweetComposer() {
        const tweetText = document.getElementById('tweetText');
        const submitBtn = document.getElementById('submitTweet');
        const charCount = document.getElementById('charCount');
        const progressRing = document.querySelector('.progress-ring-progress');
        
        if (tweetText && submitBtn && charCount && progressRing) {
            tweetText.addEventListener('input', () => {
                const content = tweetText.value;
                submitBtn.disabled = content.trim().length === 0 || content.length > 280;
                Utils.updateCharacterCount(tweetText, charCount, progressRing);
            });
            
            submitBtn.addEventListener('click', () => this.submitTweet());
        }
    }

    setupProfileMenu() {
        const profileMenu = document.getElementById('profileMenu');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (profileMenu && dropdownMenu) {
            profileMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }
        
        // Profile link
        const profileLink = document.getElementById('profileLink');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentUser) {
                    window.location.href = `/profile/${this.currentUser.username}`;
                }
            });
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = Utils.debounce((query) => {
                if (query.trim()) {
                    this.performSearch(query);
                } else {
                    this.hideSearchResults();
                }
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    setupInfiniteScroll() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreTweets());
        }
        
        // Optional: Auto-load on scroll
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                if (!this.isLoading && this.hasMoreTweets) {
                    this.loadMoreTweets();
                }
            }
        }, 500));
    }

    async loadUserData() {
        // User data will be loaded by the backend session
        // Update UI with current user info if available
        this.updateUserUI();
    }

    updateUserUI() {
        const currentUserImg = document.getElementById('currentUserImg');
        const currentUserName = document.getElementById('currentUserName');
        const composeAvatar = document.getElementById('composeAvatar');
        
        // This would typically come from the backend session
        // For now, we'll use placeholder data
        const userData = {
            avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=50&h=50&fit=crop&crop=face',
            display_name: 'User',
            username: 'user'
        };
        
        if (currentUserImg) currentUserImg.src = userData.avatar;
        if (currentUserName) currentUserName.textContent = userData.display_name;
        if (composeAvatar) composeAvatar.src = userData.avatar;
    }

    async loadTweets(page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingIndicator();
        
        try {
            const response = await Utils.makeRequest(`/api/tweets?page=${page}&per_page=20`);
            
            if (page === 1) {
                this.tweets = response.tweets;
                this.renderTweets();
            } else {
                this.tweets.push(...response.tweets);
                this.appendTweets(response.tweets);
            }
            
            this.hasMoreTweets = response.has_next;
            this.updateLoadMoreButton();
            
        } catch (error) {
            console.error('Error loading tweets:', error);
            Utils.showNotification('Failed to load tweets', 'error');
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }

    async loadMoreTweets() {
        if (!this.hasMoreTweets || this.isLoading) return;
        
        this.currentPage++;
        await this.loadTweets(this.currentPage);
    }

    renderTweets() {
        const tweetFeed = document.getElementById('tweetFeed');
        if (!tweetFeed) return;
        
        tweetFeed.innerHTML = '';
        
        if (this.tweets.length === 0) {
            tweetFeed.innerHTML = `
                <div class="empty-state">
                    <h3>No tweets yet</h3>
                    <p>Start following people to see their tweets here!</p>
                </div>
            `;
            return;
        }
        
        this.tweets.forEach(tweet => {
            const tweetElement = Utils.createTweetElement(tweet);
            this.setupTweetActions(tweetElement, tweet);
            tweetFeed.appendChild(tweetElement);
        });
    }

    appendTweets(tweets) {
        const tweetFeed = document.getElementById('tweetFeed');
        if (!tweetFeed) return;
        
        tweets.forEach(tweet => {
            const tweetElement = Utils.createTweetElement(tweet);
            this.setupTweetActions(tweetElement, tweet);
            tweetFeed.appendChild(tweetElement);
        });
    }

    setupTweetActions(tweetElement, tweet) {
        const actionButtons = tweetElement.querySelectorAll('.action-btn');
        
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                this.handleTweetAction(action, tweet, btn);
            });
        });
    }

    async handleTweetAction(action, tweet, buttonElement) {
        switch (action) {
            case 'like':
                await this.toggleLike(tweet, buttonElement);
                break;
            case 'retweet':
                await this.toggleRetweet(tweet, buttonElement);
                break;
            case 'reply':
                this.showReplyModal(tweet);
                break;
            case 'share':
                this.shareTweet(tweet);
                break;
        }
    }

    async toggleLike(tweet, buttonElement) {
        try {
            const response = await Utils.makeRequest(`/api/tweets/${tweet.id}/like`, {
                method: 'POST'
            });
            
            if (response.success) {
                const icon = buttonElement.querySelector('i');
                const count = buttonElement.querySelector('span');
                
                if (response.liked) {
                    buttonElement.classList.add('active');
                    icon.className = 'fas fa-heart';
                } else {
                    buttonElement.classList.remove('active');
                    icon.className = 'far fa-heart';
                }
                
                count.textContent = Utils.formatNumber(response.likes_count);
                tweet.is_liked = response.liked;
                tweet.likes_count = response.likes_count;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            Utils.showNotification('Failed to update like', 'error');
        }
    }

    async toggleRetweet(tweet, buttonElement) {
        try {
            const response = await Utils.makeRequest(`/api/tweets/${tweet.id}/retweet`, {
                method: 'POST'
            });
            
            if (response.success) {
                const count = buttonElement.querySelector('span');
                
                if (response.retweeted) {
                    buttonElement.classList.add('active');
                } else {
                    buttonElement.classList.remove('active');
                }
                
                count.textContent = Utils.formatNumber(response.retweets_count);
                tweet.is_retweeted = response.retweeted;
                tweet.retweets_count = response.retweets_count;
            }
        } catch (error) {
            console.error('Error toggling retweet:', error);
            Utils.showNotification('Failed to update retweet', 'error');
        }
    }

    shareTweet(tweet) {
        if (navigator.share) {
            navigator.share({
                title: `Tweet by ${tweet.user.display_name}`,
                text: tweet.content,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(tweet.content);
            Utils.showNotification('Tweet copied to clipboard', 'success');
        }
    }

    async submitTweet() {
        const tweetText = document.getElementById('tweetText');
        const content = tweetText.value.trim();
        
        if (!content || content.length > 280) return;
        
        try {
            const response = await Utils.makeRequest('/api/tweets', {
                method: 'POST',
                body: JSON.stringify({ content })
            });
            
            if (response.success) {
                tweetText.value = '';
                const submitBtn = document.getElementById('submitTweet');
                if (submitBtn) submitBtn.disabled = true;
                
                // Reset character count
                const charCount = document.getElementById('charCount');
                const progressRing = document.querySelector('.progress-ring-progress');
                if (charCount && progressRing) {
                    Utils.updateCharacterCount(tweetText, charCount, progressRing);
                }
                
                Utils.showNotification('Tweet posted!', 'success');
                this.refreshFeed();
            }
        } catch (error) {
            console.error('Error posting tweet:', error);
            Utils.showNotification('Failed to post tweet', 'error');
        }
    }

    async refreshFeed() {
        this.currentPage = 1;
        this.hasMoreTweets = true;
        await this.loadTweets(1);
        Utils.showNotification('Feed refreshed', 'success');
    }

    async loadSuggestedUsers() {
        try {
            const response = await Utils.makeRequest('/api/suggested-users');
            this.renderSuggestedUsers(response.users);
        } catch (error) {
            console.error('Error loading suggested users:', error);
        }
    }

    renderSuggestedUsers(users) {
        const suggestedUsersContainer = document.getElementById('suggestedUsers');
        if (!suggestedUsersContainer) return;
        
        suggestedUsersContainer.innerHTML = '';
        
        users.forEach(user => {
            const userElement = Utils.createUserSuggestionElement(user);
            this.setupFollowButton(userElement, user);
            suggestedUsersContainer.appendChild(userElement);
        });
    }

    setupFollowButton(userElement, user) {
        const followBtn = userElement.querySelector('.follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', () => this.toggleFollow(user.id, followBtn));
        }
    }

    async toggleFollow(userId, buttonElement) {
        try {
            const response = await Utils.makeRequest(`/api/users/${userId}/follow`, {
                method: 'POST'
            });
            
            if (response.success) {
                if (response.following) {
                    buttonElement.textContent = 'Following';
                    buttonElement.classList.add('following');
                } else {
                    buttonElement.textContent = 'Follow';
                    buttonElement.classList.remove('following');
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            Utils.showNotification('Failed to update follow status', 'error');
        }
    }

    async loadTrendingTopics() {
        try {
            const response = await Utils.makeRequest('/api/trending');
            this.renderTrendingTopics(response.trending);
        } catch (error) {
            console.error('Error loading trending topics:', error);
        }
    }

    renderTrendingTopics(topics) {
        const trendingContainer = document.getElementById('trendingContent');
        if (!trendingContainer) return;
        
        trendingContainer.innerHTML = '';
        
        topics.forEach(topic => {
            const topicElement = document.createElement('div');
            topicElement.className = 'trending-item';
            topicElement.innerHTML = `
                <div class="trending-category">Trending in Technology</div>
                <div class="trending-topic">#${topic.hashtag}</div>
                <div class="trending-tweets">${topic.tweets} Tweets</div>
            `;
            
            topicElement.addEventListener('click', () => {
                window.location.href = `/explore?q=%23${topic.hashtag}`;
            });
            
            trendingContainer.appendChild(topicElement);
        });
    }

    async performSearch(query) {
        try {
            const response = await Utils.makeRequest(`/api/search?q=${encodeURIComponent(query)}`);
            this.showSearchResults(response);
        } catch (error) {
            console.error('Error performing search:', error);
        }
    }

    showSearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        const searchContent = document.getElementById('searchContent');
        
        if (!searchResults || !searchContent) return;
        
        searchContent.innerHTML = '';
        
        // Add tweets
        if (results.tweets.length > 0) {
            const tweetsSection = document.createElement('div');
            tweetsSection.innerHTML = '<h4>Tweets</h4>';
            
            results.tweets.slice(0, 3).forEach(tweet => {
                const tweetElement = Utils.createTweetElement(tweet);
                this.setupTweetActions(tweetElement, tweet);
                tweetsSection.appendChild(tweetElement);
            });
            
            searchContent.appendChild(tweetsSection);
        }
        
        // Add users
        if (results.users.length > 0) {
            const usersSection = document.createElement('div');
            usersSection.innerHTML = '<h4>People</h4>';
            
            results.users.forEach(user => {
                const userElement = Utils.createUserSuggestionElement(user);
                this.setupFollowButton(userElement, user);
                usersSection.appendChild(userElement);
            });
            
            searchContent.appendChild(usersSection);
        }
        
        searchResults.style.display = 'block';
    }

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    showLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
    }

    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            if (this.hasMoreTweets && !this.isLoading) {
                loadMoreContainer.style.display = 'block';
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    }
}

// Initialize home page functionality
document.addEventListener('DOMContentLoaded', () => {
    new TwitterHome();
});