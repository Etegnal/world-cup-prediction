// User Profile & Predictions History Component
import { getGroupPredictions, getBracketPredictions, getPredictions } from '../firebase-db.js';
import { CONFIG } from '../config.js';

export class UserProfile {
    constructor(containerId, appState) {
        this.container = document.getElementById(containerId);
        this.appState = appState;
        this.activeTab = 'matches'; // 'matches', 'groups', 'bracket'
    }

    async render() {
        if (!this.appState.activeUser) {
            this.container.innerHTML = `
                <div class="text-center py-20 gap-3 flex flex-col items-center justify-center">
                    <i data-lucide="lock" class="w-8 h-8 text-slate-600 animate-bounce"></i>
                    <span class="text-xs text-slate-400 font-medium">Lütfen profilinizi görüntülemek için giriş yapınız.</span>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const userId = this.appState.activeUser.id;
        const user = this.appState.activeUser;
        const matches = this.appState.matches;

        // Fetch user predictions
        let userPredictions = [];
        let allPredictions = [];
        try {
            allPredictions = await getPredictions();
            userPredictions = allPredictions.filter(p => p.userId === userId);
        } catch (e) {
            console.error("Tahminler yüklenirken hata oluştu:", e);
        }

        // Fetch group and bracket predictions
        let userGroupPred = null;
        let userBracketPred = null;
        try {
            userGroupPred = await getGroupPredictions(userId);
            userBracketPred = await getBracketPredictions(userId);
        } catch (e) {
            console.error("Grup/Eleme tahminleri yüklenirken hata oluştu:", e);
        }

        // 1. Profile Summary & Header
        let badgeText = "Tahminci ⚽";
        let badgeClass = "user-badge-member";
        if (user.badge === "kahin") {
            badgeText = "Kâhin 🏆";
            badgeClass = "user-badge-kahin animate-pulse";
        } else if (user.badge === "aglayan") {
            badgeText = "Ağlayan 😢";
            badgeClass = "user-badge-aglayan";
        }

        // Extract initials for placeholder avatar if needed
        const initials = user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);

        this.container.innerHTML = `
            <!-- Profile Hero Card -->
            <div class="bg-brand-card glassmorphism p-5 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                <div class="absolute -top-16 -right-16 w-36 h-36 bg-brand-cyan/10 blur-[35px] rounded-full pointer-events-none"></div>
                <div class="absolute -bottom-16 -left-16 w-36 h-36 bg-brand-gold/5 blur-[35px] rounded-full pointer-events-none"></div>
                
                <div class="flex items-center gap-4 relative z-10">
                    <!-- Avatar -->
                    <div class="w-16 h-16 rounded-2xl ${user.avatar || 'bg-gradient-to-tr from-cyan-500 to-blue-500'} flex items-center justify-center text-white font-outfit font-black text-xl shadow-lg border border-white/20">
                        ${initials}
                    </div>
                    <!-- User Details -->
                    <div class="flex-grow">
                        <h3 class="text-base font-outfit font-black text-white leading-tight uppercase">${user.name}</h3>
                        <div class="flex items-center gap-2 mt-1.5">
                            <span class="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeClass}">
                                ${badgeText}
                            </span>
                            <span class="text-[9px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                ${user.points || 0} Puan
                            </span>
                        </div>
                    </div>
                    
                    <!-- Admin Panel Button -->
                    <button id="profile-admin-btn" class="w-9 h-9 rounded-xl bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold hover:text-white flex items-center justify-center border border-brand-gold/20 hover:border-brand-gold/40 transition-all active:scale-95 cursor-pointer mr-1.5" title="Yönetici Paneli 🛠️">
                        <i data-lucide="settings" class="w-4 h-4"></i>
                    </button>

                    <!-- Logout Button -->
                    <button id="profile-logout-btn" class="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center border border-red-500/20 hover:border-red-500/40 transition-all active:scale-95 cursor-pointer" title="Çıkış Yap">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- User Jokers Wallet Summary -->
            <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-2.5 shadow-inner">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">Joker Cüzdanı</span>
                <div class="grid grid-cols-3 gap-2">
                    ${this.renderJokerPills(user.jokers)}
                </div>
            </div>

            <!-- SPA Sub-tab Navigation -->
            <div class="flex bg-slate-950/60 rounded-2xl p-1 text-[9px] font-bold uppercase gap-1 border border-white/5 shadow-inner">
                <button id="profile-tab-matches" class="flex-grow py-2.5 rounded-xl text-center transition-all ${this.activeTab === 'matches' ? 'bg-brand-cyan text-black font-black font-extrabold shadow-neon-cyan' : 'text-slate-400'}" type="button">
                    ⚽ Maç Tahminleri
                </button>
                <button id="profile-tab-groups" class="flex-grow py-2.5 rounded-xl text-center transition-all ${this.activeTab === 'groups' ? 'bg-brand-cyan text-black font-black font-extrabold shadow-neon-cyan' : 'text-slate-400'}" type="button">
                    📊 Grup Tahminleri
                </button>
                <button id="profile-tab-bracket" class="flex-grow py-2.5 rounded-xl text-center transition-all ${this.activeTab === 'bracket' ? 'bg-brand-cyan text-black font-black font-extrabold shadow-neon-cyan' : 'text-slate-400'}" type="button">
                    🏆 Elemeler & Şampiyon
                </button>
            </div>

            <!-- Tab Content Container -->
            <div id="profile-tab-content" class="flex flex-col gap-4">
                <!-- Loaded dynamically below -->
            </div>
        `;

        // Bind core click events
        this.bindEvents();

        // Render selected tab contents
        const contentDiv = document.getElementById('profile-tab-content');
        if (this.activeTab === 'matches') {
            await this.renderMatchesTab(contentDiv, matches, userPredictions, allPredictions);
        } else if (this.activeTab === 'groups') {
            this.renderGroupsTab(contentDiv, matches, userGroupPred);
        } else if (this.activeTab === 'bracket') {
            this.renderBracketTab(contentDiv, matches, userBracketPred);
        }

        if (window.lucide) window.lucide.createIcons();
    }

    renderJokerPills(jokers) {
        if (!jokers) return '';
        const namesMap = {
            ciftesans: { name: "Çifte Şans", icon: "shuffle" },
            doublepuan: { name: "Double Puan", icon: "chevrons-up" },
            allin: { name: "All In", icon: "rocket" },
            spy: { name: "Casus", icon: "eye" },
            doksanarti: { name: "90+ Gol", icon: "clock" },
            sabotaj: { name: "Sabotaj", icon: "bomb" }
        };

        return Object.entries(jokers).map(([key, count]) => {
            const info = namesMap[key] || { name: key, icon: "sparkles" };
            return `
                <div class="profile-joker-card flex flex-col p-2.5 rounded-xl border border-white/5 items-center justify-center text-center">
                    <i data-lucide="${info.icon}" class="w-3.5 h-3.5 text-brand-gold mb-1"></i>
                    <span class="text-[8px] font-bold text-slate-300 truncate max-w-full">${info.name}</span>
                    <span class="text-[10px] font-black text-brand-cyan mt-0.5">${count} adet</span>
                </div>
            `;
        }).join('');
    }

    bindEvents() {
        // Logout button
        const logoutBtn = document.getElementById('profile-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm("Oturumu kapatmak istediğinizden emin misiniz?")) {
                    localStorage.removeItem('ACTIVE_USER_ID');
                    this.appState.activeUser = null;
                    this.appState.showLoginScreen();
                }
            });
        }

        // Admin Panel button
        const adminBtn = document.getElementById('profile-admin-btn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.appState.navigateToScreen('admin');
            });
        }

        // Sub tabs clicks
        const tabMatches = document.getElementById('profile-tab-matches');
        const tabGroups = document.getElementById('profile-tab-groups');
        const tabBracket = document.getElementById('profile-tab-bracket');

        if (tabMatches && tabGroups && tabBracket) {
            tabMatches.addEventListener('click', () => {
                this.activeTab = 'matches';
                this.render();
            });
            tabGroups.addEventListener('click', () => {
                this.activeTab = 'groups';
                this.render();
            });
            tabBracket.addEventListener('click', () => {
                this.activeTab = 'bracket';
                this.render();
            });
        }

        // Back to matches button
        const backBtn = document.getElementById('btn-back-to-matches-from-user');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    // --- RENDER TAB 1: MATCH PREDICTIONS ---
    async renderMatchesTab(container, matches, userPredictions, allPredictions) {
        // Separate matches
        const completedMatches = matches.filter(m => m.status === 'FINISHED')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        const activeMatches = matches.filter(m => m.status !== 'FINISHED')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        let html = '';

        // Section 1: Completed predictions
        html += `<h4 class="text-xs font-outfit font-black tracking-wider text-slate-800 dark:text-slate-200 mt-2 uppercase">Oynanmış Maçlar (${completedMatches.length})</h4>`;
        
        if (completedMatches.length === 0) {
            html += `
                <div class="p-5 text-center bg-slate-900/10 border border-dashed border-white/10 rounded-2xl text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Henüz tamamlanan maç bulunmuyor.
                </div>
            `;
        } else {
            html += `<div class="flex flex-col gap-3">`;
            completedMatches.forEach(match => {
                const pred = userPredictions.find(p => p.matchId === match.id);
                
                // Calculate points details
                let ptsDetail = { pts: 0, isExact: false, isOutcomeCorrect: false, isOutcomeAltCorrect: false };
                let isOutcomeCorrect = false;

                if (pred) {
                    ptsDetail = this.calculateMatchPts(pred, match, allPredictions);
                    isOutcomeCorrect = ptsDetail.isOutcomeCorrect || ptsDetail.isOutcomeAltCorrect;
                }

                const cardClass = pred 
                    ? (isOutcomeCorrect ? 'prediction-correct' : 'prediction-incorrect')
                    : 'prediction-incorrect';

                const flagHome = match.homeFlag || "https://flagcdn.com/un.svg";
                const flagAway = match.awayFlag || "https://flagcdn.com/un.svg";

                // Format prediction text
                let predText = '';
                let jokerLabel = '';
                if (pred) {
                    if (pred.appliedJoker === 'ciftesans') {
                        predText = `<span class="font-extrabold text-white">${pred.homeScorePred}-${pred.awayScorePred}</span> veya <span class="font-extrabold text-white">${pred.homeScorePredAlt}-${pred.awayScorePredAlt}</span>`;
                        jokerLabel = `<span class="text-[8px] font-black text-slate-900 bg-brand-cyan px-2 py-0.5 rounded-full uppercase tracking-wider">Çifte Şans 🔀</span>`;
                    } else {
                        predText = `<span class="font-extrabold text-white">${pred.homeScorePred} - ${pred.awayScorePred}</span>`;
                        if (pred.appliedJoker === 'doublepuan') {
                            jokerLabel = `<span class="text-[8px] font-black text-black bg-brand-gold px-2 py-0.5 rounded-full uppercase tracking-wider">Double Puan ✖2</span>`;
                        } else if (pred.appliedJoker === 'allin') {
                            jokerLabel = `<span class="text-[8px] font-black text-white bg-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">All In 🚀</span>`;
                        }
                    }
                } else {
                    predText = `<span class="text-slate-500 font-bold italic">Tahmin Yapılmadı</span>`;
                }

                const gotWinnerSign = pred && isOutcomeCorrect 
                    ? `<div class="flex items-center gap-1 text-[9px] font-black text-brand-green bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider"><i data-lucide="check" class="w-3 h-3 text-brand-green"></i> Kazandı</div>` 
                    : `<div class="flex items-center gap-1 text-[9px] font-black text-brand-red bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider"><i data-lucide="x" class="w-3 h-3 text-brand-red"></i> Kaybetti</div>`;

                const ptsFormatted = ptsDetail.pts >= 0 ? `+${ptsDetail.pts}` : `${ptsDetail.pts}`;
                const ptsBubbleColor = ptsDetail.pts > 0 ? 'text-brand-green border-green-500/30 bg-green-500/10' : (ptsDetail.pts < 0 ? 'text-brand-red border-red-500/30 bg-red-500/10' : 'text-slate-400 border-white/10 bg-white/5');

                html += `
                    <div class="w-full p-4 rounded-[1.5rem] border ${cardClass} relative overflow-hidden flex flex-col gap-2.5">
                        <!-- Top Row: Date, Joker & Pts bubble -->
                        <div class="flex justify-between items-center pb-2 border-b border-white/5">
                            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                            <div class="flex items-center gap-2">
                                ${jokerLabel}
                                ${gotWinnerSign}
                                <span class="text-[10px] font-black border px-2.5 py-0.5 rounded-full ${ptsBubbleColor}">${ptsFormatted} Puan</span>
                            </div>
                        </div>
                        
                        <!-- Middle Row: Match layout -->
                        <div class="grid grid-cols-3 items-center text-center">
                            <!-- Home -->
                            <div class="flex flex-col items-center gap-1 justify-center">
                                <img src="${flagHome}" class="w-8 h-5.5 object-cover rounded shadow border border-white/10" alt="">
                                <span class="text-[10px] font-black text-slate-200 uppercase tracking-tight truncate max-w-[100px]">${match.homeTeam}</span>
                            </div>
                            
                            <!-- Score -->
                            <div class="flex flex-col items-center">
                                <span class="text-sm font-outfit font-black text-white tracking-widest">${match.homeScore} - ${match.awayScore}</span>
                                <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">BİTTİ</span>
                            </div>
                            
                            <!-- Away -->
                            <div class="flex flex-col items-center gap-1 justify-center">
                                <img src="${flagAway}" class="w-8 h-5.5 object-cover rounded shadow border border-white/10" alt="">
                                <span class="text-[10px] font-black text-slate-200 uppercase tracking-tight truncate max-w-[100px]">${match.awayTeam}</span>
                            </div>
                        </div>
                        
                        <!-- Prediction Row -->
                        <div class="flex justify-between items-center pt-2 border-t border-white/5 text-[9px]">
                            <span class="font-bold text-slate-400 uppercase tracking-widest">Tahmininiz:</span>
                            <span>${predText}</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Section 2: Future predictions
        html += `<h4 class="text-xs font-outfit font-black tracking-wider text-slate-800 dark:text-slate-200 mt-4 uppercase">Gelecek Maç Tahminleri (${activeMatches.length})</h4>`;

        if (activeMatches.length === 0) {
            html += `
                <div class="p-5 text-center bg-slate-900/10 border border-dashed border-white/10 rounded-2xl text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Gelecekte oynanacak aktif maç bulunmuyor.
                </div>
            `;
        } else {
            html += `<div class="flex flex-col gap-3">`;
            activeMatches.forEach(match => {
                const pred = userPredictions.find(p => p.matchId === match.id);

                const flagHome = match.homeFlag || "https://flagcdn.com/un.svg";
                const flagAway = match.awayFlag || "https://flagcdn.com/un.svg";

                // Format prediction text
                let predText = '';
                let jokerLabel = '';
                if (pred) {
                    if (pred.appliedJoker === 'ciftesans') {
                        predText = `<span class="font-extrabold text-white">${pred.homeScorePred}-${pred.awayScorePred}</span> veya <span class="font-extrabold text-white">${pred.homeScorePredAlt}-${pred.awayScorePredAlt}</span>`;
                        jokerLabel = `<span class="text-[8px] font-black text-slate-900 bg-brand-cyan px-2 py-0.5 rounded-full uppercase tracking-wider">Çifte Şans 🔀</span>`;
                    } else {
                        predText = `<span class="font-extrabold text-white">${pred.homeScorePred} - ${pred.awayScorePred}</span>`;
                        if (pred.appliedJoker === 'doublepuan') {
                            jokerLabel = `<span class="text-[8px] font-black text-black bg-brand-gold px-2 py-0.5 rounded-full uppercase tracking-wider">Double Puan ✖2</span>`;
                        } else if (pred.appliedJoker === 'allin') {
                            jokerLabel = `<span class="text-[8px] font-black text-white bg-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">All In 🚀</span>`;
                        }
                    }
                } else {
                    predText = `<span class="text-slate-500 font-bold italic">Tahmin Yapılmadı</span>`;
                }

                html += `
                    <div class="w-full p-4 rounded-[1.5rem] border prediction-pending relative overflow-hidden flex flex-col gap-2.5">
                        <!-- Top Row: Date, Joker & Pts bubble -->
                        <div class="flex justify-between items-center pb-2 border-b border-white/5">
                            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} ${new Date(match.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            <div class="flex items-center gap-2">
                                ${jokerLabel}
                                <span class="text-[9px] font-black border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan px-2.5 py-0.5 rounded-full uppercase tracking-wider">Bekliyor ⏳</span>
                            </div>
                        </div>
                        
                        <!-- Middle Row: Match layout -->
                        <div class="grid grid-cols-3 items-center text-center">
                            <!-- Home -->
                            <div class="flex flex-col items-center gap-1 justify-center">
                                <img src="${flagHome}" class="w-8 h-5.5 object-cover rounded shadow border border-white/10" alt="">
                                <span class="text-[10px] font-black text-slate-200 uppercase tracking-tight truncate max-w-[100px]">${match.homeTeam}</span>
                            </div>
                            
                            <!-- VS -->
                            <div class="flex flex-col items-center">
                                <span class="text-[10px] font-black text-slate-400 tracking-wider">VS</span>
                                ${match.group ? `<span class="text-[8px] font-black text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-full mt-1">GRUP ${match.group}</span>` : ''}
                            </div>
                            
                            <!-- Away -->
                            <div class="flex flex-col items-center gap-1 justify-center">
                                <img src="${flagAway}" class="w-8 h-5.5 object-cover rounded shadow border border-white/10" alt="">
                                <span class="text-[10px] font-black text-slate-200 uppercase tracking-tight truncate max-w-[100px]">${match.awayTeam}</span>
                            </div>
                        </div>
                        
                        <!-- Prediction Row -->
                        <div class="flex justify-between items-center pt-2 border-t border-white/5 text-[9px]">
                            <span class="font-bold text-slate-400 uppercase tracking-widest">Tahmininiz:</span>
                            <span>${predText}</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        container.innerHTML = html;
    }

    // --- RENDER TAB 2: GROUP PREDICTIONS ---
    renderGroupsTab(container, matches, userGroupPred) {
        if (!userGroupPred || Object.keys(userGroupPred).length === 0) {
            container.innerHTML = `
                <div class="w-full flex flex-col items-center justify-center p-8 text-center glassmorphism rounded-[2rem] border border-white/10 shadow-2xl mt-4 relative overflow-hidden">
                    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-cyan/20 blur-[50px] pointer-events-none"></div>
                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
                        <i data-lucide="table" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-sm font-outfit font-black text-white uppercase tracking-wider mb-1">Grup Tahmini Bulunmamaktadır</h3>
                    <p class="text-[10px] text-slate-400 max-w-[240px] leading-relaxed mb-6 font-medium">
                        Gruplara ait sıralama tahminlerinizi henüz tamamlamadınız.
                    </p>
                    <button id="profile-go-predict-btn" class="px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md">
                        Tahminleri Başlat ➔
                    </button>
                </div>
            `;

            const btn = document.getElementById('profile-go-predict-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.appState.navigateToScreen('tournament');
                });
            }
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // We have group predictions, display them
        let html = '';
        html += `<h4 class="text-xs font-outfit font-black tracking-wider text-slate-800 dark:text-slate-200 mt-2 uppercase">Grup Sıralama Tahminleriniz</h4>`;
        html += `<p class="text-[9px] text-slate-400 leading-relaxed pl-1 -mt-1 mb-2">Grup maçları bittikten sonra doğru konumlar yeşil renkte vurgulanır. Doğru konum tahmini başına 1 puan kazanırsınız.</p>`;

        // Calculate actual standings to evaluate correctness
        // Check which teams exist in matches to construct teams mapping
        const teamInfoMap = {};
        matches.forEach(m => {
            if (m.homeTeam) teamInfoMap[m.homeTeam] = { code: m.homeTeamCode, flag: m.homeFlag };
            if (m.awayTeam) teamInfoMap[m.awayTeam] = { code: m.awayTeamCode, flag: m.awayFlag };
        });

        // Group letters
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        const standings = {};
        
        // Compute group points
        matches.forEach(m => {
            if (!m.group) return;
            if (!standings[m.group]) standings[m.group] = {};
            if (!standings[m.group][m.homeTeam]) {
                standings[m.group][m.homeTeam] = { name: m.homeTeam, pts: 0, gd: 0, gs: 0 };
            }
            if (!standings[m.group][m.awayTeam]) {
                standings[m.group][m.awayTeam] = { name: m.awayTeam, pts: 0, gd: 0, gs: 0 };
            }
            
            if (m.status === 'FINISHED') {
                const h = parseInt(m.homeScore) || 0;
                const a = parseInt(m.awayScore) || 0;
                standings[m.group][m.homeTeam].gs += h;
                standings[m.group][m.awayTeam].gs += a;
                standings[m.group][m.homeTeam].gd += (h - a);
                standings[m.group][m.awayTeam].gd += (a - h);
                
                if (h > a) standings[m.group][m.homeTeam].pts += 3;
                else if (h < a) standings[m.group][m.awayTeam].pts += 3;
                else {
                    standings[m.group][m.homeTeam].pts += 1;
                    standings[m.group][m.awayTeam].pts += 1;
                }
            }
        });

        const actualStandings = {};
        for (const [gL, gTeams] of Object.entries(standings)) {
            actualStandings[gL] = Object.values(gTeams).sort((a,b) => {
                if (b.pts !== a.pts) return b.pts - a.pts;
                if (b.gd !== a.gd) return b.gd - a.gd;
                if (b.gs !== a.gs) return b.gs - a.gs;
                return a.name.localeCompare(b.name);
            });
        }

        html += `<div class="grid grid-cols-2 gap-3">`;

        groupLetters.forEach(gL => {
            const predTeams = userGroupPred[gL] || [];
            const groupMatches = matches.filter(m => m.group === gL);
            const isGroupFinished = groupMatches.length > 0 && groupMatches.every(m => m.status === 'FINISHED');
            const actualTeams = actualStandings[gL] || [];

            html += `
                <div class="bg-brand-card glassmorphism p-3.5 rounded-[1.5rem] border border-white/5 flex flex-col gap-2">
                    <span class="text-[10px] font-outfit font-black text-brand-cyan uppercase tracking-wider block border-b border-white/5 pb-1">Grup ${gL}</span>
                    <div class="flex flex-col gap-1.5">
            `;

            predTeams.forEach((teamName, index) => {
                const tInfo = teamInfoMap[teamName] || { code: 'N/A', flag: 'https://flagcdn.com/un.svg' };
                const medalMap = ["🥇", "🥈", "🥉", "⚽"];
                
                let rowBg = 'bg-white/5';
                let borderStyle = 'border-white/5';
                let badgeHtml = '';

                if (isGroupFinished && actualTeams.length === 4) {
                    const isCorrect = actualTeams[index]?.name === teamName;
                    if (isCorrect) {
                        rowBg = 'bg-green-500/15';
                        borderStyle = 'border-green-500/25';
                        badgeHtml = '<i data-lucide="check" class="w-3 h-3 text-brand-green"></i>';
                    } else {
                        rowBg = 'bg-red-500/10';
                        borderStyle = 'border-red-500/15';
                        badgeHtml = '<i data-lucide="x" class="w-3 h-3 text-brand-red"></i>';
                    }
                }

                html += `
                    <div class="flex items-center justify-between p-1.5 rounded-lg border ${borderStyle} ${rowBg} text-[9px] font-bold">
                        <div class="flex items-center gap-1.5 truncate">
                            <span class="mr-1">${medalMap[index]}</span>
                            <img src="${tInfo.flag}" class="w-4 h-3 object-cover rounded shadow-sm" alt="">
                            <span class="text-slate-200 truncate uppercase tracking-tight">${teamName}</span>
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                            <span class="text-[8px] text-slate-400 uppercase font-black">${tInfo.code}</span>
                            ${badgeHtml}
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    // --- RENDER TAB 3: BRACKET & CHAMPION ---
    renderBracketTab(container, matches, userBracketPred) {
        if (!userBracketPred || !userBracketPred.final || !userBracketPred.final['match-final-1']) {
            container.innerHTML = `
                <div class="w-full flex flex-col items-center justify-center p-8 text-center glassmorphism rounded-[2rem] border border-white/10 shadow-2xl mt-4 relative overflow-hidden">
                    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-cyan/20 blur-[50px] pointer-events-none"></div>
                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
                        <i data-lucide="trophy" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-sm font-outfit font-black text-white uppercase tracking-wider mb-1">Eşleşme Tahminleri Bulunmamaktadır</h3>
                    <p class="text-[10px] text-slate-400 max-w-[240px] leading-relaxed mb-6 font-medium">
                        Eleme ağacını çizip şampiyonunuzu henüz belirlemediniz.
                    </p>
                    <button id="profile-go-bracket-btn" class="px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md">
                        Eleme Tahminlerini Yap ➔
                    </button>
                </div>
            `;

            const btn = document.getElementById('profile-go-bracket-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.appState.navigateToScreen('tournament');
                });
            }
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const teamInfoMap = {};
        matches.forEach(m => {
            if (m.homeTeam) teamInfoMap[m.homeTeam] = { code: m.homeTeamCode, flag: m.homeFlag };
            if (m.awayTeam) teamInfoMap[m.awayTeam] = { code: m.awayTeamCode, flag: m.awayFlag };
        });

        // Display Bracket predictions summary
        const championName = userBracketPred.final['match-final-1'];
        const champInfo = teamInfoMap[championName] || { code: 'N/A', flag: 'https://flagcdn.com/un.svg' };
        
        let html = '';

        // Check if final is finished to evaluate champion prediction
        const finalMatch = matches.find(m => m.id === 'match-final-1');
        let champGlowClass = 'border-brand-gold/60 bg-gradient-to-tr from-brand-gold/20 via-yellow-600/5 to-transparent shadow-neon-gold';
        let champHeader = 'TAHMİNİ DÜNYA ŞAMPİYONU 👑';

        if (finalMatch && finalMatch.status === 'FINISHED') {
            const actualChamp = finalMatch.homeScore > finalMatch.awayScore ? finalMatch.homeTeam : finalMatch.awayTeam;
            if (actualChamp === championName) {
                champGlowClass = 'border-brand-green bg-gradient-to-tr from-green-500/15 via-green-600/5 to-transparent shadow-neon-green';
                champHeader = 'DÜNYA ŞAMPİYONU TAHMİNİ (DOĞRU!) 🏆';
            } else {
                champGlowClass = 'border-brand-red bg-gradient-to-tr from-red-500/15 via-red-600/5 to-transparent shadow-neon-red';
                champHeader = 'DÜNYA ŞAMPİYONU TAHMİNİ (YANLIŞ) ❌';
            }
        }

        html += `
            <!-- Champion Prediction Banner -->
            <div class="w-full border-2 rounded-[2rem] p-5 text-center flex flex-col items-center justify-center relative overflow-hidden ${champGlowClass}">
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 bg-white/5 blur-[15px] pointer-events-none"></div>
                <i data-lucide="trophy" class="w-8 h-8 text-brand-gold mb-2.5 animate-bounce"></i>
                <h4 class="text-[9px] font-outfit font-black text-brand-gold uppercase tracking-widest mb-2">${champHeader}</h4>
                <img src="${champInfo.flag}" class="w-12 h-8 waving-flag shadow-lg border border-white/10 mb-2.5" alt="">
                <span class="text-xs font-outfit font-black text-white uppercase tracking-tight truncate max-w-[180px]">${championName}</span>
                <span class="text-[8px] font-black text-brand-gold bg-black/40 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">${champInfo.code}</span>
            </div>

            <!-- Detailed Bracket Progression Summaries -->
            <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">Eleme Turları Kazanan Tahminleriniz</span>
                <div class="flex flex-col gap-3.5 mt-1">
                    ${this.renderRoundWinnersSummary('r32', 'Son 32 Turu', userBracketPred.r32, matches, teamInfoMap)}
                    ${this.renderRoundWinnersSummary('r16', 'Son 16 Turu', userBracketPred.r16, matches, teamInfoMap)}
                    ${this.renderRoundWinnersSummary('qf', 'Çeyrek Final', userBracketPred.qf, matches, teamInfoMap)}
                    ${this.renderRoundWinnersSummary('sf', 'Yarı Final', userBracketPred.sf, matches, teamInfoMap)}
                    ${this.renderRoundWinnersSummary('final', 'Final Aşaması', userBracketPred.final, matches, teamInfoMap)}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderRoundWinnersSummary(roundKey, roundTitle, roundWinnersMap, matches, teamInfoMap) {
        if (!roundWinnersMap || Object.keys(roundWinnersMap).length === 0) return '';
        
        const winnerList = Object.entries(roundWinnersMap);
        
        let teamRowsHtml = '';
        winnerList.forEach(([matchId, winnerTeam]) => {
            const tInfo = teamInfoMap[winnerTeam] || { code: 'N/A', flag: 'https://flagcdn.com/un.svg' };
            
            // Check if match exists and is finished
            const match = matches.find(m => m.id === matchId);
            let indicatorColor = 'border-white/5 bg-white/5 text-slate-300';
            let iconHtml = '';

            if (match && match.status === 'FINISHED') {
                const hScore = parseInt(match.homeScore) || 0;
                const aScore = parseInt(match.awayScore) || 0;
                const actualWinner = hScore > aScore ? match.homeTeam : match.awayTeam;
                const isCorrect = actualWinner === winnerTeam;
                
                if (isCorrect) {
                    indicatorColor = 'border-green-500/20 bg-green-500/10 text-brand-green';
                    iconHtml = '<i data-lucide="check" class="w-2.5 h-2.5 text-brand-green"></i>';
                } else {
                    indicatorColor = 'border-red-500/20 bg-red-500/10 text-brand-red';
                    iconHtml = '<i data-lucide="x" class="w-2.5 h-2.5 text-brand-red"></i>';
                }
            }

            teamRowsHtml += `
                <div class="flex items-center justify-between p-1.5 rounded-xl border ${indicatorColor} text-[8px] font-bold">
                    <div class="flex items-center gap-1.5 truncate">
                        <img src="${tInfo.flag}" class="w-3.5 h-2.5 object-cover rounded-sm shadow-sm" alt="">
                        <span class="truncate uppercase tracking-tight">${winnerTeam}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <span class="text-[7.5px] uppercase font-black opacity-85">${tInfo.code}</span>
                        ${iconHtml}
                    </div>
                </div>
            `;
        });

        return `
            <div class="flex flex-col gap-1.5">
                <span class="text-[9px] font-black font-outfit text-slate-400 uppercase tracking-widest border-b border-white/5 pb-0.5">${roundTitle}</span>
                <div class="grid grid-cols-2 gap-2">
                    ${teamRowsHtml}
                </div>
            </div>
        `;
    }

    // --- POINTS CALCULATOR ---
    calculateMatchPts(pred, match, allPredictions) {
        if (!pred || match.status !== 'FINISHED') return { pts: 0, isExact: false, isOutcomeCorrect: false, isOutcomeAltCorrect: false };

        let pts = 0;
        const isExact = (pred.homeScorePred === match.homeScore && pred.awayScorePred === match.awayScore);
        const isExactAlt = pred.appliedJoker === 'ciftesans' && (pred.homeScorePredAlt === match.homeScore && pred.awayScorePredAlt === match.awayScore);
        
        const realDiff = match.homeScore - match.awayScore;
        const predDiff = pred.homeScorePred - pred.awayScorePred;
        const isDiffCorrect = (realDiff === predDiff && Math.sign(realDiff) === Math.sign(predDiff));
        const isOutcomeCorrect = (Math.sign(realDiff) === Math.sign(predDiff));
        
        let isOutcomeAltCorrect = false;
        if (pred.appliedJoker === 'ciftesans') {
            const predDiffAlt = pred.homeScorePredAlt - pred.awayScorePredAlt;
            isOutcomeAltCorrect = (Math.sign(realDiff) === Math.sign(predDiffAlt));
        }

        if (isExact || isExactAlt) {
            pts += CONFIG.SCORING.EXACT_SCORE;
        } else if (isDiffCorrect) {
            pts += CONFIG.SCORING.DIFF_AND_OUTCOME;
        } else if (isOutcomeCorrect || isOutcomeAltCorrect) {
            pts += CONFIG.SCORING.OUTCOME_ONLY;
        }

        // Side questions
        if (pred.sideAnswers && match.sideQuestions) {
            if (pred.sideAnswers.htResult === match.sideQuestions.htResult) pts += CONFIG.SCORING.SIDE_QUESTION;
            if (pred.sideAnswers.firstScorer === match.sideQuestions.firstScorer) pts += CONFIG.SCORING.SIDE_QUESTION;
            
            const predRedCard = String(pred.sideAnswers.redCard) === 'true';
            const actualRedCard = String(match.sideQuestions.redCard) === 'true';
            if (predRedCard === actualRedCard) pts += CONFIG.SCORING.SIDE_QUESTION;
            if (pred.sideAnswers.cornersOverUnder === match.sideQuestions.cornersOverUnder) pts += CONFIG.SCORING.SIDE_QUESTION;
        }

        let finalPts = pts;
        if (pred.appliedJoker === "doublepuan") {
            finalPts = pts > 0 ? pts * 2 : -5;
        } else if (pred.appliedJoker === "allin") {
            finalPts = isExact ? CONFIG.SCORING.EXACT_SCORE * 3 : -15;
        }

        // Sabotage check
        const sabotageOnUser = allPredictions.find(p => p.matchId === match.id && p.appliedJoker === 'sabotaj' && p.targetUserId === pred.userId);
        if (sabotageOnUser) {
            finalPts = Math.round(finalPts * 0.5);
        }

        return {
            pts: finalPts,
            isExact,
            isOutcomeCorrect,
            isOutcomeAltCorrect
        };
    }
}
