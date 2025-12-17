// Landing page functionality
document.addEventListener('DOMContentLoaded', function() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    const signInBtn = document.getElementById('signInBtn');
    
    // Demo account info
    const demoUsers = [
        { username: 'johndoe', password: 'password123' },
        { username: 'sarahchen', password: 'password123' },
        { username: 'mikejohnson', password: 'password123' },
        { username: 'emilywright', password: 'password123' },
        { username: 'alexkim', password: 'password123' }
    ];
    
    // Auto-fill demo credentials
    function fillDemoCredentials() {
        const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        const usernameField = document.getElementById('loginUsername');
        const passwordField = document.getElementById('loginPassword');
        
        if (usernameField && passwordField) {
            usernameField.value = randomUser.username;
            passwordField.value = randomUser.password;
        }
    }
    
    // Show login with demo credentials when sign in is clicked
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            setTimeout(fillDemoCredentials, 100);
        });
    }
    
    // Add some visual effects
    function addParallaxEffect() {
        const logo = document.querySelector('.twitter-logo i');
        if (logo) {
            document.addEventListener('mousemove', (e) => {
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;
                
                const rotateX = (mouseY - 0.5) * 10;
                const rotateY = (mouseX - 0.5) * -10;
                
                logo.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        }
    }
    
    addParallaxEffect();
    
    // Animated typing effect for hero title
    function typeWriter() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.textContent = '';
            heroTitle.style.borderRight = '2px solid white';
            
            let i = 0;
            const timer = setInterval(() => {
                heroTitle.textContent += text.charAt(i);
                i++;
                
                if (i > text.length) {
                    clearInterval(timer);
                    heroTitle.style.borderRight = 'none';
                }
            }, 100);
        }
    }
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 500);
});