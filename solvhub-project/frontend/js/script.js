// API Base URL - Dynamic
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3000/api`
    : `${window.location.origin}/api`;

// Utility for state management and auth
const State = {
    getUser: () => {
        const user = localStorage.getItem('solvhub_user');
        return user ? JSON.parse(user) : null;
    },
    setUser: (user) => {
        if (user) {
            localStorage.setItem('solvhub_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('solvhub_user');
        }
    },
    logout: () => {
        localStorage.removeItem('solvhub_user');
        window.location.href = 'index.html';
    }
};

// Update Navigation based on login state
function updateNavigation() {
    const user = State.getUser();
    const navButtons = document.getElementById('nav-buttons');
    if (!navButtons) return;
    
    if (user) {
        let dashboardLink = user.role === 'provider' ? 'dashboard.html' : 'index.html';
        let customButtons = user.role === 'provider' ? `<a href="${dashboardLink}" class="btn btn-outline">Dashboard</a>` : '';
        
        navButtons.innerHTML = `
            ${customButtons}
            <span style="font-weight: 600; margin-right: 15px;">Hi, ${user.name.split(' ')[0]}</span>
            <button onclick="State.logout()" class="btn btn-primary">Logout</button>
        `;
    } else {
        const isRegisterPage = window.location.pathname.includes('register.html');

        navButtons.innerHTML = `
            ${!isRegisterPage ? '<a href="register.html" class="btn btn-primary">Join as Provider</a>' : ''}
        `;
    }
}

// Mobile Menu Toggle
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navButtons = document.getElementById('nav-buttons');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
                if(navButtons) navButtons.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '4.5rem';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = 'white';
                navLinks.style.padding = '1rem';
                navLinks.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                
                if(navButtons) {
                    navButtons.style.display = 'flex';
                    navButtons.style.flexDirection = 'column';
                    navButtons.style.width = '100%';
                    navButtons.style.padding = '0 1rem 1rem';
                    navButtons.style.backgroundColor = 'white';
                    navButtons.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    setupMobileMenu();
});

// Reusable alert function
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.padding = '15px 25px';
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.color = 'white';
    alertDiv.style.fontWeight = 'bold';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.transition = 'all 0.3s ease';
    alertDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    
    if (type === 'success') alertDiv.style.backgroundColor = '#10B981';
    if (type === 'error') alertDiv.style.backgroundColor = '#EF4444';
    if (type === 'warning') alertDiv.style.backgroundColor = '#F59E0B';
    
    alertDiv.innerText = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}
