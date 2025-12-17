// Notifications page functionality
class TwitterNotifications {
    constructor() {
        this.notifications = [];
        this.currentTab = 'all';
        this.init();
    }

    init() {
        this.setupEventHandlers();
        this.loadUserData();
        this.loadNotifications();
        this.loadTrendingTopics();
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
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshNotifications());
        }
        
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
                // Already on notifications page
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

    async loadNotifications() {
        this.showLoadingIndicator();
        
        try {
            const response = await Utils.makeRequest('/api/notifications');
            this.notifications = response.notifications;
            this.renderNotifications();
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showEmptyState('Failed to load notifications');
        } finally {
            this.hideLoadingIndicator();
        }
    }

    renderNotifications() {
        const notificationsFeed = document.getElementById('notificationsFeed');
        if (!notificationsFeed) return;

        if (this.notifications.length === 0) {
            this.showEmptyState(
                'No notifications yet',
                'When someone likes, retweets, or follows you, you\'ll see it here.'
            );
            return;
        }

        notificationsFeed.innerHTML = '';

        // Filter notifications based on current tab
        const filteredNotifications = this.filterNotificationsByTab(this.notifications, this.currentTab);

        filteredNotifications.forEach(notification => {
            const notificationElement = Utils.createNotificationElement(notification);
            this.setupNotificationActions(notificationElement, notification);
            notificationsFeed.appendChild(notificationElement);
        });

        if (filteredNotifications.length === 0) {
            this.showEmptyState(`No ${this.currentTab} notifications`);
        }
    }

    filterNotificationsByTab(notifications, tab) {
        switch (tab) {
            case 'mentions':
                return notifications.filter(n => n.type === 'mention');
            case 'all':
            default:
                return notifications;
        }
    }

    setupNotificationActions(notificationElement, notification) {
        // Add click handler to mark as read and navigate if applicable
        notificationElement.addEventListener('click', () => {
            if (!notification.read) {
                this.markAsRead(notification);
                notificationElement.classList.remove('unread');
            }

            // Navigate to relevant content
            if (notification.tweet) {
                // Navigate to tweet (this would require implementing tweet detail view)
            } else if (notification.type === 'follow') {
                window.location.href = `/profile/${notification.from_user.username}`;
            }
        });
    }

    async markAsRead(notification) {
        try {
            // API call to mark notification as read
            // For now, just update locally
            notification.read = true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
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
        this.renderNotifications();
    }

    async refreshNotifications() {
        await this.loadNotifications();
        Utils.showNotification('Notifications refreshed', 'success');
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

    showEmptyState(title, description = '') {
        const notificationsFeed = document.getElementById('notificationsFeed');
        if (notificationsFeed) {
            notificationsFeed.innerHTML = `
                <div class="empty-state">
                    <h3>${title}</h3>
                    ${description ? `<p>${description}</p>` : ''}
                </div>
            `;
        }
    }
}

// Initialize notifications page functionality
document.addEventListener('DOMContentLoaded', () => {
    new TwitterNotifications();
});e