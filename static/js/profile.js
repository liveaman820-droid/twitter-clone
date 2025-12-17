// Profile page functionality
class TwitterProfile {
    constructor() {
        this.profileUser = null;
        this.currentTab = 'tweets';
        this.tweets = [];
        this.init();
    }

    init() {
        this.loadProfileData();
        this.setupEventHandlers();
        this.loadUserData();
    }

    setupEventHandlers() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Follow button
        const followBtn = document.getElementById('followProfileBtn');
        if (followBtn) {
            followBtn.addEventListener('click', () => this.toggleFollow());
        }

        // Navigation
        this.setupNavigation();
        
        // Profile menu
        this.setupProfileMenu();
        
        // Search
        this.setupSearch();
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
                // Already on profile page
                break;
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
                // Navigate to current user's own profile
                // This would need the current user's username
            });
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        window.location.href = `/explore?q=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }

    loadProfileData() {
        // Get profile data from the script tag or URL
        if (window.profileData) {
            this.profileUser = window.profileData;
            this.loadProfileInfo();
        }
    }

    async loadProfileInfo() {
        try {
            const response = await Utils.makeRequest(`/api/users/${this.profileUser.username}`);
            this.profileUser = response.user;
            this.updateProfileUI();
            this.loadProfileTweets();
        } catch (error) {
            console.error('Error loading profile:', error);
            Utils.showNotification('Failed to load profile', 'error');
        }
    }

    updateProfileUI() {
        // Update follow button
        const followBtn = document.getElementById('followProfileBtn');
        if (followBtn) {
            if (this.profileUser.is_following) {
                followBtn.textContent = 'Following';
                followBtn.classList.add('following');
            } else {
                followBtn.textContent = 'Follow';
                followBtn.classList.remove('following');
            }
            
            // Hide follow button if it's the current user's own profile
            // This logic would depend on having current user data
        }

        // Update stats
        const followingCount = document.getElementById('profileFollowing');
        const followersCount = document.getElementById('profileFollowers');
        
        if (followingCount) followingCount.textContent = Utils.formatNumber(this.profileUser.following_count);
        if (followersCount) followersCount.textContent = Utils.formatNumber(this.profileUser.followers_count);
    }

    async loadUserData() {
        // Update UI with current user info for header
        const currentUserImg = document.getElementById('currentUserImg');
        const currentUserName = document.getElementById('currentUserName');
        
        // This would typically come from the backend session
        const userData = {
            avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?w=50&h=50&fit=crop&crop=face',
            display_name: 'User'
        };
        
        if (currentUserImg) currentUserImg.src = userData.avatar;
        if (currentUserName) currentUserName.textContent = userData.display_name;
    }

    switchTab(tab) {
        // Update active tab
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        this.currentTab = tab;
        this.loadTabContent(tab);
    }

    async loadTabContent(tab) {
        const profileContent = document.getElementById('profileContent');
        if (!profileContent) return;

        profileContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

        switch (tab) {
            case 'tweets':
                await this.loadProfileTweets();
                break;
            case 'replies':
                await this.loadProfileReplies();
                break;
            case 'media':
                this.loadProfileMedia();
                break;
            case 'likes':
                await this.loadProfileLikes();
                break;
        }
    }

    async loadProfileTweets() {
        try {
            const response = await Utils.makeRequest(`/api/users/${this.profileUser.username}/tweets`);
            this.tweets = response.tweets;
            this.renderTweets(this.tweets);
        } catch (error) {
            console.error('Error loading profile tweets:', error);
            this.showEmptyState('Failed to load tweets');
        }
    }

    async loadProfileReplies() {
        // This would load tweets + replies
        // For now, just show the same tweets
        await this.loadProfileTweets();
    }

    loadProfileMedia() {
        const profileContent = document.getElementById('profileContent');
        if (profileContent) {
            profileContent.innerHTML = `
                <div class="empty-state">
                    <h3>No media yet</h3>
                    <p>${this.profileUser.display_name} hasn't posted any photos or videos yet.</p>
                </div>
            `;
        }
    }

    async loadProfileLikes() {
        const profileContent = document.getElementById('profileContent');
        if (profileContent) {
            profileContent.innerHTML = `
                <div class="empty-state">
                    <h3>No likes yet</h3>
                    <p>${this.profileUser.display_name} hasn't liked any tweets yet.</p>
                </div>
            `;
        }
    }

    renderTweets(tweets) {
        const profileContent = document.getElementById('profileContent');
        if (!profileContent) return;

        if (tweets.length === 0) {
            this.showEmptyState('No tweets yet', `${this.profileUser.display_name} hasn't posted any tweets yet.`);
            return;
        }

        profileContent.innerHTML = '';

        tweets.forEach(tweet => {
            const tweetElement = Utils.createTweetElement(tweet);
            this.setupTweetActions(tweetElement, tweet);
            profileContent.appendChild(tweetElement);
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
                this.shareProfile(tweet);
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
            }
        } catch (error) {
            console.error('Error toggling retweet:', error);
            Utils.showNotification('Failed to update retweet', 'error');
        }
    }

    shareProfile(tweet) {
        if (navigator.share) {
            navigator.share({
                title: `${this.profileUser.display_name}'s profile`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            Utils.showNotification('Profile link copied to clipboard', 'success');
        }
    }

    async toggleFollow() {
        try {
            const response = await Utils.makeRequest(`/api/users/${this.profileUser.id}/follow`, {
                method: 'POST'
            });
            
            if (response.success) {
                const followBtn = document.getElementById('followProfileBtn');
                const followersCount = document.getElementById('profileFollowers');
                
                if (response.following) {
                    followBtn.textContent = 'Following';
                    followBtn.classList.add('following');
                    Utils.showNotification(`You are now following ${this.profileUser.display_name}`, 'success');
                } else {
                    followBtn.textContent = 'Follow';
                    followBtn.classList.remove('following');
                    Utils.showNotification(`You unfollowed ${this.profileUser.display_name}`, 'success');
                }
                
                if (followersCount) {
                    followersCount.textContent = Utils.formatNumber(response.followers_count);
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            Utils.showNotification('Failed to update follow status', 'error');
        }
    }

    showEmptyState(title, description = '') {
        const profileContent = document.getElementById('profileContent');
        if (profileContent) {
            profileContent.innerHTML = `
                <div class="empty-state">
                    <h3>${title}</h3>
                    ${description ? `<p>${description}</p>` : ''}
                </div>
            `;
        }
    }
}

// Initialize profile page functionality
document.addEventListener('DOMContentLoaded', () => {
    new TwitterProfile();
});