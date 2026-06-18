// SPA Core Application - Coordination, Router and overall State Management
import { CONFIG } from './config.js';
import { getUsers, getMatches, getPredictions, savePrediction, loginUser, registerUser, getMatchFantasyRound } from './firebase-db.js';
import { FixtureCard } from './components/fixtureCard.js';
import { JokerWallet } from './components/jokerWallet.js';
import { Leaderboard } from './components/leaderboard.js';
import { Stats } from './components/stats.js';
import { AdminPanel } from './components/adminPanel.js';
import { TournamentPrediction } from './components/tournamentPrediction.js';
import { UserProfile } from './components/userProfile.js';
import { FantasyLeague } from './components/fantasyLeague.js';
import { TeamsModal } from './components/teamsModal.js';

class App {
    constructor() {
        this.activeUser = null;
        this.matches = [];
        this.activeMatchIndex = 0;
        this.activeScreen = 'matches';

        // Instantiate Components
        this.fixtureCardComp = new FixtureCard('fixtures-list', this);
        this.jokerWalletComp = new JokerWallet('jokers-deck', this);
        this.leaderboardComp = new Leaderboard('leaderboard-container', this);
        this.statsComp = new Stats('stats-container', this);
        this.adminPanelComp = new AdminPanel('admin-container', this);
        this.tournamentPredictionComp = new TournamentPrediction('screen-tournament', this);
        this.userProfileComp = new UserProfile('user-profile-container', this);
        this.fantasyLeagueComp = new FantasyLeague('screen-fantasy', this);
        this.teamsModalComp = new TeamsModal('teams-modal', this);

        // Bind events
        this.initRouter();
        this.initAuth();
        this.initTheme();

        window.addEventListener('popstate', (e) => this.handlePopState(e));
    }

    async init() {
        console.log("Ultimate World Cup Tahmin Platformu Loading...");
        
        // Show Demo Mode warning badge if active
        const demoBadge = document.getElementById('demo-mode-badge');
        if (demoBadge && CONFIG.IS_DEMO_MODE) {
            demoBadge.classList.remove('hidden');
            demoBadge.classList.add('inline-flex');
        }
        
        if (!window.history.state) {
            window.history.replaceState({ screen: 'matches', modal: null }, '');
        }

        // 1. Fetch initial dataset
        await this.loadState();

        // 2. Check session
        const storedUserId = localStorage.getItem('ACTIVE_USER_ID');
        if (storedUserId) {
            const users = await getUsers();
            const user = users.find(u => u.id === storedUserId);
            if (user) {
                this.activeUser = user;
                const loginScreen = document.getElementById('screen-login');
                if (loginScreen) loginScreen.classList.add('hidden');
                this.updateHeaderUserPill();
                await this.refreshDashboard();
                this.updateFabVisibility();
            } else {
                this.showLoginScreen();
            }
        } else {
            this.showLoginScreen();
        }

        console.log("App successfully loaded!");
    }

    async loadState() {
        this.matches = await getMatches();
    }

