// Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Modal controls
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        const closeLogin = document.getElementById('closeLogin');
        const closeRegister = document.getElementById('closeRegister');
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');

        // Login/Register forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        // Profile menu
        const profileMenu = document.getElementById('profileMenu');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const logoutLink = document.getElementById('logoutLink');

        // Event listeners
        loginBtn?.addEventListener('click', () => this.showLoginModal());
        closeLogin?.addEventListener('click', () => this.hideLoginModal());
        closeRegister?.addEventListener('click', () => this.hideRegisterModal());
        showRegister?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });
        showLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        registerForm?.addEventListener('submit', (e) => this.handleRegister(e));

        profileMenu?.addEventListener('click', () => this.toggleDropdown());
        logoutLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) this.hideLoginModal();
            if (e.target === registerModal) this.hideRegisterModal();
            if (!profileMenu?.contains(e.target)) {
                dropdownMenu?.classList.remove('show');
            }
        });
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        registerModal.style.display = 'none';
        modal.style.display = 'block';
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.style.display = 'none';
    }

    showRegisterModal() {
        const modal = document.getElementById('registerModal');
        const loginModal = document.getElementById('loginModal');
        loginModal.style.display = 'none';
        modal.style.display = 'block';
    }

    hideRegisterModal() {
        const modal = document.getElementById('registerModal');
        modal.style.display = 'none';
    }

    toggleDropdown() {
        const dropdown = document.getElementById('dropdownMenu');
        dropdown.classList.toggle('show');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.hideLoginModal();
                this.showNotification('Successfully logged in!', 'success');
                
                // Refresh the page content
                if (window.twitterApp) {
                    window.twitterApp.loadTweets();
                }
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const displayName = document.getElementById('registerDisplayName').value;
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ display_name: displayName, username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.hideRegisterModal();
                this.showNotification('Account created successfully!', 'success');
                
                // Refresh the page content
                if (window.twitterApp) {
                    window.twitterApp.loadTweets();
                }
            } else {
                this.showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async handleLogout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.updateUI();
                this.showNotification('Successfully logged out!', 'success');
                
                // Clear the tweet feed
                if (window.twitterApp) {
                    window.twitterApp.clearFeed();
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed. Please try again.', 'error');
        }
    }

    checkAuthStatus() {
        // In a real app, you'd check with the server
        // For now, we'll assume user is not authenticated initially
        this.updateUI();
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const profileMenu = document.getElementById('profileMenu');
        const currentUserImg = document.getElementById('currentUserImg');
        const currentUserName = document.getElementById('currentUserName');
        const composeSection = document.getElementById('composeSection');

        if (this.isAuthenticated && this.currentUser) {
            // Hide login button, show profile menu
            loginBtn.style.display = 'none';
            profileMenu.style.display = 'flex';
            
            // Update user info
            currentUserImg.src = this.currentUser.avatar;
            currentUserName.textContent = this.currentUser.display_name;
            
            // Show compose section
            composeSection.style.display = 'flex';
            
            // Update compose avatar
            const composeAvatar = document.querySelector('.compose-tweet .avatar');
            if (composeAvatar) {
                composeAvatar.src = this.currentUser.avatar;
            }
        } else {
            // Show login button, hide profile menu
            loginBtn.style.display = 'block';
            profileMenu.style.display = 'none';
            
            // Hide compose section
            composeSection.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();