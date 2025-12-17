// Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.setupModalHandlers();
        this.setupFormHandlers();
        this.checkAuthentication();
    }

    setupModalHandlers() {
        const loginBtn = document.getElementById('loginBtn');
        const signInBtn = document.getElementById('signInBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        const closeLogin = document.getElementById('closeLogin');
        const closeRegister = document.getElementById('closeRegister');
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');

        // Show login modal
        if (loginBtn) loginBtn.addEventListener('click', () => this.showModal('login'));
        if (signInBtn) signInBtn.addEventListener('click', () => this.showModal('login'));
        if (getStartedBtn) getStartedBtn.addEventListener('click', () => this.showModal('register'));

        // Close modals
        if (closeLogin) closeLogin.addEventListener('click', () => this.hideModal('login'));
        if (closeRegister) closeRegister.addEventListener('click', () => this.hideModal('register'));

        // Switch between modals
        if (showRegister) showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('login');
            this.showModal('register');
        });

        if (showLogin) showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('register');
            this.showModal('login');
        });

        // Close modal on backdrop click
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) this.hideModal('login');
            });
        }

        if (registerModal) {
            registerModal.addEventListener('click', (e) => {
                if (e.target === registerModal) this.hideModal('register');
            });
        }
    }

    setupFormHandlers() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Setup logout
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    showModal(type) {
        const modal = document.getElementById(type === 'login' ? 'loginModal' : 'registerModal');
        if (modal) {
            modal.style.display = 'block';
            // Focus on first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    hideModal(type) {
        const modal = document.getElementById(type === 'login' ? 'loginModal' : 'registerModal');
        if (modal) {
            modal.style.display = 'none';
        }
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
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.hideModal('login');
                this.showNotification('Welcome back!', 'success');
                window.location.href = '/home';
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

        // Basic validation
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    display_name: displayName,
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.hideModal('register');
                this.showNotification('Account created successfully!', 'success');
                window.location.href = '/home';
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
                this.showNotification('Logged out successfully', 'success');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed', 'error');
        }
    }

    checkAuthentication() {
        // This will be called to check if user is authenticated
        // In a real app, you might check a JWT token or session
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.authManager = authManager;
}