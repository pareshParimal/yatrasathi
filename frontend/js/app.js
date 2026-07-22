import { renderHome } from './pages/home.js';
import { renderPlanner } from './pages/planner.js';
import { renderPlaces } from './pages/places.js';
import { renderChat } from './pages/chat.js';
import { renderLogin } from './pages/login.js';
import { api } from './api.js';

class AppRouter {
    constructor() {
        this.routes = {
            'home': renderHome,
            'planner': renderPlanner,
            'places': renderPlaces,
            'chat': renderChat,
            'login': renderLogin
        };
        
        this.root = document.getElementById('content-root');
        
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Setup emergency button
        document.getElementById('btn-emergency').addEventListener('click', this.handleEmergency.bind(this));
        
        // Setup logout button
        const logoutBtn = document.getElementById('nav-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('yatra_user_id');
                window.location.hash = '#login';
            });
        }
        
        // Initial route
        this.handleRoute();
    }

    handleRoute() {
        let hash = window.location.hash.substring(1) || 'home';
        
        // Handle routes with params like places/123
        const parts = hash.split('/');
        const view = parts[0];
        const param = parts[1];

        // Auth Guard
        const userId = localStorage.getItem('yatra_user_id');
        if (!userId && view !== 'login') {
            window.location.hash = '#login';
            return;
        }
        
        // Auto-redirect away from login if already authenticated
        if (userId && view === 'login') {
            window.location.hash = '#home';
            return;
        }

        // Update nav active state
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const activeLink = document.getElementById(`nav-${view}`);
        if(activeLink) activeLink.classList.add('active');

        // Render view
        const renderFunc = this.routes[view] || this.routes['home'];
        
        // Show loading state
        this.root.innerHTML = `<div style="display: flex; justify-content: center; padding: 4rem;"><i data-lucide="loader-2" class="lucide-spin" style="width: 48px; height: 48px; color: var(--primary);"></i></div>`;
        lucide.createIcons();
        
        // Call render
        renderFunc(this.root, param).then(() => {
            lucide.createIcons();
        });
    }
    
    async handleEmergency() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        const btn = document.getElementById('btn-emergency');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sharing...';
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                await api.updateLocation(position.coords.latitude, position.coords.longitude);
                alert('Location shared successfully with your emergency contacts via Telegram.');
            } catch(e) {
                alert('Failed to share location.');
            } finally {
                btn.innerHTML = originalText;
                lucide.createIcons();
            }
        }, () => {
            alert('Unable to retrieve your location');
            btn.innerHTML = originalText;
            lucide.createIcons();
        });
    }
}

// Bootstrap app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppRouter();
});
