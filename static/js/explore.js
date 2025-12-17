// Explore page functionality
class TwitterExplore {
    constructor() {
        this.currentTab = 'trending';
        this.currentSearchTab = 'top';
        this.searchResults = null;
        this.isSearching = false;
        this.init();
    }

    init() {
        this.setupEventHandlers();
        this.loadUserData();
        this.loadTabContent(this.currentTab);
        this.loadSuggestedUsers();
    }

    setupEventHandlers() {
        // Navigation
        this.setupNavigation();
        
        // Profile menu
        this.setupProfileMenu();
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Search tab switching
        const searchTabButtons = document.querySelectorAll('.search-tab-btn');
        searchTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchSearchTab(tab);
            });
        });
        
        // Search functionality
        this.setupSearch();
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshContent());
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
                // Already on explore page
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
                window.location.href = '/profile/user'; // This should be dynamic
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
                window.location.href = '/profile/user'; // This should be dynamic
            });
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('exploreSearchInput');
        const headerSearchInput = document.getElementById('searchInput');
        const searchClearBtn = document.getElementById('searchClearBtn');
        
        if (searchInput) {
            const debouncedSearch = Utils.debounce((query) => {
                if (query.trim()) {
                    this.performSearch(query);
                } else {
                    this.hideSearchResults();
                }
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                debouncedSearch(query);
                
                if (searchClearBtn) {
                    searchClearBtn.style.display = query ? 'block' : 'none';
                }
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.performSearch(query);
                    }
                }
            });
        }

        if (headerSearchInput) {
            headerSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = headerSearchInput.value.trim();
                    if (query) {
                        // Fill the main search input and perform search
                        if (searchInput) {
                            searchInput.value = query;
                        }
                        this.performSearch(query);
                    }
                }
            });
        }

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                searchClearBtn.style.display = 'none';
                this.hideSearchResults();
            });
        }

        // Check for URL search parameter
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (searchQuery && searchInput) {
            searchInput.value = searchQuery.replace('%23', '#');
            this.performSearch(searchQuery);
        }
    }

    async loadUserData() {
        // Update UI with current user info
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
        this.hideSearchResults();
        this.loadTabContent(tab);
    }

    switchSearchTab(tab) {
        // Update active search tab
        const searchTabButtons = document.querySelectorAll('.search-tab-btn');
        searchTabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        this.currentSearchTab = tab;
        if (this.searchResults) {
            this.renderSearchResults(this.searchResults, tab);
        }
    }

    async loadTabContent(tab) {
        // Hide all sections first
        const sections = document.querySelectorAll('.explore-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show the selected section
        const targetSection = document.getElementById(`${tab}Section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        switch (tab) {
            case 'trending':
                await this.loadTrendingContent();
                break;
            case 'latest':
                await this.loadLatestTweets();
                break;
            case 'people':
                await this.loadSuggestedPeople();
                break;
            case 'media':
                this.loadMediaContent();
                break;
        }
    }

    async loadTrendingContent() {
        try {
            const response = await Utils.makeRequest('/api/trending');
            this.renderTrendingTopics(response.trending);
        } catch (error) {
            console.error('Error loading trending content:', error);
            this.showSectionError('trendingTopics', 'Failed to load trending topics');
        }
    }

    renderTrendingTopics(topics) {
        const container = document.getElementById('trendingTopics');
        if (!container) return;
        
        container.innerHTML = '';
        
        topics.forEach((topic, index) => {
            const topicElement = document.createElement('div');
            topicElement.className = 'trending-topic-item';
            topicElement.innerHTML = `
                <div class="trending-category">Trending in Technology</div>
                <div class="trending-topic">#${topic.hashtag}</div>
                <div class="trending-tweets">${topic.tweets} Tweets</div>
            `;
            
            topicElement.addEventListener('click', () => {
                const searchInput = document.getElementById('exploreSearchInput');
                if (searchInput) {
                    searchInput.value = `#${topic.hashtag}`;
                }
                this.performSearch(`#${topic.hashtag}`);
            });
            
            container.appendChild(topicElement);
        });
    }

    async loadLatestTweets() {
        try {
            const response = await Utils.makeRequest('/api/tweets?page=1&per_page=20');
            this.renderLatestTweets(response.tweets);
        } catch (error) {
            console.error('Error loading latest tweets:', error);
            this.showSectionError('latestTweets', 'Failed to load latest tweets');
        }
    }

    renderLatestTweets(tweets) {
        const container = document.getElementById('latestTweets');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (tweets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No tweets found</h3>
                    <p>Check back later for the latest tweets.</p>
                </div>
            `;
            return;
        }
        
        tweets.forEach(tweet => {
            const tweetElement = Utils.createTweetElement(tweet);
            this.setupTweetActions(tweetElement, tweet);
            container.appendChild(tweetElement);
        });
    }

    async loadSuggestedPeople() {
        try {
            const response = await Utils.makeRequest('/api/suggested-users');
            this.renderSuggestedPeople(response.users);
        } catch (error) {
            console.error('Error loading suggested people:', error);
            this.showSectionError('suggestedPeople', 'Failed to load suggested people');
        }
    }

    renderSuggestedPeople(users) {
        const container = document.getElementById('suggestedPeople');
        if (!container) return;
        
        container.innerHTML = '';
        
        users.forEach(user => {
            const userElement = Utils.createUserSuggestionElement(user);
            this.setupFollowButton(userElement, user);
            container.appendChild(userElement);
        });
    }

    loadMediaContent() {
        const container = document.getElementById('mediaTweets');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Media tweets</h3>
                    <p>Discover photos and videos shared on Twitter</p>
                </div>
            `;
        }
    }

    async performSearch(query) {
        this.isSearching = true;
        this.showSearchResults();
        
        const searchResultsContent = document.getElementById('searchResultsContent');
        if (searchResultsContent) {
            searchResultsContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        }

        try {
            const response = await Utils.makeRequest(`/api/search?q=${encodeURIComponent(query)}`);
            this.searchResults = response;
            this.renderSearchResults(response, this.currentSearchTab);
        } catch (error) {
            console.error('Error performing search:', error);
            if (searchResultsContent) {
                searchResultsContent.innerHTML = `
                    <div class="empty-state">
                        <h3>Search failed</h3>
                        <p>Unable to search right now. Please try again.</p>
                    </div>
                `;
            }
        } finally {
            this.isSearching = false;
        }
    }

    renderSearchResults(results, tab = 'top') {
        const searchResultsContent = document.getElementById('searchResultsContent');
        if (!searchResultsContent) return;

        searchResultsContent.innerHTML = '';

        let content = [];

        switch (tab) {
            case 'top':
                // Show mixed results - tweets and people
                if (results.tweets.length > 0) {
                    content.push({
                        type: 'tweets',
                        title: 'Tweets',
                        items: results.tweets.slice(0, 5)
                    });
                }
                if (results.users.length > 0) {
                    content.push({
                        type: 'users',
                        title: 'People',
                        items: results.users.slice(0, 3)
                    });
                }
                break;
            case 'latest':
                if (results.tweets.length > 0) {
                    content.push({
                        type: 'tweets',
                        title: 'Latest Tweets',
                        items: results.tweets
                    });
                }
                break;
            case 'people':
                if (results.users.length > 0) {
                    content.push({
                        type: 'users',
                        title: 'People',
                        items: results.users
                    });
                }
                break;
        }

        if (content.length === 0) {
            searchResultsContent.innerHTML = `
                <div class="empty-state">
                    <h3>No results found</h3>
                    <p>Try searching for something else.</p>
                </div>
            `;
            return;
        }

        content.forEach(section => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'search-section';
            
            const titleElement = document.createElement('h4');
            titleElement.textContent = section.title;
            sectionElement.appendChild(titleElement);

            section.items.forEach(item => {
                let itemElement;
                
                if (section.type === 'tweets') {
                    itemElement = Utils.createTweetElement(item);
                    this.setupTweetActions(itemElement, item);
                } else if (section.type === 'users') {
                    itemElement = Utils.createUserSuggestionElement(item);
                    this.setupFollowButton(itemElement, item);
                }
                
                sectionElement.appendChild(itemElement);
            });

            searchResultsContent.appendChild(sectionElement);
        });
    }

    showSearchResults() {
        const searchResultsSection = document.getElementById('searchResultsSection');
        if (searchResultsSection) {
            searchResultsSection.style.display = 'block';
        }

        // Hide other sections
        const sections = document.querySelectorAll('.explore-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }

    hideSearchResults() {
        const searchResultsSection = document.getElementById('searchResultsSection');
        if (searchResultsSection) {
            searchResultsSection.style.display = 'none';
        }

        // Show current tab section
        this.loadTabContent(this.currentTab);
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
                this.shareExplore(tweet);
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

    async loadSuggestedUsers() {
        try {
            const response = await Utils.makeRequest('/api/suggested-users');
            this.renderSuggestedUsersWidget(response.users);
        } catch (error) {
            console.error('Error loading suggested users:', error);
        }
    }

    renderSuggestedUsersWidget(users) {
        const suggestedUsersContainer = document.getElementById('suggestedUsers');
        if (!suggestedUsersContainer) return;
        
        suggestedUsersContainer.innerHTML = '';
        
        users.forEach(user => {
            const userElement = Utils.createUserSuggestionElement(user);
            this.setupFollowButton(userElement, user);
            suggestedUsersContainer.appendChild(userElement);
        });
    }

    shareExplore(tweet) {
        if (navigator.share) {
            navigator.share({
                title: `Tweet by ${tweet.user.display_name}`,
                text: tweet.content,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(tweet.content);
            Utils.showNotification('Tweet copied to clipboard', 'success');
        }
    }

    refreshContent() {
        this.loadTabContent(this.currentTab);
        Utils.showNotification('Content refreshed', 'success');
    }

    showSectionError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize explore page functionality
document.addEventListener('DOMContentLoaded', () => {
    new TwitterExplore();
});