    // Dynamic router switching screens
    initRouter() {
        const tabs = document.querySelectorAll('.nav-tab');
        const fantasyFab = document.getElementById('fantasy-fab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetScreen = tab.dataset.screen;
                this.navigateToScreen(targetScreen);
            });
        });



        // Bind Teams Button click
        const btnTeamsModal = document.getElementById('btn-teams-modal');
        if (btnTeamsModal) {
            btnTeamsModal.addEventListener('click', () => {
                this.teamsModalComp.open();
            });
        }

        // Rules screen back button
        const btnBackRules = document.getElementById('btn-back-to-matches-from-rules');
        if (btnBackRules) {
            btnBackRules.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    initAuth() {
        const loginBtn = document.getElementById('login-submit-btn');
        const registerBtn = document.getElementById('register-submit-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', async () => {
                const uInput = document.getElementById('login-username').value;
                const pInput = document.getElementById('login-password').value;
                if (!uInput || !pInput) {
                    alert("Kullanıcı adı ve şifre zorunludur!");
                    return;
                }
                const user = await loginUser(uInput, pInput);
                if (user) {
                    this.activeUser = user;
                    localStorage.setItem('ACTIVE_USER_ID', user.id);
                    document.getElementById('screen-login').classList.add('hidden');
                    this.updateHeaderUserPill();
                    await this.refreshDashboard();
                    this.updateFabVisibility();
                } else {
                    alert("Kullanıcı adı veya şifre hatalı!");
                }
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', async () => {
                const uInput = document.getElementById('login-username').value;
                const pInput = document.getElementById('login-password').value;
                if (!uInput || !pInput) {
                    alert("Kullanıcı adı ve şifre zorunludur!");
                    return;
                }
                try {
                    const newUser = await registerUser(uInput, pInput);
                    if (newUser) {
                        this.activeUser = newUser;
                        localStorage.setItem('ACTIVE_USER_ID', newUser.id);
                        document.getElementById('screen-login').classList.add('hidden');
                        this.updateHeaderUserPill();
                        await this.refreshDashboard();
                        this.updateFabVisibility();
                        alert("Kayıt başarıyla oluşturuldu! Hoş geldiniz 🏆");
                    }
                } catch (e) {
                    alert(e.message);
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('ACTIVE_USER_ID');
                this.activeUser = null;
                this.showLoginScreen();
            });
        }

        const userPill = document.getElementById('header-user-pill');
        if (userPill) {
            userPill.addEventListener('click', () => {
                this.navigateToScreen('user');
            });
        }
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('screen-login');
        const userPill = document.getElementById('header-user-pill');
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
        }
        if (userPill) {
            userPill.classList.remove('flex');
            userPill.classList.add('hidden');
        }
        // Reset login inputs
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    }

    updateHeaderUserPill() {
        const userPill = document.getElementById('header-user-pill');
        const userNameEl = document.getElementById('header-user-name');
        if (this.activeUser && userPill && userNameEl) {
            userNameEl.textContent = this.activeUser.name;
            userPill.classList.remove('hidden');
            userPill.classList.add('flex');
            
            // Re-bind Lucide icons for header user display
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    // Refresh everything when updates happen
    async refreshDashboard() {
        await this.loadState();
        
        // Refresh active user object to get updated joker counts or points
        const users = await getUsers();
        if (this.activeUser) {
            this.activeUser = users.find(u => u.id === this.activeUser.id) || this.activeUser;
            this.updateHeaderUserPill();
            
            // Initialize/load tournament predictions
            await this.tournamentPredictionComp.init();
        }

        // Render current active screens
        await this.renderActiveScreen();
    }

    navigateToScreen(screenName, pushState = true) {
        this.activeScreen = screenName;

        // Toggle active style on tabs
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(t => {
            if (screenName === t.dataset.screen) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        // Toggle visibility on screens
        const screens = document.querySelectorAll('.screen-content');
        screens.forEach(s => {
            if (s.id === `screen-${screenName}`) {
                s.classList.remove('hidden');
            } else {
                s.classList.add('hidden');
            }
        });

        // Toggle Joker FAB visibility: only show on Fixture ("matches") screen!
        const jokerFab = document.getElementById('joker-fab');
        if (jokerFab) {
            if (screenName === 'matches') {
                jokerFab.classList.remove('hidden');
            } else {
                this.jokerWalletComp.closeDrawer();
                jokerFab.classList.add('hidden');
            }
        }



        // Close match detail modal and teams modal if open
        const modal = document.getElementById('match-detail-modal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
        this.teamsModalComp.close();

        this.renderActiveScreen();

        if (pushState) {
            window.history.pushState({ screen: screenName, modal: null }, '');
        }
    }

    handlePopState(event) {
        const state = event.state;
        if (!state) {
            this.navigateToScreen('matches', false);
            this.closeAllModals();
            return;
        }

        if (state.screen && state.screen !== this.activeScreen) {
            this.navigateToScreen(state.screen, false);
        }

        this.syncModalsWithState(state);
    }

    closeAllModals() {
        const matchModal = document.getElementById('match-detail-modal');
        if (matchModal) {
            matchModal.classList.remove('active');
            this.fixtureCardComp.activeMatchId = null;
        }
        
        const teamsModal = document.getElementById('teams-modal');
        if (teamsModal) teamsModal.classList.remove('active');

        this.jokerWalletComp.closeDrawer();
    }

    syncModalsWithState(state) {
        const matchModal = document.getElementById('match-detail-modal');
        if (state.modal === 'match-detail') {
            const match = this.matches[state.matchIndex];
            if (match) {
                this.fixtureCardComp.isBackAction = true;
                this.fixtureCardComp.openMatchDetail(match, state.matchIndex);
                this.fixtureCardComp.isBackAction = false;
            }
        } else {
            if (matchModal && matchModal.classList.contains('active')) {
                if (this.fixtureCardComp.countdownInterval) {
                    clearInterval(this.fixtureCardComp.countdownInterval);
                }
                matchModal.classList.remove('active');
                this.fixtureCardComp.activeMatchId = null;
                // Only re-render fixture cards if we're on the matches screen
                if (this.activeScreen === 'matches') {
                    this.fixtureCardComp.render();
                }
            }
        }



        const teamsModal = document.getElementById('teams-modal');
        if (state.modal === 'teams') {
            teamsModal.classList.add('active');
            if (state.team) {
                this.teamsModalComp.activeTeam = state.team;
                this.teamsModalComp.render();
            } else {
                this.teamsModalComp.activeTeam = null;
                this.teamsModalComp.render();
            }
        } else {
            if (teamsModal && teamsModal.classList.contains('active')) {
                teamsModal.classList.remove('active');
            }
        }

        if (state.modal === 'joker-drawer') {
            this.jokerWalletComp.drawer.classList.add('active');
            this.jokerWalletComp.backdrop.classList.add('active');
            this.jokerWalletComp.render();
        } else {
            if (this.jokerWalletComp.drawer && this.jokerWalletComp.drawer.classList.contains('active')) {
                this.jokerWalletComp.drawer.classList.remove('active');
                this.jokerWalletComp.backdrop.classList.remove('active');
            }
        }
    }

    async renderActiveScreen() {
        if (this.activeScreen === 'matches') {
            await this.fixtureCardComp.render();
            this.jokerWalletComp.render();
        } else if (this.activeScreen === 'leaderboard') {
            await this.leaderboardComp.render();
        } else if (this.activeScreen === 'stats') {
            await this.statsComp.render();
        } else if (this.activeScreen === 'admin') {
            await this.adminPanelComp.render();
        } else if (this.activeScreen === 'tournament') {
            await this.tournamentPredictionComp.render();
        } else if (this.activeScreen === 'user') {
            await this.userProfileComp.render();
        } else if (this.activeScreen === 'fantasy') {
            const roundKey = this.getCurrentFantasyRound();
            await this.fantasyLeagueComp.init(roundKey);
        } else if (this.activeScreen === 'rules') {
            if (window.lucide) window.lucide.createIcons();
        }
    }

    getCurrentFantasyRound() {
        if (this.matches && this.matches.length > 0) {
            const currentMatch = this.matches.find(m => m.status !== 'FINISHED') || this.matches[this.matches.length - 1];
            if (currentMatch) {
                return getMatchFantasyRound(currentMatch, this.matches) || 'round_1';
            }
        }
        return 'round_1';
    }

    // Orchestrates drag-and-drop joker logic
    async applyJokerToActiveMatch(jokerType) {
        const activeMatch = this.matches[this.activeMatchIndex];
        if (!activeMatch) return;

        if (activeMatch.status === 'FINISHED') {
            alert("Maç bittiği için joker uygulayamazsınız!");
            return;
        }

        // Fallback or forward to wallet execution
        await this.jokerWalletComp.executeJokerApplication(jokerType, activeMatch.id);
    }

    initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        const htmlEl = document.documentElement;
        const themeIcon = document.getElementById('theme-icon');

        // Load theme from localStorage (default to dark)
        const storedTheme = localStorage.getItem('THEME') || 'dark';
        if (storedTheme === 'light') {
            htmlEl.classList.remove('dark');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
        } else {
            htmlEl.classList.add('dark');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
        }
        if (window.lucide) window.lucide.createIcons();

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (htmlEl.classList.contains('dark')) {
                    htmlEl.classList.remove('dark');
                    localStorage.setItem('THEME', 'light');
                    if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
                } else {
                    htmlEl.classList.add('dark');
                    localStorage.setItem('THEME', 'dark');
                    if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
                }
                if (window.lucide) window.lucide.createIcons();
            });
        }
    }

    /**
     * Extracts a YYYY-MM-DD date key from a match date string.
     */
    getDateKey(dateStr) {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Show/hide FABs based on active screen. Called on init and after login.
     */
    updateFabVisibility() {
        const jokerFab = document.getElementById('joker-fab');
        const showFabs = this.activeScreen === 'matches';

        if (jokerFab) {
            jokerFab.classList.toggle('hidden', !showFabs);
        }
    }
}

// Start application on DOM Load
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
