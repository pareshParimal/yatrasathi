import { renderHome } from './pages/home.js?v=7';
import { renderPlanner } from './pages/planner.js?v=7';
import { renderPlaces } from './pages/places.js?v=7';
import { renderChat } from './pages/chat.js?v=7';
import { renderLogin } from './pages/login.js?v=7';
import { api } from './api.js?v=7';
import { applyTranslations } from './i18n.js?v=7';

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
    //    document.getElementById('btn-emergency').addEventListener('click', this.handleEmergency.bind(this));
        
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

        // Setup Language Switcher
        const langSwitcher = document.getElementById('lang-switcher');
        const currentLang = localStorage.getItem('yatra_lang') || 'hi';
        langSwitcher.value = currentLang;

        langSwitcher.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            localStorage.setItem('yatra_lang', newLang);
            applyTranslations(newLang);
            
            // If user is logged in, sync with backend
            const uid = localStorage.getItem('yatra_user_id');
            if (uid) {
                try {
                    await api.updateLanguagePref(newLang);
                } catch (err) {
                    console.error("Failed to sync language preference", err);
                }
            }
        });

        // Apply translations on initial load
        setTimeout(() => applyTranslations(currentLang), 100);
    }

    handleRoute() {
        let hash = window.location.hash.substring(1) || 'chat';
        
        // Handle routes with params like places/123
        const parts = hash.split('/');
        const view = parts[0];
        const param = parts[1];

        // Auth Guard
        const userId = localStorage.getItem('yatra_user_id');

        const logoutBtn = document.getElementById('nav-logout');
     //   const emergencyBtn = document.getElementById('btn-emergency');

        if (userId) {
            logoutBtn.style.display = 'block';
  //          emergencyBtn.style.display = 'block';
        } else {
            logoutBtn.style.display = 'none';
   //         emergencyBtn.style.display = 'none';
        }
        // Default route logic
        if (window.location.hash === '') {
            window.location.hash = api.isAuthenticated() ? '#chat' : '#login';
        }
        if (!userId && view !== 'login') {
            window.location.hash = '#login';
            return;
        }
        
        // Auto-redirect away from login if already authenticated
        if (userId && view === 'login') {
            window.location.hash = '#chat';
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
        Promise.resolve(renderFunc(this.root, param)).then(() => {
            lucide.createIcons();
        }).catch(err => {
            console.error("Render failed:", err);
            this.root.innerHTML = `<div style="padding: 2rem; color: red;">Failed to load view.</div>`;
        });

        // Apply translations after rendering the new page
        setTimeout(() => {
            applyTranslations(localStorage.getItem('yatra_lang') || 'hi');
        }, 50);
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
