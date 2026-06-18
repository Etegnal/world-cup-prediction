// Admin Panel Component (passcode authorization + match completions + live simulators + analyses updates)
import { CONFIG } from '../config.js';
import { getMatches, completeMatch, updateLiveScore, resetMockDb, updateAdminAnalysis, getApiStats, saveApiStats, resetAllUsersJokers, getUsers, getPredictions, updateUserJokers, savePrediction, updateUserDetails, deleteUser, getPlayers, savePlayer, deletePlayer, savePlayerRatings, hashPassword, updateMatchDetails, getAllGroupPredictions, getAllBracketPredictions, updateMatchSofaScoreId, calculateRealisticPrice, saveGroupPredictions, saveBracketPredictions, fetchMatchStatsFromApi } from '../firebase-db.js';
import { TEAMS_DATA } from './teamsData.js';

export class AdminPanel {
    constructor(containerId, appState) {
        this.container = document.getElementById(containerId);
        this.appState = appState;
        this.isAuthorized = false;
        this.adminPassword = '';
        this.activeStatsTab = 'goals'; // goals, assists
        this.activeAdminTab = 'system'; // system, users
    }

    async render() {
        this.container.innerHTML = '';

        if (!this.isAuthorized) {
            this.renderLoginView();
            return;
        }

        if (!this.localStats) {
            this.localStats = await getApiStats();
        }

        const matches = await getMatches();

        // Horizontal sub-tab navigation
        const tabHeaderHtml = `
            <div class="flex bg-slate-950/60 rounded-2xl p-1.5 text-xs font-bold uppercase gap-2 mb-4 border border-white/5 shadow-inner">
                <button id="admin-tab-system" class="flex-grow py-2.5 rounded-xl text-center transition-all ${this.activeAdminTab === 'system' ? 'bg-brand-gold text-black font-black font-extrabold shadow-neon-gold' : 'text-slate-400'}" type="button">
                    ⚙️ Sistem
                </button>
                <button id="admin-tab-users" class="flex-grow py-2.5 rounded-xl text-center transition-all ${this.activeAdminTab === 'users' ? 'bg-brand-gold text-black font-black font-extrabold shadow-neon-gold' : 'text-slate-400'}" type="button">
                    👥 Tahminler
                </button>
                <button id="admin-tab-players" class="flex-grow py-2.5 rounded-xl text-center transition-all ${this.activeAdminTab === 'players' ? 'bg-brand-gold text-black font-black font-extrabold shadow-neon-gold' : 'text-slate-400'}" type="button">
                    🏃 Oyuncu Havuzu
                </button>
            </div>
        `;

        if (this.activeAdminTab === 'system') {
            // Main Admin View (Live simulator removed per user request)
            const teams = [...new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam]))].sort();
            
            const demoWarning = CONFIG.IS_DEMO_MODE ? `
                <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3 items-center mb-4">
                    <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 text-sm">
                        ⚠️
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-amber-400 font-outfit uppercase">Demo Modu (Yerel Depolama) Aktif!</h4>
                        <p class="text-[9px] text-slate-400 mt-0.5 leading-snug">Firebase Firestore bağlantısı kurulamadığı için yerel tarayıcı hafızasını kullanıyorsunuz. Kaydedilen veriler başka cihazda görünmez ve tarayıcı temizlenirse sıfırlanabilir.</p>
                    </div>
                </div>
            ` : '';

            this.container.innerHTML = `
                ${tabHeaderHtml}
                ${demoWarning}
                <div class="flex flex-col gap-5">
                    
                    <!-- 1. Database Operations & Simulator Warning -->
                    <div class="bg-red-950/20 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-xl pointer-events-none"></div>
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-xs font-outfit font-black text-red-400 uppercase tracking-widest">Test & Reset Araçları</h3>
                                <p class="text-[9px] text-slate-400 mt-1 max-w-[240px] leading-snug">Uygulamayı sıfırlayabilir veya tüm kullanıcıların jokerlerini tazeleyebilirsiniz.</p>
                            </div>
                        </div>
                        <div class="flex gap-2.5 mt-1">
                            <button id="admin-reset-btn" class="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-black text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-red-950">
                                Db Sıfırla
                            </button>
                            <button id="admin-reset-jokers-btn" class="flex-1 py-2 rounded-xl bg-brand-gold hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-yellow-950">
                                Jokerleri Sıfırla
                            </button>
                        </div>
                    </div>

                    <!-- 2. Admin Advice & Analysis Editor -->
                    <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                        <h3 class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                            Admin Kürsüsü Analiz Yazısı
                        </h3>
                        <div class="flex flex-col gap-2.5">
                            <select id="admin-analysis-match-select" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                                ${matches.map(m => `<option value="${m.id}">${m.homeTeam} vs ${m.awayTeam}</option>`).join('')}
                            </select>
                            <textarea id="admin-analysis-textarea" class="bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none min-h-[70px] resize-none leading-relaxed" placeholder="Bu maça dair analiz yazınız..."></textarea>
                            <button id="admin-save-analysis-btn" class="w-full py-2 bg-brand-cyan hover:bg-brand-cyan/80 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md">
                                Analizi Yayınla
                            </button>
                        </div>
                    </div>

                    <!-- 3. Complete Match & Distribute Points -->
                    <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                        <h3 class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
                            Maç Sonuçlandırma & Puan Dağıtımı
                        </h3>
                        <div class="flex flex-col gap-2.5">
                            <select id="admin-complete-match-select" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                                ${matches.map(m => `<option value="${m.id}">${m.homeTeam} vs ${m.awayTeam} ${m.status === 'FINISHED' ? '🏁 (BİTTİ)' : ''}</option>`).join('')}
                            </select>
                            
                            <div class="flex gap-3">
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ev Sahibi Sonuç</label>
                                    <input type="number" id="admin-comp-home-score" min="0" value="2" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-bold text-white outline-none">
                                </div>
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Deplasman Sonuç</label>
                                    <input type="number" id="admin-comp-away-score" min="0" value="1" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-bold text-white outline-none">
                                </div>
                            </div>

                            <!-- Yan Sorular Cevapları Girişi -->
                            <div class="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5 mt-1">
                                <span class="text-[9px] font-black text-brand-gold uppercase tracking-wider block border-b border-white/5 pb-1">Yan Soru Cevapları</span>
                                
                                <div class="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-400 uppercase block mb-1">İlk Yarı Sonucu</label>
                                        <select id="admin-comp-ht-result" class="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none">
                                            <option value="draw">Beraberlik (draw)</option>
                                            <option value="home">Ev Sahibi (home)</option>
                                            <option value="away">Deplasman (away)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-400 uppercase block mb-1">İlk Golü Kim Atar</label>
                                        <input type="text" id="admin-comp-first-scorer" value="Diğer" class="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none">
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-400 uppercase block mb-1">Kırmızı Kart Var mı?</label>
                                        <select id="admin-comp-red-card" class="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none">
                                            <option value="false">Hayır (false)</option>
                                            <option value="true">Evet (true)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-400 uppercase block mb-1">Köşe Vuruşu Alt/Üst</label>
                                        <select id="admin-comp-corners" class="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none">
                                            <option value="under">Alt (under)</option>
                                            <option value="over">Üst (over)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button id="admin-comp-fetch-api-btn" class="w-full py-2 mb-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1">
                                🔄 İstatistikleri API'den Çek
                            </button>

                            <button id="admin-comp-finalize-btn" class="w-full py-2.5 mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-950">
                                Maçı Resmi Olarak Sonuçlandır 🏁
                            </button>
                        </div>
                    </div>

                    <!-- 3.5. Match Details & Status Editor -->
                    <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                        <h3 class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                            Maç Detaylarını & Durumunu Düzenle
                        </h3>
                        <div class="flex flex-col gap-2.5">
                            <select id="admin-edit-match-select" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                                ${matches.map(m => `<option value="${m.id}">${m.group ? m.group + ' • ' : ''} ${m.homeTeam} vs ${m.awayTeam} (${m.id})</option>`).join('')}
                            </select>
                            
                            <div class="flex gap-3">
                                <div class="flex-grow flex-shrink-0 flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ev Sahibi Takım</label>
                                    <select id="admin-edit-home-team" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                                        <option value="Belirsiz">Belirsiz</option>
                                        ${Object.values(TEAMS_DATA).map(t => t.nameTr).sort().filter((v, i, a) => a.indexOf(v) === i).map(name => `<option value="${name}">${name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="flex-grow flex-shrink-0 flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Deplasman Takım</label>
                                    <select id="admin-edit-away-team" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none">
                                        <option value="Belirsiz">Belirsiz</option>
                                        ${Object.values(TEAMS_DATA).map(t => t.nameTr).sort().filter((v, i, a) => a.indexOf(v) === i).map(name => `<option value="${name}">${name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Maç Durumu</label>
                                    <select id="admin-edit-match-status" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none">
                                        <option value="SCHEDULED">Planlandı (SCHEDULED)</option>
                                        <option value="LIVE">Canlı (LIVE)</option>
                                        <option value="FINISHED">Bitti (FINISHED)</option>
                                    </select>
                                </div>
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Grup / Aşama</label>
                                    <input type="text" id="admin-edit-match-group" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" placeholder="Örn: A veya Son 16">
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ev Sahibi Bayrak URL</label>
                                    <input type="text" id="admin-edit-home-flag" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none">
                                </div>
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Deplasman Bayrak URL</label>
                                    <input type="text" id="admin-edit-away-flag" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none">
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Maç Tarihi & Saati</label>
                                    <input type="text" id="admin-edit-match-date" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" placeholder="Örn: 2026-07-19T22:00:00">
                                </div>
                            </div>
                            
                            <div class="flex gap-3">
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SofaScore ID</label>
                                    <input type="text" id="admin-edit-sofa-id" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" placeholder="Örn: 123456">
                                </div>
                                <div class="flex-1">
                                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SportDB Event ID</label>
                                    <input type="text" id="admin-edit-sportdb-id" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" placeholder="Örn: zXyW1234">
                                </div>
                            </div>

                            <div>
                                <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Analiz & Detay Metni</label>
                                <textarea id="admin-edit-match-analysis" class="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none min-h-[60px] resize-none" placeholder="Analiz yazısı..."></textarea>
                            </div>

                            <button id="admin-edit-match-save-btn" class="w-full py-2.5 bg-brand-cyan hover:bg-brand-cyan/80 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md shadow-cyan-950/40">
                                Maç Detaylarını Kaydet 💾
                            </button>
                        </div>
                    </div>

                    <!-- 4. Gol ve Asist Krallığı Yönetimi -->
                    <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                        <h3 class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <i data-lucide="award" class="w-3.5 h-3.5"></i>
                            Gol & Asist Krallığı Düzenle
                        </h3>
                        <div class="flex flex-col gap-4">
                            <div class="flex bg-black/45 rounded-xl p-1 text-[10px] font-bold uppercase gap-1">
                                <button id="admin-stats-goals-tab" class="flex-1 py-1.5 rounded-lg text-center transition-all ${this.activeStatsTab !== 'assists' ? 'bg-brand-gold text-black font-black font-extrabold' : 'text-slate-400'}" type="button">Gol Krallığı</button>
                                <button id="admin-stats-assists-tab" class="flex-1 py-1.5 rounded-lg text-center transition-all ${this.activeStatsTab === 'assists' ? 'bg-brand-gold text-black font-black font-extrabold' : 'text-slate-400'}" type="button">Asist Krallığı</button>
                            </div>

                            <div id="admin-stats-players-list" class="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                            </div>

                            <div class="border-t border-white/5 pt-3 flex flex-col gap-2.5">
                                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Yeni Oyuncu Ekle</span>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Oyuncu Adı</label>
                                        <input type="text" id="admin-stats-player-name" class="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none" placeholder="Örn: Kylian Mbappé">
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Takım</label>
                                        <select id="admin-stats-player-team" class="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none">
                                            ${teams.map(t => `<option value="${t}">${t}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div>
                                        <label id="admin-stats-metric-label" class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">${this.activeStatsTab === 'assists' ? 'Asist Sayısı' : 'Gol Sayısı'}</label>
                                        <input type="number" id="admin-stats-player-count" min="0" value="1" class="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none">
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Rating (0-10)</label>
                                        <input type="number" id="admin-stats-player-rating" step="0.1" min="0" max="10" value="8.0" class="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none">
                                    </div>
                                </div>
                                <button id="admin-add-player-btn" class="w-full py-2 bg-brand-green hover:bg-brand-green/90 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md" type="button">
                                    Oyuncu Ekle
                                </button>
                            </div>

                            <button id="admin-save-stats-btn" class="w-full py-2.5 bg-gradient-to-r from-brand-gold to-yellow-600 hover:from-brand-gold/90 hover:to-yellow-600/90 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-yellow-950/50 mt-2" type="button">
                                Tüm Değişiklikleri Veritabanına Kaydet 💾
                            </button>
                        </div>
                    </div>

                </div>
            `;

            if (window.lucide) {
                window.lucide.createIcons();
            }

            this.attachAdminEventListeners();
            this.renderAdminStatsPlayers();


        } else if (this.activeAdminTab === 'users') {
            // Render Users View
            const users = await getUsers();
            const allPredictions = await getPredictions();
            const allGroupPreds = await getAllGroupPredictions();
            const allBracketPreds = await getAllBracketPredictions();

            const teamInfo = {};
            matches.forEach(m => {
                if (m.homeTeam) teamInfo[m.homeTeam] = { code: m.homeTeamCode, flag: m.homeFlag };
                if (m.awayTeam) teamInfo[m.awayTeam] = { code: m.awayTeamCode, flag: m.awayFlag };
            });
            this.teamInfo = teamInfo;

            // Extract default groups dynamically
            const defaultGroups = {};
            const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
            groupLetters.forEach(g => {
                const teams = new Set();
                matches.forEach(m => {
                    if (m.group === g) {
                        if (m.homeTeam) teams.add(m.homeTeam);
                        if (m.awayTeam) teams.add(m.awayTeam);
                    }
                });
                defaultGroups[g] = Array.from(teams).slice(0, 4);
            });

            if (!this.tempGroupPreds) this.tempGroupPreds = {};
            if (!this.tempBracketPreds) this.tempBracketPreds = {};

            const totalUsers = users.length;
            const totalPreds = allPredictions.length;
            const activeJokersCount = allPredictions.filter(p => p.appliedJoker && !matches.find(m => m.id === p.matchId)?.status === 'FINISHED').length;

            let usersHtml = `
                ${tabHeaderHtml}
                <div class="flex flex-col gap-4">
                    <!-- Stat Summary Card -->
                    <div class="grid grid-cols-3 gap-2 bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-center">
                        <div>
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Kullanıcılar</span>
                            <span class="text-base font-outfit font-black text-brand-gold">${totalUsers}</span>
                        </div>
                        <div>
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Tahminler</span>
                            <span class="text-base font-outfit font-black text-brand-cyan">${totalPreds}</span>
                        </div>
                        <div>
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Aktif Jokerler</span>
                            <span class="text-base font-outfit font-black text-brand-green">${activeJokersCount}</span>
                        </div>
                    </div>

                    <!-- Search Input to filter users -->
                    <div class="flex gap-2">
                        <input type="text" id="admin-user-search" class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 font-bold outline-none focus:border-brand-green transition-all" placeholder="Kullanıcı adı ara...">
                    </div>

                    <!-- User Cards List -->
                    <div id="admin-users-list" class="flex flex-col gap-3">
            `;

            usersHtml += users.map(u => {
                const userPreds = allPredictions.filter(p => p.userId === u.id);
                const userGroupPred = allGroupPreds[u.id];
                const userBracketPred = allBracketPreds[u.id];

                // Initialize temp predictions for this user if not yet initialized
                if (!this.tempGroupPreds[u.id]) {
                    this.tempGroupPreds[u.id] = userGroupPred ? JSON.parse(JSON.stringify(userGroupPred)) : JSON.parse(JSON.stringify(defaultGroups));
                }
                const currentPreds = this.tempGroupPreds[u.id];

                // Build group predictions editor html
                const editGroupsHtml = groupLetters.map(g => {
                    const teams = currentPreds[g] || defaultGroups[g] || [];
                    return `
                        <div class="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-[9px] edit-group-card" id="edit-group-card-${u.id}-${g}">
                            <div class="font-extrabold text-brand-cyan mb-1.5 text-center border-b border-white/5 pb-1">GRUP ${g}</div>
                            <div class="flex flex-col gap-1.5">
                                ${teams.map((t, idx) => {
                                    return `
                                        <div class="flex items-center justify-between text-[9px] text-slate-300 py-0.5 border-b border-white/5 last:border-0">
                                            <div class="flex items-center gap-1 truncate max-w-[70px]">
                                                <span class="text-slate-500 font-bold font-mono">${idx+1}.</span>
                                                <span class="truncate" title="${t}">${t}</span>
                                            </div>
                                            <div class="flex items-center gap-1 shrink-0">
                                                <button type="button" class="admin-team-move-btn px-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-[8px] font-bold text-slate-400 cursor-pointer disabled:opacity-30 disabled:pointer-events-none" 
                                                    data-user-id="${u.id}" data-group="${g}" data-index="${idx}" data-dir="up" ${idx === 0 ? 'disabled' : ''}>▲</button>
                                                <button type="button" class="admin-team-move-btn px-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-[8px] font-bold text-slate-400 cursor-pointer disabled:opacity-30 disabled:pointer-events-none" 
                                                    data-user-id="${u.id}" data-group="${g}" data-index="${idx}" data-dir="down" ${idx === 3 ? 'disabled' : ''}>▼</button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('');

                // Build group predictions block
                let groupPredsHtml = `
                    <div class="flex flex-col gap-2 bg-black/25 p-3 rounded-xl border border-white/5 mt-2.5">
                        <div class="flex items-center justify-between border-b border-white/5 pb-2 mb-1.5">
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Grup Sıralamaları Tahminleri</span>
                            <button class="admin-edit-groups-toggle-btn text-[8px] font-black text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded uppercase cursor-pointer" data-user-id="${u.id}" type="button">
                                Düzenle / Oluştur ⚙️
                            </button>
                        </div>
                        
                        <!-- Read-only view (visible by default) -->
                        <div class="admin-groups-readonly-view" id="groups-readonly-${u.id}">
                            ${userGroupPred && Object.keys(userGroupPred).length > 0 ? `
                                <div class="grid grid-cols-2 xs:grid-cols-3 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                                    ${Object.entries(userGroupPred).map(([groupLetter, teams]) => {
                                        return `
                                            <div class="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-[9px]">
                                                <div class="font-extrabold text-brand-cyan mb-1.5 text-center border-b border-white/5 pb-1">GRUP ${groupLetter}</div>
                                                <div class="flex flex-col gap-1">
                                                    ${teams.map((t, idx) => {
                                                        const info = teamInfo[t] || { code: 'N/A', flag: '' };
                                                        return `
                                                            <div class="flex items-center justify-between text-[8px] text-slate-300">
                                                                <div class="flex items-center gap-1 truncate max-w-[65px]">
                                                                    <span class="text-slate-500 font-bold">${idx+1}.</span>
                                                                    <span class="truncate">${t}</span>
                                                                </div>
                                                                <img src="${info.flag}" class="w-3.5 h-2.5 rounded-sm object-cover" alt="">
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : `
                                <div class="text-center py-2 text-[10px] text-slate-500 italic">Grup sıralama tahmini bulunmamaktadır.</div>
                            `}
                        </div>
                        
                        <!-- Edit view (hidden by default) -->
                        <div class="admin-groups-edit-view hidden flex flex-col gap-3.5" id="groups-edit-${u.id}">
                            <div class="grid grid-cols-2 xs:grid-cols-3 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                                ${editGroupsHtml}
                            </div>
                            <div class="flex gap-2">
                                <button class="admin-save-group-preds-btn flex-grow py-2 bg-brand-green hover:bg-brand-green/90 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md font-bold" data-user-id="${u.id}" type="button">
                                    Grup Tahminlerini Kaydet 💾
                                </button>
                                <button class="admin-edit-groups-cancel-btn py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md cursor-pointer" data-user-id="${u.id}" type="button">
                                    Vazgeç
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Build bracket predictions block
                let bracketPredsHtml = '';
                const stages = [
                    { key: 'r32', name: 'Son 32' },
                    { key: 'r16', name: 'Son 16' },
                    { key: 'qf', name: 'Çeyrek Final' },
                    { key: 'sf', name: 'Yarı Final' },
                    { key: 'final', name: 'Final & Şampiyon' }
                ];

                const thirdsHtml = userBracketPred && userBracketPred.selectedThirds && userBracketPred.selectedThirds.length > 0
                    ? `
                        <div class="border-b border-white/5 pb-2">
                            <span class="text-[9px] font-black text-brand-gold uppercase tracking-wider block mb-1.5">En İyi 3. Tercihleri:</span>
                            <div class="flex flex-wrap gap-1">
                                ${userBracketPred.selectedThirds.map(t => {
                                    const info = teamInfo[t] || { code: 'N/A', flag: '' };
                                    return `
                                        <span class="inline-flex items-center gap-1 bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-slate-300 font-bold">
                                            <img src="${info.flag}" class="w-3 h-2 rounded-sm object-cover" alt="">
                                            ${t}
                                        </span>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `
                    : '';

                const roundsHtml = userBracketPred ? stages.map(st => {
                    const roundData = userBracketPred[st.key] || {};
                    const winners = Object.values(roundData).filter(Boolean);
                    
                    if (winners.length === 0) return '';
                    
                    if (st.key === 'final') {
                        const champion = roundData['match-final-1'];
                        if (!champion) return '';
                        const info = teamInfo[champion] || { code: 'N/A', flag: '' };
                        return `
                            <div class="flex items-center justify-between bg-brand-gold/10 border border-brand-gold/20 p-2 rounded-xl mt-1.5">
                                <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-1">👑 ŞAMPİYON:</span>
                                <div class="flex items-center gap-1 font-black text-white text-[10px]">
                                    <img src="${info.flag}" class="w-3.5 h-2.5 rounded-sm object-cover" alt="">
                                    <span>${champion}</span>
                                </div>
                            </div>
                        `;
                    }

                    return `
                        <div class="border-b border-white/5 pb-2 mt-2">
                            <span class="text-[9px] font-black text-brand-cyan uppercase tracking-wider block mb-1.5">${st.name} Kazananları (${winners.length}):</span>
                            <div class="flex flex-wrap gap-1">
                                ${winners.map(t => {
                                    const info = teamInfo[t] || { code: 'N/A', flag: '' };
                                    return `
                                        <span class="inline-flex items-center gap-1 bg-slate-900/50 border border-white/5 px-1.5 py-0.5 rounded text-[8px] text-slate-400">
                                            <img src="${info.flag}" class="w-3 h-2 rounded-sm object-cover" alt="">
                                            ${t}
                                        </span>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('') : '';

                bracketPredsHtml = `
                    <div class="flex flex-col gap-2 bg-black/25 p-3 rounded-xl border border-white/5 mt-2.5">
                        <div class="flex items-center justify-between border-b border-white/5 pb-2 mb-1.5">
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Eleme Ağacı Tahminleri</span>
                            <button class="admin-edit-bracket-toggle-btn text-[8px] font-black text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded uppercase cursor-pointer" data-user-id="${u.id}" type="button">
                                Düzenle / Oluştur ⚙️
                            </button>
                        </div>
                        
                        <!-- Read-only view (visible by default) -->
                        <div class="admin-bracket-readonly-view" id="bracket-readonly-${u.id}">
                            <div class="flex flex-col max-h-[250px] overflow-y-auto pr-1">
                                ${thirdsHtml}
                                ${roundsHtml || '<div class="text-center py-2 text-[10px] text-slate-500 italic">Eşleşme tahmini yapılmamış.</div>'}
                            </div>
                        </div>
                        
                        <!-- Edit view (hidden by default) -->
                        <div class="admin-bracket-edit-view hidden flex flex-col gap-3" id="bracket-edit-${u.id}">
                            <!-- Will be rendered dynamically via renderBracketEditView -->
                        </div>
                    </div>
                `;

                // Remaining jokers mapping with editable increment/decrement controls
                const jokers = u.jokers || {};
                const jokerKeys = [
                    { key: 'ciftesans', short: 'ÇŞ', name: 'Çifte Şans' },
                    { key: 'doublepuan', short: '2X', name: '2x Kat' },
                    { key: 'allin', short: 'HYH', name: 'Hep ya da Hiç' },
                    { key: 'spy', short: 'CAS', name: 'Casus' },
                    { key: 'doksanarti', short: '90+', name: '90+' },
                    { key: 'sabotaj', short: 'SAB', name: 'Sabotaj' }
                ];

                const jokerControls = jokerKeys.map(j => {
                    const count = jokers[j.key] || 0;
                    return `
                        <div class="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] min-w-[110px] flex-grow flex-shrink-0">
                            <span class="font-bold text-slate-300" title="${j.name}">${j.name} (${j.short})</span>
                            <div class="flex items-center gap-1.5 ml-2">
                                <button class="admin-joker-dec-btn w-5 h-5 rounded bg-red-950/40 hover:bg-red-900 border border-red-500/30 flex items-center justify-center text-red-400 font-bold cursor-pointer text-xs" data-user-id="${u.id}" data-joker-key="${j.key}" type="button">-</button>
                                <span class="font-black text-white text-xs w-4 text-center admin-joker-count">${count}</span>
                                <button class="admin-joker-inc-btn w-5 h-5 rounded bg-green-950/40 hover:bg-green-900 border border-green-500/30 flex items-center justify-center text-green-400 font-bold cursor-pointer text-xs" data-user-id="${u.id}" data-joker-key="${j.key}" type="button">+</button>
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="user-admin-card bg-slate-950/30 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300" data-user-name="${u.name.toLowerCase()}">
                        <!-- User Summary Header (Clickable to Toggle Details) -->
                        <div class="user-admin-header flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full ${u.avatar || 'bg-slate-800'} border border-white/10 flex items-center justify-center text-xs font-black text-white">
                                    ${u.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div class="flex items-center gap-1.5">
                                        <h4 class="text-xs font-outfit font-black text-white">${u.name}</h4>
                                        ${u.badge === 'kahin' ? '<span class="text-[8px] bg-brand-gold/15 text-brand-gold border border-brand-gold/25 px-1.5 py-0.2 rounded-full font-bold">KÂHİN</span>' : ''}
                                    </div>
                                    <span class="text-[9px] text-slate-500">Puan: <span class="font-bold text-brand-cyan">${u.points || 0}</span> • Tahmin: <span class="font-bold text-slate-300">${userPreds.length}</span></span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500 transition-transform duration-300 toggle-icon"></i>
                            </div>
                        </div>

                        <!-- User Details View (Hidden by default) -->
                        <div class="user-admin-details hidden border-t border-white/5 bg-slate-950/50 p-4 flex flex-col gap-3.5">
                            <!-- User Credentials and Profile Settings -->
                            <div class="flex flex-col gap-2.5 bg-black/20 p-3.5 rounded-xl border border-white/5">
                                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Kullanıcı Bilgileri & Profil Düzenleme</span>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Kullanıcı Adı</label>
                                        <input type="text" class="admin-edit-username bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-green w-full" value="${u.name}">
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Şifre</label>
                                        <div class="flex gap-1.5">
                                            <input type="password" class="admin-edit-password bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-green w-full" value="${u.password || ''}" data-orig="${u.password || ''}">
                                            <button class="admin-toggle-pw-btn px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[8px] font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" type="button">Göster</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Toplam Puan</label>
                                        <input type="number" class="admin-edit-points bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-green w-full" value="${u.points || 0}">
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Özel Rozet</label>
                                        <select class="admin-edit-badge bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none w-full">
                                            <option value="none" ${u.badge === null || u.badge === 'none' ? 'selected' : ''}>Yok</option>
                                            <option value="kahin" ${u.badge === 'kahin' ? 'selected' : ''}>👑 Kahin</option>
                                            <option value="aglayan" ${u.badge === 'aglayan' ? 'selected' : ''}>📉 Ağlayan</option>
                                            <option value="member" ${u.badge === 'member' ? 'selected' : ''}>⚽ Üye</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex gap-2 mt-2">
                                    <button class="admin-save-user-details-btn flex-grow py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md" data-user-id="${u.id}" type="button">
                                        Kullanıcı Bilgilerini Kaydet 💾
                                    </button>
                                    <button class="admin-delete-user-btn py-2 px-3 bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md cursor-pointer" data-user-id="${u.id}" type="button">
                                        Sil 🗑
                                    </button>
                                </div>
                            </div>

                            <!-- Jokers Row -->
                            <div class="flex flex-col gap-1.5">
                                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Kalan Jokerleri Düzenle</span>
                                <div class="grid grid-cols-2 xs:grid-cols-3 gap-2">
                                    ${jokerControls}
                                </div>
                            </div>

                            <!-- Predictions List -->
                            <div class="flex flex-col gap-2">
                                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Tahminleri Düzenle & Kilit Aç</span>
                                <div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                                    ${userPreds.length === 0 ? `
                                        <div class="text-center py-4 text-[10px] text-slate-500 italic">Henüz hiç tahmin yapmamış.</div>
                                    ` : userPreds.map(p => {
                                        const match = matches.find(m => m.id === p.matchId);
                                        if (!match) return '';

                                        const isFinished = match.status === 'FINISHED';
                                        
                                        // Format joker string
                                        let jokerInfo = '';
                                        if (p.appliedJoker) {
                                            const jMap = {
                                                ciftesans: 'Çifte Şans ⚡',
                                                doublepuan: '2x Kat ⚡',
                                                allin: 'Hep ya da Hiç ⚡',
                                                spy: 'Casus ⚡',
                                                doksanarti: '90+ ⚡',
                                                sabotaj: 'Sabotaj ⚡'
                                            };
                                            jokerInfo = `<span class="text-[8px] bg-brand-gold/15 text-brand-gold px-1.5 py-0.2 rounded border border-brand-gold/25 font-bold ml-1.5">${jMap[p.appliedJoker] || p.appliedJoker}</span>`;
                                        }

                                        return `
                                            <div class="admin-pred-row flex flex-col gap-2 bg-black/35 border border-white/5 rounded-xl p-3 text-xs text-slate-200" data-user-id="${u.id}" data-match-id="${match.id}">
                                                <!-- Match info -->
                                                <div class="flex items-center justify-between">
                                                    <span class="font-bold text-white truncate max-w-[170px]">${match.homeTeam} vs ${match.awayTeam}</span>
                                                    ${jokerInfo}
                                                </div>
                                                
                                                <!-- Score inputs & lock toggle & save button -->
                                                <div class="flex items-center gap-2 mt-1 flex-wrap">
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-[10px] text-slate-500 font-bold uppercase">${match.homeTeam.substring(0,3)}:</span>
                                                        <input type="number" class="admin-pred-score-home bg-slate-900 border border-white/10 rounded w-10 text-center font-bold text-white text-xs px-1 py-0.5 outline-none focus:border-brand-green" value="${p.homeScorePred}" min="0" max="9" ${isFinished ? 'disabled' : ''}>
                                                        <span class="text-slate-500 font-bold">:</span>
                                                        <input type="number" class="admin-pred-score-away bg-slate-900 border border-white/10 rounded w-10 text-center font-bold text-white text-xs px-1 py-0.5 outline-none focus:border-brand-green" value="${p.awayScorePred}" min="0" max="9" ${isFinished ? 'disabled' : ''}>
                                                        <span class="text-[10px] text-slate-500 font-bold uppercase">${match.awayTeam.substring(0,3)}</span>
                                                    </div>

                                                    <!-- Alternative scores for Double Chance if applied -->
                                                    ${p.appliedJoker === 'ciftesans' && p.homeScorePredAlt !== undefined ? `
                                                        <div class="flex items-center gap-1 border-l border-white/5 pl-2">
                                                            <span class="text-[9px] text-brand-cyan font-bold uppercase">2. Skor:</span>
                                                            <input type="number" class="admin-pred-score-home-alt bg-slate-900 border border-brand-cyan/20 rounded w-10 text-center font-bold text-brand-cyan text-xs px-1 py-0.5 outline-none focus:border-brand-green" value="${p.homeScorePredAlt}" min="0" max="9" ${isFinished ? 'disabled' : ''}>
                                                            <span class="text-brand-cyan font-bold">:</span>
                                                            <input type="number" class="admin-pred-score-away-alt bg-slate-900 border border-brand-cyan/20 rounded w-10 text-center font-bold text-brand-cyan text-xs px-1 py-0.5 outline-none focus:border-brand-green" value="${p.awayScorePredAlt}" min="0" max="9" ${isFinished ? 'disabled' : ''}>
                                                        </div>
                                                    ` : ''}

                                                    <div class="flex items-center gap-1.5 ml-auto">
                                                        <!-- Lock Toggle Button -->
                                                        <button class="admin-pred-lock-toggle-btn px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded flex items-center gap-1 text-[9px] font-bold text-slate-300 transition-all cursor-pointer ${p.isLocked ? 'animate-pulse' : ''}" data-locked="${p.isLocked}" ${isFinished ? 'disabled' : ''} type="button">
                                                            ${p.isLocked ? '🔐 Kilitli' : '🔓 Açık'}
                                                        </button>

                                                        <!-- Save Prediction Button -->
                                                        <button class="admin-pred-save-btn px-2.5 py-1 bg-brand-green hover:bg-brand-green/90 text-black rounded font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer" ${isFinished ? 'disabled' : ''} type="button">
                                                            Kaydet
                                                        </button>
                                                    </div>
                                                </div>

                                                ${isFinished ? `
                                                    <div class="flex items-center justify-between border-t border-white/5 pt-1.5 mt-1 text-[10px] text-slate-400">
                                                        <span>Skor: <span class="font-bold text-brand-cyan">${match.homeScore} - ${match.awayScore}</span></span>
                                                        <span class="font-extrabold text-brand-green">+${p.pointsGained || 0} Puan</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>

                            <!-- Group Standings Predictions -->
                            ${groupPredsHtml}

                            <!-- Bracket Predictions -->
                            ${bracketPredsHtml}
                        </div>
                    </div>
                `;
            }).join('');

            usersHtml += `
                    </div>
                </div>
            `;

            this.container.innerHTML = usersHtml;

            // Bind Group Prediction Toggle View and Save Buttons
            this.container.querySelectorAll('.admin-edit-groups-toggle-btn, .admin-edit-groups-cancel-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const userId = btn.dataset.userId;
                    const readonlyView = document.getElementById(`groups-readonly-${userId}`);
                    const editView = document.getElementById(`groups-edit-${userId}`);
                    
                    if (readonlyView && editView) {
                        const isEditHidden = editView.classList.contains('hidden');
                        if (isEditHidden) {
                            // Reset temp data to match current prediction status before editing
                            const userGroupPred = allGroupPreds[userId];
                            this.tempGroupPreds[userId] = userGroupPred ? JSON.parse(JSON.stringify(userGroupPred)) : JSON.parse(JSON.stringify(defaultGroups));
                            
                            // Re-render all 12 group cards for this user to make sure we show current state
                            groupLetters.forEach(g => {
                                this.renderGroupEditCard(userId, g, teamInfo);
                            });
                            
                            readonlyView.classList.add('hidden');
                            editView.classList.remove('hidden');
                        } else {
                            readonlyView.classList.remove('hidden');
                            editView.classList.add('hidden');
                        }
                    }
                });
            });

            // Bind Bracket Prediction Toggle View
            this.container.querySelectorAll('.admin-edit-bracket-toggle-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const userId = btn.dataset.userId;
                    const readonlyView = document.getElementById(`bracket-readonly-${userId}`);
                    const editView = document.getElementById(`bracket-edit-${userId}`);
                    
                    if (readonlyView && editView) {
                        const isEditHidden = editView.classList.contains('hidden');
                        if (isEditHidden) {
                            // Reset temp data to match current prediction status before editing
                            const userBracketPred = allBracketPreds[userId];
                            this.tempBracketPreds[userId] = userBracketPred ? JSON.parse(JSON.stringify(userBracketPred)) : {
                                selectedThirds: [],
                                r32: {},
                                r16: {},
                                qf: {},
                                sf: {},
                                final: {}
                            };
                            
                            // Re-render bracket edit view
                            this.renderBracketEditView(userId);
                            
                            readonlyView.classList.add('hidden');
                            editView.classList.remove('hidden');
                        } else {
                            readonlyView.classList.remove('hidden');
                            editView.classList.add('hidden');
                        }
                    }
                });
            });

            // Bind Save Group Predictions Buttons
            this.container.querySelectorAll('.admin-save-group-preds-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const userId = btn.dataset.userId;
                    const predsToSave = this.tempGroupPreds[userId];
                    if (!predsToSave) return;
                    
                    btn.disabled = true;
                    const origText = btn.innerHTML;
                    btn.innerHTML = '<i class="w-3.5 h-3.5 animate-spin"></i> Kaydediliyor...';
                    
                    try {
                        const success = await saveGroupPredictions(userId, predsToSave);
                        if (success) {
                            alert("Grup tahminleri başarıyla kaydedildi!");
                            // Refresh dashboard
                            await this.appState.refreshDashboard();
                        } else {
                            alert("Grup tahminleri kaydedilirken bir hata oluştu.");
                        }
                    } catch (saveErr) {
                        console.error("Save group predictions failed:", saveErr);
                        alert("Hata: " + saveErr.message);
                    } finally {
                        btn.disabled = false;
                        btn.innerHTML = origText;
                    }
                });
            });

            // Bind Group Prediction Team Reordering Click Listener (Event Delegation)
            const usersListContainer = document.getElementById('admin-users-list');
            if (usersListContainer) {
                usersListContainer.addEventListener('click', (e) => {
                    const moveBtn = e.target.closest('.admin-team-move-btn');
                    if (!moveBtn) return;
                    
                    e.stopPropagation();
                    const userId = moveBtn.dataset.userId;
                    const groupLetter = moveBtn.dataset.group;
                    const index = parseInt(moveBtn.dataset.index);
                    const dir = moveBtn.dataset.dir;
                    
                    const teams = this.tempGroupPreds[userId][groupLetter];
                    if (!teams) return;
                    
                    if (dir === 'up' && index > 0) {
                        const temp = teams[index];
                        teams[index] = teams[index - 1];
                        teams[index - 1] = temp;
                    } else if (dir === 'down' && index < teams.length - 1) {
                        const temp = teams[index];
                        teams[index] = teams[index + 1];
                        teams[index + 1] = temp;
                    }
                    
                    // Re-render just this group edit card
                    this.renderGroupEditCard(userId, groupLetter, teamInfo);
                });
            }

            // Bind accordion toggle clicks
            this.container.querySelectorAll('.user-admin-card').forEach(card => {
                const header = card.querySelector('.user-admin-header');
                const details = card.querySelector('.user-admin-details');
                const icon = card.querySelector('.toggle-icon');

                header.addEventListener('click', () => {
                    const isHidden = details.classList.contains('hidden');
                    if (isHidden) {
                        details.classList.remove('hidden');
                        icon.classList.add('rotate-180');
                        card.classList.add('border-brand-green/30', 'shadow-lg');
                    } else {
                        details.classList.add('hidden');
                        icon.classList.remove('rotate-180');
                        card.classList.remove('border-brand-green/30', 'shadow-lg');
                    }
                });
            });

            // Bind Joker Increment/Decrement Buttons
            this.container.querySelectorAll('.admin-joker-dec-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = btn.dataset.userId;
                    const jokerKey = btn.dataset.jokerKey;
                    const user = users.find(usr => usr.id === userId);
                    if (!user) return;
                    
                    const countEl = btn.nextElementSibling;
                    let currentCount = parseInt(countEl.textContent) || 0;
                    if (currentCount > 0) {
                        currentCount--;
                        countEl.textContent = currentCount;
                        
                        const updatedJokers = {
                            ...user.jokers,
                            [jokerKey]: currentCount
                        };
                        user.jokers = updatedJokers; // Update local state cache
                        await updateUserJokers(userId, updatedJokers);
                    }
                });
            });

            this.container.querySelectorAll('.admin-joker-inc-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = btn.dataset.userId;
                    const jokerKey = btn.dataset.jokerKey;
                    const user = users.find(usr => usr.id === userId);
                    if (!user) return;
                    
                    const countEl = btn.previousElementSibling;
                    let currentCount = parseInt(countEl.textContent) || 0;
                    currentCount++;
                    countEl.textContent = currentCount;
                    
                    const updatedJokers = {
                        ...user.jokers,
                        [jokerKey]: currentCount
                    };
                    user.jokers = updatedJokers; // Update local state cache
                    await updateUserJokers(userId, updatedJokers);
                });
            });

            // Bind Prediction Lock Toggle Buttons
            this.container.querySelectorAll('.admin-pred-lock-toggle-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const isLocked = btn.dataset.locked === 'true';
                    const newLocked = !isLocked;
                    btn.dataset.locked = newLocked ? 'true' : 'false';
                    btn.innerHTML = newLocked ? '🔐 Kilitli' : '🔓 Açık';
                    if (newLocked) {
                        btn.classList.add('animate-pulse');
                    } else {
                        btn.classList.remove('animate-pulse');
                    }
                });
            });

            // Bind Prediction Save Buttons
            this.container.querySelectorAll('.admin-pred-save-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const row = btn.closest('.admin-pred-row');
                    const userId = row.dataset.userId;
                    const matchId = row.dataset.matchId;
                    
                    const origPred = allPredictions.find(pr => pr.userId === userId && pr.matchId === matchId);
                    if (!origPred) return;

                    const homeScoreInput = row.querySelector('.admin-pred-score-home');
                    const awayScoreInput = row.querySelector('.admin-pred-score-away');
                    const homeScoreAltInput = row.querySelector('.admin-pred-score-home-alt');
                    const awayScoreAltInput = row.querySelector('.admin-pred-score-away-alt');
                    const lockBtn = row.querySelector('.admin-pred-lock-toggle-btn');
                    
                    const homeScorePred = parseInt(homeScoreInput.value) || 0;
                    const awayScorePred = parseInt(awayScoreInput.value) || 0;
                    const isLocked = lockBtn.dataset.locked === 'true';

                    const updatedPred = {
                        ...origPred,
                        homeScorePred,
                        awayScorePred,
                        isLocked
                    };

                    if (homeScoreAltInput && awayScoreAltInput) {
                        updatedPred.homeScorePredAlt = parseInt(homeScoreAltInput.value) || 0;
                        updatedPred.awayScorePredAlt = parseInt(awayScoreAltInput.value) || 0;
                    }

                    btn.disabled = true;
                    const origText = btn.textContent;
                    btn.textContent = '...';

                    const saved = await savePrediction(updatedPred, true);
                    
                    btn.disabled = false;
                    btn.textContent = origText;

                    if (saved) {
                        alert('Tahmin başarıyla güncellendi!');
                        // Update our local predictions list cache so it doesn't revert if toggled again
                        const predIdx = allPredictions.findIndex(pr => pr.userId === userId && pr.matchId === matchId);
                        if (predIdx >= 0) {
                            allPredictions[predIdx] = saved;
                        }
                        this.appState.refreshDashboard();
                    } else {
                        alert('Tahmin güncellenirken hata oluştu.');
                    }
                });
            });

            // Bind User Details Save Buttons
            this.container.querySelectorAll('.admin-save-user-details-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = btn.dataset.userId;
                    const parentCard = btn.closest('.user-admin-card');
                    
                    const nameInput = parentCard.querySelector('.admin-edit-username');
                    const pwInput = parentCard.querySelector('.admin-edit-password');
                    const ptsInput = parentCard.querySelector('.admin-edit-points');
                    const badgeSelect = parentCard.querySelector('.admin-edit-badge');
                    
                    const name = nameInput.value.trim();
                    const password = pwInput.value.trim();
                    const points = parseInt(ptsInput.value) || 0;
                    const badgeVal = badgeSelect.value;
                    const badge = badgeVal === 'none' ? null : badgeVal;
                    
                    if (!name) {
                        alert("Kullanıcı adı boş bırakılamaz!");
                        return;
                    }
                    
                    btn.disabled = true;
                    const origText = btn.textContent;
                    btn.textContent = 'Kaydediliyor...';
                    
                    const details = { name, points, badge };
                    const origPw = pwInput.dataset.orig || '';
                    if (password && password !== origPw) {
                        details.password = password;
                    }
                    
                    const success = await updateUserDetails(userId, details);
                    
                    btn.disabled = false;
                    btn.textContent = origText;
                    
                    if (success) {
                        alert("Kullanıcı bilgileri başarıyla güncellendi!");
                        this.appState.refreshDashboard();
                    } else {
                        alert("Kullanıcı bilgileri güncellenirken hata oluştu.");
                    }
                });
            });

            // Bind User Toggle Password Visibility Buttons
            this.container.querySelectorAll('.admin-toggle-pw-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const input = btn.previousElementSibling;
                    if (input.type === 'password') {
                        input.type = 'text';
                        btn.textContent = 'Gizle';
                    } else {
                        input.type = 'password';
                        btn.textContent = 'Göster';
                    }
                });
            });

            // Bind User Delete Buttons
            this.container.querySelectorAll('.admin-delete-user-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.userId;
                    const parentCard = btn.closest('.user-admin-card');
                    const userName = parentCard.querySelector('.admin-edit-username').value;
                    
                    if (confirm(`"${userName}" isimli kullanıcıyı ve bu kullanıcıya ait TÜM tahminleri kalıcı olarak silmek istediğinize emin misiniz?`)) {
                        btn.disabled = true;
                        const success = await deleteUser(userId);
                        if (success) {
                            alert("Kullanıcı başarıyla silindi!");
                            this.appState.refreshDashboard();
                        } else {
                            btn.disabled = false;
                            alert("Kullanıcı silinirken bir hata oluştu.");
                        }
                    }
                });
            });


            // Bind search filtering
            const searchInput = document.getElementById('admin-user-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    this.container.querySelectorAll('.user-admin-card').forEach(card => {
                        const uName = card.dataset.userName;
                        if (uName.includes(query)) {
                            card.classList.remove('hidden');
                        } else {
                            card.classList.add('hidden');
                        }
                    });
                });
            }

            if (window.lucide) {
                window.lucide.createIcons();
            }
        } else if (this.activeAdminTab === 'players') {
            this.container.innerHTML = tabHeaderHtml;
            await this.renderPlayersTabView(matches);
        }

        this.attachGlobalTabListeners();
    }

    renderLoginView() {
        this.container.innerHTML = `
            <div class="bg-slate-950/40 border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center max-w-sm mx-auto shadow-2xl mt-8 relative overflow-hidden">
                <!-- Glow highlight -->
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 bg-brand-gold/20 blur-[15px] pointer-events-none"></div>

                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-red via-brand-gold to-brand-blue flex items-center justify-center text-black mb-4 shadow-neon-gold animate-pulse">
                    <i data-lucide="lock" class="w-5.5 h-5.5"></i>
                </div>
                
                <h3 class="text-sm font-outfit font-black text-white uppercase tracking-wider">YÖNETİCİ GİRİŞİ</h3>
                <p class="text-[10px] text-slate-400 mt-1 mb-5">Hassas API ve veri işlemleri için şifreyi giriniz.</p>
                
                <div class="w-full flex flex-col gap-2.5">
                    <input type="password" id="admin-password-input" class="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-center text-xs outline-none text-slate-100 placeholder:text-slate-600 font-bold focus:border-brand-gold transition-all shadow-inner" placeholder="Şifrenizi Giriniz...">
                    <button id="admin-login-btn" class="w-full py-2 bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green/90 hover:to-brand-blue/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-950/50">
                        KİLİDİ AÇ
                    </button>
                </div>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Attach Login listener
        const pwInput = document.getElementById('admin-password-input');
        const loginBtn = document.getElementById('admin-login-btn');
        
        const tryLogin = async () => {
            const hashedInput = await hashPassword(pwInput.value);
            if (hashedInput === CONFIG.ADMIN_PASSCODE_HASH) {
                this.isAuthorized = true;
                this.render();
            } else {
                alert("Hatalı Şifre! Lütfen tekrar deneyiniz.");
                pwInput.value = '';
                pwInput.focus();
            }
        };

        loginBtn.addEventListener('click', tryLogin);
        pwInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') tryLogin();
        });
    }

    attachAdminEventListeners() {
        // 1. DB Reset Button
        const resetBtn = document.getElementById('admin-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm("Uygulamadaki tüm kullanıcı puanlarını, tahminleri ve maçları sıfırlamak istediğinize emin misiniz?")) {
                    resetMockDb();
                    alert("Veritabanı başarıyla sıfırlandı!");
                    this.appState.refreshDashboard();
                }
            });
        }

        // 1.2 DB Reset Jokers Button
        const resetJokersBtn = document.getElementById('admin-reset-jokers-btn');
        if (resetJokersBtn) {
            resetJokersBtn.addEventListener('click', async () => {
                if (confirm("Tüm kullanıcıların joker haklarını (her birinden 1 adet olacak şekilde) sıfırlamak istediğinize emin misiniz?")) {
                    try {
                        const success = await resetAllUsersJokers();
                        if (success) {
                            alert("Tüm kullanıcıların jokerleri başarıyla sıfırlandı!");
                            this.appState.refreshDashboard();
                        }
                    } catch (e) {
                        alert("Jokerler sıfırlanırken bir hata oluştu: " + e.message);
                    }
                }
            });
        }

        // 2. Save Analysis
        const saveAnalysisBtn = document.getElementById('admin-save-analysis-btn');
        const analysisMatchSelect = document.getElementById('admin-analysis-match-select');
        const analysisTextarea = document.getElementById('admin-analysis-textarea');
        
        // Initial setup for textarea
        if (analysisMatchSelect) {
            const updateTextarea = () => {
                const matchId = analysisMatchSelect.value;
                const match = this.appState.matches.find(m => m.id === matchId);
                if (match) {
                    analysisTextarea.value = match.analysis || '';
                }
            };
            analysisMatchSelect.addEventListener('change', updateTextarea);
            updateTextarea();
        }

        if (saveAnalysisBtn) {
            saveAnalysisBtn.addEventListener('click', async () => {
                const matchId = analysisMatchSelect.value;
                const success = await updateAdminAnalysis(matchId, analysisTextarea.value);
                if (success) {
                    alert("Analiz başarıyla güncellendi!");
                    this.appState.refreshDashboard();
                }
            });
        }

        // 3. Complete Match trigger
        const finalizeBtn = document.getElementById('admin-comp-finalize-btn');
        const fetchApiBtn = document.getElementById('admin-comp-fetch-api-btn');
        const compMatchSelect = document.getElementById('admin-complete-match-select');
        const compHomeScore = document.getElementById('admin-comp-home-score');
        const compAwayScore = document.getElementById('admin-comp-away-score');

        if (compMatchSelect) {
            const populateForm = () => {
                const matchId = compMatchSelect.value;
                if (!matchId) return;
                const matchObj = this.appState.matches.find(m => m.id === matchId);
                if (matchObj) {
                    if (compHomeScore) compHomeScore.value = matchObj.homeScore !== undefined ? matchObj.homeScore : 0;
                    if (compAwayScore) compAwayScore.value = matchObj.awayScore !== undefined ? matchObj.awayScore : 0;
                    
                    const compHtResult = document.getElementById('admin-comp-ht-result');
                    if (compHtResult && matchObj.sideQuestions?.htResult) {
                        compHtResult.value = matchObj.sideQuestions.htResult;
                    }
                    
                    const compFirstScorer = document.getElementById('admin-comp-first-scorer');
                    if (compFirstScorer && matchObj.sideQuestions?.firstScorer) {
                        compFirstScorer.value = matchObj.sideQuestions.firstScorer;
                    }
                    
                    const compRedCard = document.getElementById('admin-comp-red-card');
                    if (compRedCard && matchObj.sideQuestions?.redCard !== undefined) {
                        compRedCard.value = String(matchObj.sideQuestions.redCard);
                    }
                    
                    const compCorners = document.getElementById('admin-comp-corners');
                    if (compCorners && matchObj.sideQuestions?.cornersOverUnder) {
                        compCorners.value = matchObj.sideQuestions.cornersOverUnder;
                    }
                    
                    this.compExtraData = null; // reset
                }
            };
            compMatchSelect.addEventListener('change', populateForm);
            populateForm();
        }

        if (fetchApiBtn) {
            fetchApiBtn.addEventListener('click', async () => {
                const matchId = compMatchSelect.value;
                if (!matchId) {
                    alert("Lütfen sonuçlandırmak için önce bir maç seçin!");
                    return;
                }
                
                fetchApiBtn.disabled = true;
                fetchApiBtn.innerHTML = "⌛ Çekiliyor...";
                
                try {
                    const data = await fetchMatchStatsFromApi(matchId);
                    
                    if (compHomeScore) compHomeScore.value = data.homeScore;
                    if (compAwayScore) compAwayScore.value = data.awayScore;
                    
                    const compHtResult = document.getElementById('admin-comp-ht-result');
                    if (compHtResult) compHtResult.value = data.htResult;
                    
                    const compFirstScorer = document.getElementById('admin-comp-first-scorer');
                    if (compFirstScorer) compFirstScorer.value = data.firstScorer;
                    
                    const compRedCard = document.getElementById('admin-comp-red-card');
                    if (compRedCard) compRedCard.value = String(data.redCard);
                    
                    const compCorners = document.getElementById('admin-comp-corners');
                    if (compCorners) compCorners.value = data.cornersOverUnder;
                    
                    this.compExtraData = {
                        statistics: data.statistics,
                        incidents: data.incidents
                    };
                    
                    alert("Maç verileri API'den başarıyla çekildi ve form alanları dolduruldu! Lütfen kontrol edin ve ardından sonuçlandırın.");
                } catch (err) {
                    console.error(err);
                    alert("API'den veri çekilemedi: " + err.message);
                } finally {
                    fetchApiBtn.disabled = false;
                    fetchApiBtn.innerHTML = "🔄 İstatistikleri API'den Çek";
                }
            });
        }

        if (finalizeBtn) {
            finalizeBtn.addEventListener('click', async () => {
                const matchId = compMatchSelect.value;
                const hScore = parseInt(compHomeScore.value);
                const aScore = parseInt(compAwayScore.value);

                const compHtResult = document.getElementById('admin-comp-ht-result');
                const compFirstScorer = document.getElementById('admin-comp-first-scorer');
                const compRedCard = document.getElementById('admin-comp-red-card');
                const compCorners = document.getElementById('admin-comp-corners');

                const sideAnswers = {
                    htResult: compHtResult ? compHtResult.value : "draw",
                    firstScorer: compFirstScorer ? compFirstScorer.value.trim() : "Diğer",
                    redCard: compRedCard ? compRedCard.value === "true" : false,
                    cornersOverUnder: compCorners ? compCorners.value : "under"
                };

                const extraData = this.compExtraData || {};

                const success = await completeMatch(matchId, hScore, aScore, sideAnswers, extraData);
                if (success) {
                    this.compExtraData = null; // reset
                    alert("Maç resmi olarak sonuçlandırıldı, puanlama algoritması koşturuldu ve liderlik tablosu güncellendi!");
                    
                    // Hide live indicators if no other live matches
                    const matches = await getMatches();
                    const liveCount = matches.filter(m => m.status === 'LIVE').length;
                    if (liveCount === 0) {
                        const indicator = document.getElementById('live-indicator');
                        if (indicator) {
                            indicator.classList.remove('flex');
                            indicator.classList.add('hidden');
                        }
                    }

                    this.appState.refreshDashboard();
                }
            });
        }

        // 4. Gol & Asist Krallığı Tab listeners
        const goalsTabBtn = document.getElementById('admin-stats-goals-tab');
        const assistsTabBtn = document.getElementById('admin-stats-assists-tab');
        const metricLabel = document.getElementById('admin-stats-metric-label');

        if (goalsTabBtn && assistsTabBtn) {
            goalsTabBtn.addEventListener('click', () => {
                this.activeStatsTab = 'goals';
                goalsTabBtn.classList.add('bg-brand-gold', 'text-black', 'font-black', 'font-extrabold');
                goalsTabBtn.classList.remove('text-slate-400');
                assistsTabBtn.classList.remove('bg-brand-gold', 'text-black', 'font-black', 'font-extrabold');
                assistsTabBtn.classList.add('text-slate-400');
                if (metricLabel) metricLabel.textContent = 'Gol Sayısı';
                this.renderAdminStatsPlayers();
            });

            assistsTabBtn.addEventListener('click', () => {
                this.activeStatsTab = 'assists';
                assistsTabBtn.classList.add('bg-brand-gold', 'text-black', 'font-black', 'font-extrabold');
                assistsTabBtn.classList.remove('text-slate-400');
                goalsTabBtn.classList.remove('bg-brand-gold', 'text-black', 'font-black', 'font-extrabold');
                goalsTabBtn.classList.add('text-slate-400');
                if (metricLabel) metricLabel.textContent = 'Asist Sayısı';
                this.renderAdminStatsPlayers();
            });
        }

        // 5. Oyuncu Ekle trigger
        const addPlayerBtn = document.getElementById('admin-add-player-btn');
        const playerNameInput = document.getElementById('admin-stats-player-name');
        const playerTeamSelect = document.getElementById('admin-stats-player-team');
        const playerCountInput = document.getElementById('admin-stats-player-count');
        const playerRatingInput = document.getElementById('admin-stats-player-rating');

        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => {
                const name = playerNameInput.value.trim();
                const team = playerTeamSelect.value;
                const count = parseInt(playerCountInput.value) || 0;
                const rating = parseFloat(playerRatingInput.value) || 0.0;

                if (!name) {
                    alert('Lütfen geçerli bir oyuncu ismi giriniz.');
                    playerNameInput.focus();
                    return;
                }

                const isAssists = this.activeStatsTab === 'assists';
                const newPlayer = { name, team, rating };
                if (isAssists) {
                    newPlayer.assists = count;
                    if (!this.localStats.topAssists) this.localStats.topAssists = [];
                    this.localStats.topAssists.push(newPlayer);
                    this.localStats.topAssists.sort((a, b) => b.assists - a.assists || b.rating - a.rating);
                } else {
                    newPlayer.goals = count;
                    if (!this.localStats.topScorers) this.localStats.topScorers = [];
                    this.localStats.topScorers.push(newPlayer);
                    this.localStats.topScorers.sort((a, b) => b.goals - a.goals || b.rating - a.rating);
                }

                // Reset inputs
                playerNameInput.value = '';
                playerCountInput.value = '1';
                playerRatingInput.value = '8.0';

                this.renderAdminStatsPlayers();
            });
        }

        // 6. Save Stats to DB trigger
        const saveStatsBtn = document.getElementById('admin-save-stats-btn');
        if (saveStatsBtn) {
            saveStatsBtn.addEventListener('click', async () => {
                saveStatsBtn.disabled = true;
                const origText = saveStatsBtn.textContent;
                saveStatsBtn.textContent = 'Kaydediliyor...';

                const success = await saveApiStats(this.localStats.topScorers || [], this.localStats.topAssists || []);
                saveStatsBtn.disabled = false;
                saveStatsBtn.textContent = origText;

                if (success) {
                    alert('Gol ve Asist Krallığı veritabanına başarıyla kaydedildi!');
                    this.appState.refreshDashboard();
                } else {
                    alert('Veritabanı kaydı sırasında bir hata oluştu.');
                }
            });
        }

        // 3.5. Match Details & Status Editor manual updates
        const editMatchSelect = document.getElementById('admin-edit-match-select');
        const editHomeTeam = document.getElementById('admin-edit-home-team');
        const editAwayTeam = document.getElementById('admin-edit-away-team');
        const editMatchStatus = document.getElementById('admin-edit-match-status');
        const editMatchGroup = document.getElementById('admin-edit-match-group');
        const editHomeFlag = document.getElementById('admin-edit-home-flag');
        const editAwayFlag = document.getElementById('admin-edit-away-flag');
        const editMatchDate = document.getElementById('admin-edit-match-date');
        const editSofaId = document.getElementById('admin-edit-sofa-id');
        const editSportDbId = document.getElementById('admin-edit-sportdb-id');
        const editMatchAnalysis = document.getElementById('admin-edit-match-analysis');
        const editMatchSaveBtn = document.getElementById('admin-edit-match-save-btn');

        if (editMatchSelect && editHomeTeam && editAwayTeam && editMatchStatus && editMatchGroup && editHomeFlag && editAwayFlag && editMatchDate && editSofaId && editSportDbId && editMatchAnalysis) {
            const updateMatchForm = () => {
                const matchId = editMatchSelect.value;
                const match = this.appState.matches.find(m => m.id === matchId);
                if (match) {
                    editHomeTeam.value = match.homeTeam;
                    editAwayTeam.value = match.awayTeam;
                    editMatchStatus.value = match.status || 'SCHEDULED';
                    editMatchGroup.value = match.group || '';
                    editHomeFlag.value = match.homeFlag || '';
                    editAwayFlag.value = match.awayFlag || '';
                    editMatchDate.value = match.date || '';
                    editSofaId.value = match.sofaScoreId || '';
                    editSportDbId.value = match.sportDbEventId || '';
                    editMatchAnalysis.value = match.analysis || '';
                }
            };
            editMatchSelect.addEventListener('change', updateMatchForm);
            updateMatchForm();
        }

        if (editMatchSaveBtn) {
            editMatchSaveBtn.addEventListener('click', async () => {
                const matchId = editMatchSelect.value;
                const fields = {
                    homeTeam: editHomeTeam.value,
                    awayTeam: editAwayTeam.value,
                    status: editMatchStatus.value,
                    group: editMatchGroup.value,
                    homeFlag: editHomeFlag.value,
                    awayFlag: editAwayFlag.value,
                    date: editMatchDate.value.trim(),
                    sofaScoreId: editSofaId.value.trim(),
                    sportDbEventId: editSportDbId.value.trim(),
                    analysis: editMatchAnalysis.value.trim()
                };

                editMatchSaveBtn.disabled = true;
                const origText = editMatchSaveBtn.textContent;
                editMatchSaveBtn.textContent = 'Güncelleniyor...';

                const success = await updateMatchDetails(matchId, fields);
                
                editMatchSaveBtn.disabled = false;
                editMatchSaveBtn.textContent = origText;

                if (success) {
                    alert('Maç detayları başarıyla güncellendi!');
                    // Reload matches state in parent app
                    await this.appState.loadState();
                    this.render();
                } else {
                    alert('Maç güncellenirken hata oluştu.');
                }
            });
        }
    }

    renderAdminStatsPlayers() {
        const listContainer = document.getElementById('admin-stats-players-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        const isAssists = this.activeStatsTab === 'assists';
        const list = isAssists ? this.localStats.topAssists : this.localStats.topScorers;

        if (!list || list.length === 0) {
            listContainer.innerHTML = `<div class="text-center py-4 text-xs text-slate-500 italic">Oyuncu bulunmamaktadır.</div>`;
            return;
        }

        list.forEach((p, idx) => {
            const val = isAssists ? p.assists : p.goals;
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-xs text-slate-200';
            item.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-400 w-4">${idx + 1}</span>
                    <div class="flex flex-col">
                        <span class="font-bold text-white">${p.name}</span>
                        <span class="text-[9px] text-slate-400 uppercase tracking-wider">${p.team}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-right">
                        <span class="font-black text-brand-gold">${val} ${isAssists ? 'Asist' : 'Gol'}</span>
                        <span class="text-[9px] text-slate-500 block">Rating: ${p.rating.toFixed(1)}</span>
                    </div>
                    <button class="admin-delete-player-btn w-6 h-6 rounded bg-red-950/40 hover:bg-red-900 border border-red-500/30 flex items-center justify-center text-red-400 transition-colors" data-index="${idx}" type="button">
                        ✕
                    </button>
                </div>
            `;
            
            // Delete button binding
            item.querySelector('.admin-delete-player-btn').addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                if (isAssists) {
                    this.localStats.topAssists.splice(index, 1);
                } else {
                    this.localStats.topScorers.splice(index, 1);
                }
                this.renderAdminStatsPlayers();
            });

            listContainer.appendChild(item);
        });
    }

    attachGlobalTabListeners() {
        const tabSystem = document.getElementById('admin-tab-system');
        const tabUsers = document.getElementById('admin-tab-users');
        const tabPlayers = document.getElementById('admin-tab-players');
        
        if (tabSystem) {
            tabSystem.addEventListener('click', () => {
                this.activeAdminTab = 'system';
                this.render();
            });
        }
        if (tabUsers) {
            tabUsers.addEventListener('click', () => {
                this.activeAdminTab = 'users';
                this.render();
            });
        }
        if (tabPlayers) {
            tabPlayers.addEventListener('click', () => {
                this.activeAdminTab = 'players';
                this.render();
            });
        }
    }

    async renderPlayersTabView(matches) {
        const teams = [...new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam]))].sort();
        
        // Find default selected team
        if (!this.selectedPlayerTeam) {
            this.selectedPlayerTeam = teams[0] || '';
        }
        
        this.container.innerHTML += `
            <div class="flex flex-col gap-6">
                <!-- PART A: PLAYER POOL MANAGEMENT -->
                <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <h3 class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <i data-lucide="users" class="w-4 h-4 text-brand-green"></i>
                        Oyuncu Havuzu & Kadro Düzenleme
                    </h3>
                    
                    <div class="flex flex-col gap-3">
                        <div class="flex items-center gap-2">
                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Takım Seç:</label>
                            <select id="admin-players-team-select" class="flex-grow bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none">
                                ${teams.map(t => `<option value="${t}" ${t === this.selectedPlayerTeam ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                        
                        <!-- Scrollable Players List -->
                        <div id="admin-players-list-container" class="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                            <!-- Injected dynamically -->
                        </div>

                        <!-- Add New Player Form -->
                        <div class="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2.5">
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Yeni Oyuncu Ekle</span>
                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                    <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Oyuncu Adı</label>
                                    <input type="text" id="admin-new-player-name" class="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none" placeholder="Örn: Hakan Çalhanoğlu">
                                </div>
                                <div>
                                    <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Pozisyon</label>
                                    <select id="admin-new-player-pos" class="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none">
                                        <option value="KL">KL (Kaleci)</option>
                                        <option value="DEF">DEF (Defans)</option>
                                        <option value="ORT">ORT (Orta Saha)</option>
                                        <option value="FOR">FOR (Forvet)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Fiyat (Milyon)</label>
                                    <input type="number" id="admin-new-player-price" step="0.1" value="5.5" class="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none">
                                </div>
                            </div>
                            <button id="admin-add-new-player-btn" class="w-full py-2 bg-brand-green hover:bg-brand-green/90 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md" type="button">
                                Yeni Oyuncuyu Kaydet 💾
                            </button>
                        </div>
                    </div>
                </div>

                <!-- PART B: SOFASCORE AUTOMATION & RATINGS INJECTOR -->
                <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <h3 class="text-xs font-outfit font-black text-brand-cyan uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <i data-lucide="gamepad-2" class="w-4 h-4 text-brand-cyan"></i>
                        SofaScore Otomasyonu & Oyuncu Reyting Girişi
                    </h3>
                    
                    <div class="flex flex-col gap-3">
                        <!-- Auto sync button -->
                        <button id="admin-auto-sync-btn" class="w-full py-2.5 bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan/90 hover:to-brand-blue/90 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 mb-1 border border-cyan-400/20" type="button">
                            <i data-lucide="bot" class="w-4 h-4 text-slate-950 animate-pulse"></i> Biten Maçları SofaScore'dan Otomatik Güncelle 🤖
                        </button>

                        <!-- Search and Filter Panel -->
                        <div class="flex flex-col sm:flex-row gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                            <input type="text" id="admin-match-search-input" class="flex-grow bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white outline-none focus:border-brand-cyan placeholder:text-slate-600 font-bold" placeholder="Eşleşme ara (Örn: Almanya)...">
                            <select id="admin-match-filter-select" class="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-200 outline-none focus:border-brand-cyan shrink-0 font-bold">
                                <option value="all">Tüm Eşleşmeler</option>
                                <option value="completed">Biten Maçlar</option>
                                <option value="upcoming">Bekleyen Maçlar</option>
                                <option value="missing">SofaScore Linki Eksik</option>
                            </select>
                        </div>

                        <!-- Match List Container -->
                        <div id="admin-matches-list-scroll" class="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1 border border-white/5 p-2 rounded-xl bg-black/20">
                            <!-- Injected dynamically -->
                        </div>

                        <!-- Dynamic Player Ratings Editor Section -->
                        <div id="admin-active-match-editor-section" class="hidden border-t border-white/5 pt-4 mt-2 flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <h4 id="admin-active-match-title" class="text-xs font-black text-brand-gold uppercase tracking-wider flex items-center gap-1.5">
                                    <i data-lucide="edit-3" class="w-3.5 h-3.5 text-brand-gold"></i>
                                    Oyuncu Reyting Girişi
                                </h4>
                                <button id="admin-ratings-clear-btn" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-black uppercase tracking-wider rounded border border-white/5 transition-all" type="button">
                                    Temizle (6.0)
                                </button>
                            </div>

                            <!-- Match Players Ratings List -->
                            <div id="admin-ratings-players-container" class="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 border border-white/5 p-2 rounded-xl bg-black/25">
                                <!-- Injected dynamically -->
                            </div>

                            <button id="admin-ratings-save-btn" class="w-full py-2.5 bg-gradient-to-r from-brand-gold to-yellow-600 hover:from-brand-gold/90 hover:to-yellow-600/90 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-yellow-950/40" type="button">
                                Reytingleri Kaydet & Puanları Dağıt 💾
                            </button>
                        </div>
                    </div>
                </div>

                <!-- PART C: SOFASCORE FANTEZİ FİYAT ENTEGRASYONU -->
                <div class="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <h3 class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <i data-lucide="coins" class="w-4 h-4 text-brand-gold"></i>
                        SofaScore Fantezi Fiyat Entegrasyonu
                    </h3>
                    
                    <div class="flex flex-col gap-3">
                        <div class="text-[10px] text-slate-400 bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-2 leading-relaxed">
                            <span class="font-bold text-white flex items-center gap-1">
                                <i data-lucide="help-circle" class="w-3.5 h-3.5 text-brand-cyan"></i>
                                Nasıl Kullanılır?
                            </span>
                            <ol class="list-decimal pl-4 space-y-1">
                                <li>
                                    SofaScore Fantezi Kadro Kurma sayfasına gidin: 
                                    <a href="https://www.sofascore.com/tr/fantasy/competition/0/create" target="_blank" class="text-brand-cyan hover:underline font-bold">https://www.sofascore.com/tr/fantasy/competition/0/create</a>
                                </li>
                                <li>Fantezi sayfasındayken tarayıcınızın konsolunu açın (<b>F12 -> Console</b> veya <b>Ctrl+Shift+I</b>).</li>
                                <li>Aşağıdaki <b>tarayıcı kodunu</b> kopyalayıp konsola yapıştırın ve <b>Enter</b> tuşuna basın:</li>
                            </ol>
                            
                            <!-- Browser code block -->
                            <div class="relative mt-1">
                                <textarea id="admin-scraper-snippet" readonly class="w-full h-24 bg-slate-950 text-slate-300 text-[9px] font-mono p-2 rounded border border-white/10 outline-none select-all resize-none">/* SofaScore Fantasy Scraper */
(async () => {
    const list = [];
    const addPlayer = (name, price) => {
        if (!name || isNaN(price)) return;
        name = name.trim();
        const invalidNames = ["KL", "DEF", "ORT", "FOR", "FİYAT", "FORM", "PTS", "P/R", "SEL%", "POZİSYON", "TAKIM"];
        if (name.length > 2 && name.length < 35 && !invalidNames.includes(name.toUpperCase()) && !name.includes("%") && isNaN(name)) {
            list.push({ name, price });
        }
    };

    try {
        let compId = window.location.pathname.match(/\\/competition\\/(\\d+)/)?.[1];
        if (!compId || compId === "0") {
            console.log("URL'de turnuva ID'si bulunamadı (0). Aktif turnuva listesi API'den çekiliyor...");
            const activeRes = await fetch("https://www.sofascore.com/api/v1/fantasy/competitions/active");
            if (activeRes.ok) {
                const activeData = await activeRes.json();
                if (Array.isArray(activeData) && activeData.length > 0) {
                    compId = activeData[0].id || activeData[0].competitionId;
                } else if (activeData && activeData.competitions && activeData.competitions.length > 0) {
                    compId = activeData.competitions[0].id;
                }
            }
        }

        if (compId && compId !== "0") {
            console.log("Turnuva ID tespit edildi:", compId, ". Oyuncu listesi çekiliyor...");
            const res = await fetch("https://www.sofascore.com/api/v1/fantasy/competition/" + compId + "/players");
            if (res.ok) {
                const data = await res.json();
                const players = data.players || data.playerPool || [];
                players.forEach(p => {
                    const name = p.player?.name || p.player?.shortName || p.name || "";
                    const price = p.price !== undefined ? p.price : p.value;
                    addPlayer(name, price);
                });
            }
        }
    } catch (err) {
        console.warn("API üzerinden veri çekilemedi, DOM taranıyor...", err);
    }

    if (list.length === 0) {
        console.log("DOM taraması başlatılıyor...");
        const invalidNames = [
            "KL", "DEF", "ORT", "FOR", "GK", "DF", "MF", "FW", 
            "FİYAT", "FORM", "PTS", "P/R", "SEL%", "POZİSYON", "TAKIM", 
            "BÜTÇE", "OYUNCU", "FANTASY", "KADRO", "LİG", "FİKSTÜR", 
            "İSTATİSTİK", "OYUNU ARA", "FILTRELE", "SIRALA", "SOFASCORE",
            "PUAN", "DEĞER", "SEÇİLME", "KAPTAN", "YARDIMCI", "KULÜP",
            "ÜLKE", "FİLTRE", "ARA", "TEMİZLE", "TÜMÜ", "SQUAD", "TRANSFERS",
            "RULES", "LEAGUE", "MATCHDAY", "STATS", "FILTER", "SORT", "SEARCH",
            "ALL", "PLAYERS", "PLAYER", "BY POINTS", "BY PRICE", "BY VALUE", "BANKA"
        ];
        
        const getNameFromLines = (lines) => {
            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                // Oyuncu isimleri rakam barındırmaz
                if (/\\d/.test(line)) continue;
                // Arayüz noktalama işaretlerini ele
                if (line.includes(":") || line.includes("/") || line.includes(",") || line.includes("|")) continue;
                // Pozisyon ve ülke kodlarını ele (ör. "FOR", "SEN" gibi tamamı büyük ve <=3 karakter olanlar)
                if (line.length <= 3 && line === line.toUpperCase()) continue;
                // Klasik yasaklı kelimeleri ele
                if (invalidNames.includes(line.toUpperCase())) continue;
                
                if (line.length > 2 && line.length < 35) {
                    return line;
                }
            }
            return null;
        };

        // Fiyat barındıran tüm küçük/orta elemanları tara
        document.querySelectorAll("div, tr, li").forEach(el => {
            const text = (el.innerText || "").trim();
            if (text.length > 300) return; // Çok büyük kapsayıcıları ele
            
            // Fiyat eşleşmelerini bul
            const priceMatches = text.match(/[€$₺]\\s*\\d+(?:\\.\\d+)?\\s*M/gi) || text.match(/\\b\\d+(?:\\.\\d+)?\\s*M\\b/gi) || [];
            if (priceMatches.length === 1) {
                const priceMatch = priceMatches[0].match(/(\\d+(?:\\.\\d+)?)/);
                if (priceMatch) {
                    const price = parseFloat(priceMatch[1]);
                    const lines = text.split("\\n").map(l => l.trim()).filter(Boolean);
                    const name = getNameFromLines(lines);
                    if (name) {
                        addPlayer(name, price);
                    }
                }
            }
        });
    }

    if (list.length > 0) {
        const unique = Array.from(new Map(list.map(p => [p.name, p])).values());
        const jsonStr = JSON.stringify(unique);
        console.log("Kopyalanacak Veri:", jsonStr);
        try {
            await navigator.clipboard.writeText(jsonStr);
            alert("Başarılı! " + unique.length + " oyuncu fiyatı panoya kopyalandı. Admin panelindeki kutuya yapıştırabilirsiniz.");
        } catch (err) {
            console.warn("Otomatik kopyalama başarısız, kutu açılıyor...", err);
            prompt("Otomatik kopyalama tarayıcı tarafından engellendi. Lütfen aşağıdaki metni seçip kopyalayın (Ctrl+C):", jsonStr);
        }
    } else {
        alert("Oyuncu verisi çekilemedi. Sayfadaki oyuncuların listelendiğinden emin olun.");
    }
})();</textarea>
                                <button id="admin-copy-snippet-btn" class="absolute right-2 top-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[8px] font-bold rounded border border-white/10 transition-colors uppercase cursor-pointer" type="button">
                                    Snippet'i Kopyala
                                </button>
                            </div>
                            
                            <ol class="list-decimal pl-4 space-y-1 mt-1" start="4">
                                <li>Kopyalanan veriyi aşağıdaki kutuya yapıştırın ve fiyatları güncelleyin.</li>
                            </ol>
                        </div>

                        <!-- Data paste textarea -->
                        <div class="flex flex-col gap-1.5">
                            <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Kopyalanan Veriyi Buraya Yapıştırın:</label>
                            <textarea id="admin-scraped-data-input" class="w-full h-28 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-gold placeholder:text-slate-600 font-mono" placeholder='[{"name":"Player Name","price":8.5}, ...]'></textarea>
                        </div>
                        
                        <button id="admin-update-prices-btn" class="w-full py-2.5 bg-brand-gold hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2" type="button">
                            <i data-lucide="refresh-cw" class="w-4 h-4 text-slate-950"></i> Oyuncu Fiyatlarını DB'de Güncelle 🔄
                        </button>

                        <div class="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
                            <span class="text-[9px] text-slate-400 leading-normal">
                                Alternatif olarak, SofaScore fiyatlarını tarayıcıdan çekmek yerine, 
                                sistemdeki tüm oyuncuların fiyatlarını <b>otomatik dengeli formüle göre</b> 
                                (pozisyon ve takım gücüne göre 4.0M - 12.0M aralığında) anında hesaplayıp güncelleyebilirsiniz:
                            </span>
                            <button id="admin-auto-calculate-prices-btn" class="w-full py-2.5 bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-brand-cyan/90 hover:to-blue-600/90 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2" type="button">
                                <i data-lucide="sparkles" class="w-4 h-4 text-slate-950"></i> Oyuncu Fiyatlarını Otomatik Dengeli Hesapla ⚡
                            </button>
                        </div>

                        <!-- Import Summary output -->
                        <div id="admin-import-summary" class="hidden text-[10px] bg-black/45 border border-white/5 rounded-xl p-3 flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                            <!-- Injected dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Render dynamic parts
        await this.renderTeamPlayersList(this.selectedPlayerTeam);
        this.renderAdminMatchesList(matches);

        // If a match was previously selected, restore the editor
        if (this.selectedRatingsMatchId) {
            await this.renderActiveMatchEditor(this.selectedRatingsMatchId);
        }

        // Bind event listeners
        const teamSelect = document.getElementById('admin-players-team-select');
        if (teamSelect) {
            teamSelect.addEventListener('change', async (e) => {
                this.selectedPlayerTeam = e.target.value;
                await this.renderTeamPlayersList(this.selectedPlayerTeam);
            });
        }

        // Bind match search and filter
        const matchSearchInput = document.getElementById('admin-match-search-input');
        const matchFilterSelect = document.getElementById('admin-match-filter-select');
        
        if (matchSearchInput) {
            matchSearchInput.addEventListener('input', () => this.renderAdminMatchesList(matches));
        }
        if (matchFilterSelect) {
            matchFilterSelect.addEventListener('change', () => this.renderAdminMatchesList(matches));
        }

        // Bind Auto Sync button
        const autoSyncBtn = document.getElementById('admin-auto-sync-btn');
        if (autoSyncBtn) {
            autoSyncBtn.addEventListener('click', () => this.runAutoSync());
        }

        // Add player button click
        const addPlayerBtn = document.getElementById('admin-add-new-player-btn');
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', async () => {
                const name = document.getElementById('admin-new-player-name').value.trim();
                const pos = document.getElementById('admin-new-player-pos').value;
                const price = parseFloat(document.getElementById('admin-new-player-price').value) || 5.5;

                if (!name) {
                    alert("Lütfen oyuncu adı girin!");
                    return;
                }

                const newPlayer = {
                    id: `p-${this.selectedPlayerTeam.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    name,
                    team: this.selectedPlayerTeam,
                    pos,
                    club: 'Kulüpsüz',
                    rating: 70,
                    price
                };

                await savePlayer(newPlayer);
                alert(`${name} başarıyla oyuncu havuzuna eklendi!`);
                document.getElementById('admin-new-player-name').value = '';
                await this.renderTeamPlayersList(this.selectedPlayerTeam);
            });
        }

        // Clear ratings click
        const clearRatingsBtn = document.getElementById('admin-ratings-clear-btn');
        if (clearRatingsBtn) {
            clearRatingsBtn.addEventListener('click', () => {
                const ratingInputs = document.querySelectorAll('.admin-player-rating-input');
                ratingInputs.forEach(input => {
                    input.value = "6.0";
                });
            });
        }

        // Save ratings click
        const saveRatingsBtn = document.getElementById('admin-ratings-save-btn');
        if (saveRatingsBtn) {
            saveRatingsBtn.addEventListener('click', async () => {
                if (!this.selectedRatingsMatchId) return;
                saveRatingsBtn.disabled = true;
                const origText = saveRatingsBtn.innerHTML;
                saveRatingsBtn.innerHTML = '<i class="w-3.5 h-3.5 animate-spin"></i> Kaydediliyor...';
                try {
                    await this.saveMatchRatings(this.selectedRatingsMatchId);
                    document.getElementById('admin-active-match-editor-section')?.classList.add('hidden');
                    this.selectedRatingsMatchId = null;
                    await this.appState.loadState();
                    this.renderAdminMatchesList(this.appState.matches);
                } catch (err) {
                    alert("Kaydedilirken hata oluştu: " + err.message);
                } finally {
                    saveRatingsBtn.disabled = false;
                    saveRatingsBtn.innerHTML = origText;
                }
            });
        }

        // Copy snippet button click helper
        const copySnippetBtn = document.getElementById('admin-copy-snippet-btn');
        if (copySnippetBtn) {
            copySnippetBtn.addEventListener('click', () => {
                const textarea = document.getElementById('admin-scraper-snippet');
                textarea.select();
                document.execCommand('copy');
                const origText = copySnippetBtn.innerHTML;
                copySnippetBtn.innerHTML = 'KOPYALANDI! ✓';
                setTimeout(() => {
                    copySnippetBtn.innerHTML = origText;
                }, 2000);
            });
        }

        // Auto calculate player prices button click
        const autoCalcBtn = document.getElementById('admin-auto-calculate-prices-btn');
        if (autoCalcBtn) {
            autoCalcBtn.addEventListener('click', async () => {
                if (!confirm("Sistemdeki TÜM oyuncuların fiyatlarını otomatik gerçekçi SofaScore dağılım formülüne (KL: 4.0M-6.0M, DEF: 4.0M-7.0M, ORT: 4.5M-9.0M, FOR: 4.5M-11.5M, takım gücüne göre ölçekli) göre sıfırlamak istediğinize emin misiniz?")) {
                    return;
                }

                autoCalcBtn.disabled = true;
                const origBtnText = autoCalcBtn.innerHTML;
                autoCalcBtn.innerHTML = '<i class="w-4 h-4 animate-spin"></i> Hesaplanıyor...';

                try {
                    const dbPlayers = await getPlayers();
                    let updatedCount = 0;
                    const logDetails = [];

                    for (const p of dbPlayers) {
                        const oldPrice = p.price || 0;
                        const newPrice = calculateRealisticPrice(p, p.team);
                        
                        if (oldPrice !== newPrice) {
                            p.price = newPrice;
                            await savePlayer(p);
                            updatedCount++;
                            logDetails.push(`
                                <div class="flex justify-between py-1 border-b border-white/5 text-[9px]">
                                    <span class="text-slate-300 font-bold">${p.name} (${p.team})</span>
                                    <span class="text-slate-400 font-mono">${oldPrice.toFixed(1)}M ➔ <b class="text-brand-cyan">${p.price.toFixed(1)}M</b></span>
                                </div>
                            `);
                        }
                    }

                    const summaryDiv = document.getElementById('admin-import-summary');
                    if (summaryDiv) {
                        summaryDiv.classList.remove('hidden');
                        summaryDiv.innerHTML = `
                            <div class="text-[10px] text-brand-cyan font-bold mb-2 flex items-center gap-1">
                                <i data-lucide="check-circle" class="w-4 h-4"></i>
                                Otomatik Fiyat Güncellemesi Tamamlandı! (${updatedCount} oyuncu güncellendi)
                            </div>
                            <div class="flex flex-col gap-0.5 max-h-[120px] overflow-y-auto pr-1">
                                ${logDetails.join('') || '<div class="text-slate-500 italic py-1 text-center">Tüm oyuncular zaten en güncel gerçekçi fiyatlara sahipti.</div>'}
                            </div>
                        `;
                        if (window.lucide) window.lucide.createIcons();
                    }

                    alert(`Başarılı! ${updatedCount} oyuncunun fiyatı otomatik dengeli formüle göre güncellendi.`);
                    
                    if (this.appState && typeof this.appState.refresh === 'function') {
                        this.appState.refresh();
                    }

                } catch (err) {
                    alert("Otomatik güncelleme yapılırken hata oluştu: " + err.message);
                } finally {
                    autoCalcBtn.disabled = false;
                    autoCalcBtn.innerHTML = origBtnText;
                }
            });
        }

        // Update prices button click
        const updatePricesBtn = document.getElementById('admin-update-prices-btn');
        if (updatePricesBtn) {
            updatePricesBtn.addEventListener('click', async () => {
                const rawInput = document.getElementById('admin-scraped-data-input').value.trim();
                if (!rawInput) {
                    alert("Lütfen kopyalanan oyuncu verisini yapıştırın!");
                    return;
                }

                let scrapedList = [];
                try {
                    // Try parsing as JSON first
                    if (rawInput.startsWith('[') || rawInput.startsWith('{')) {
                        const parsed = JSON.parse(rawInput);
                        
                        // Use our super-robust JSON traverse parser
                        const traverse = (obj) => {
                            if (!obj || typeof obj !== 'object') return;
                            if (Array.isArray(obj)) {
                                obj.forEach(item => {
                                    if (item && typeof item === 'object') {
                                        let name = '';
                                        let price = null;
                                        
                                        if (item.player && typeof item.player === 'object') {
                                            name = item.player.name || item.player.shortName || item.player.displayName || '';
                                        } else {
                                            name = item.name || item.playerName || item.shortName || '';
                                        }
                                        
                                        price = item.price !== undefined ? item.price : (item.value !== undefined ? item.value : null);
                                        
                                        if (name && price !== null) {
                                            const numPrice = parseFloat(price);
                                            if (!isNaN(numPrice)) {
                                                scrapedList.push({ name: name.trim(), price: numPrice });
                                            }
                                        } else {
                                            Object.values(item).forEach(val => traverse(val));
                                        }
                                    }
                                });
                            } else {
                                Object.values(obj).forEach(val => traverse(val));
                            }
                        };
                        traverse(parsed);
                    } else {
                        // Fallback to plain text line-by-line parsing
                        const lines = rawInput.split('\n');
                        const regexPriceEnd = /(.*?)\s+(\d+(?:\.\d+)?)\s*[Mm]?$/;
                        const regexPriceStart = /^\s*(\d+(?:\.\d+)?)\s*[Mm]?\s+(.*)/;
                        
                        lines.forEach(line => {
                            line = line.trim();
                            if (!line) return;
                            
                            let match = line.match(regexPriceEnd);
                            if (match) {
                                const name = match[1].trim();
                                const price = parseFloat(match[2]);
                                if (name && !isNaN(price)) {
                                    scrapedList.push({ name, price });
                                    return;
                                }
                            }
                            
                            match = line.match(regexPriceStart);
                            if (match) {
                                const price = parseFloat(match[1]);
                                const name = match[2].trim();
                                if (name && !isNaN(price)) {
                                    scrapedList.push({ name, price });
                                    return;
                                }
                            }
                        });
                    }
                } catch (err) {
                    alert("Veri çözümlenirken hata oluştu: " + err.message);
                    return;
                }

                if (scrapedList.length === 0) {
                    alert("Yapıştırılan veriden hiçbir geçerli oyuncu ve fiyat bilgisi ayrıştırılamadı!");
                    return;
                }

                updatePricesBtn.disabled = true;
                const origBtnText = updatePricesBtn.innerHTML;
                updatePricesBtn.innerHTML = '<i class="w-4 h-4 animate-spin"></i> Güncelleniyor...';

                try {
                    const dbPlayers = await getPlayers();
                    let matchedCount = 0;
                    let unmatchedCount = 0;
                    const logDetails = [];
                    const unmatchedNames = [];

                    // For each player in the database
                    for (const p of dbPlayers) {
                        const match = this.findBestMatchLocal(p.name, scrapedList);
                        if (match) {
                            const oldPrice = p.price;
                            p.price = match.price;
                            
                            // Save update to DB
                            await savePlayer(p);
                            matchedCount++;
                            logDetails.push(`
                                <div class="flex justify-between py-1 border-b border-white/5 text-[9px]">
                                    <span class="text-slate-300 font-bold">${p.name} (${p.team})</span>
                                    <span class="text-slate-400 font-mono">${oldPrice.toFixed(1)}M ➔ <b class="text-brand-gold">${p.price.toFixed(1)}M</b></span>
                                </div>
                            `);
                        } else {
                            unmatchedCount++;
                            unmatchedNames.push(`${p.name} (${p.team})`);
                        }
                    }

                    // Render summary
                    const summaryEl = document.getElementById('admin-import-summary');
                    summaryEl.classList.remove('hidden');
                    summaryEl.innerHTML = `
                        <div class="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                            <span class="text-[10px] font-black text-brand-gold uppercase tracking-wider">İçe Aktarım Özeti</span>
                            <span class="text-[8px] bg-brand-green/20 text-brand-green px-1.5 py-0.5 rounded font-black">TAMAMLANDI</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2 mb-3 text-center text-[9px] font-bold">
                            <div class="bg-white/5 p-1.5 rounded-lg border border-white/5">
                                <span class="text-slate-500 block">Sıralanan</span>
                                <span class="text-xs text-white font-black">${scrapedList.length}</span>
                            </div>
                            <div class="bg-brand-green/10 p-1.5 rounded-lg border border-brand-green/10">
                                <span class="text-brand-green block">Eşleşen</span>
                                <span class="text-xs text-brand-green font-black">${matchedCount}</span>
                            </div>
                            <div class="bg-red-950/10 p-1.5 rounded-lg border border-red-500/10">
                                <span class="text-red-400 block">Eşleşmeyen</span>
                                <span class="text-xs text-red-400 font-black">${unmatchedCount}</span>
                            </div>
                        </div>
                        
                        ${logDetails.length > 0 ? `
                            <div class="mb-2">
                                <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Güncellenen Oyuncular</span>
                                <div class="flex flex-col gap-0.5 max-h-[120px] overflow-y-auto pr-1">
                                    ${logDetails.join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${unmatchedNames.length > 0 ? `
                            <div class="border-t border-white/5 pt-2 mt-1">
                                <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Sistemde Olup Eşleşmeyen Oyuncular (${unmatchedNames.length})</span>
                                <div class="text-[9px] text-slate-400 max-h-[80px] overflow-y-auto pr-1 leading-relaxed">
                                    ${unmatchedNames.join(', ')}
                                </div>
                            </div>
                        ` : ''}
                    `;

                    alert(`Başarılı! ${matchedCount} oyuncunun fiyatı güncellendi.`);
                    
                    // Refresh the player list of the currently selected team
                    await this.renderTeamPlayersList(this.selectedPlayerTeam);
                } catch (err) {
                    alert("Fiyatlar güncellenirken hata oluştu: " + err.message);
                } finally {
                    updatePricesBtn.disabled = false;
                    updatePricesBtn.innerHTML = origBtnText;
                }
            });
        }
    }

    renderAdminMatchesList(matches) {
        const listContainer = document.getElementById('admin-matches-list-scroll');
        if (!listContainer) return;

        const searchQuery = (document.getElementById('admin-match-search-input')?.value || '').toLowerCase().trim();
        const filterVal = document.getElementById('admin-match-filter-select')?.value || 'all';

        listContainer.innerHTML = '';

        const filtered = matches.filter(m => {
            const matchName = `${m.homeTeam} vs ${m.awayTeam}`.toLowerCase();
            const matchesSearch = matchName.includes(searchQuery);
            
            if (!matchesSearch) return false;
            
            if (filterVal === 'completed') return m.status === 'FINISHED';
            if (filterVal === 'upcoming') return m.status !== 'FINISHED';
            if (filterVal === 'missing') return !m.sofaScoreId;
            
            return true;
        });

        if (filtered.length === 0) {
            listContainer.innerHTML = `<div class="text-center py-4 text-xs text-slate-500 italic">Eşleşme bulunamadı.</div>`;
            return;
        }

        filtered.forEach(m => {
            const isSelected = m.id === this.selectedRatingsMatchId;
            const div = document.createElement('div');
            div.className = `flex flex-col gap-2.5 p-3 rounded-xl text-xs transition-all border ${
                isSelected ? 'bg-slate-900 border-brand-cyan/40 shadow-md shadow-cyan-950/20' : 'bg-slate-900/40 border-white/5 hover:border-white/10'
            }`;
            
            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <img src="${m.homeFlag}" class="w-5 h-3.5 object-cover rounded-sm border border-white/10" alt="">
                        <span class="font-bold ${isSelected ? 'text-brand-cyan' : 'text-slate-200'}">${m.homeTeam}</span>
                        <span class="text-slate-500 font-bold">vs</span>
                        <span class="font-bold ${isSelected ? 'text-brand-cyan' : 'text-slate-200'}">${m.awayTeam}</span>
                        <img src="${m.awayFlag}" class="w-5 h-3.5 object-cover rounded-sm border border-white/10" alt="">
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${
                            m.status === 'FINISHED' ? 'bg-slate-800 text-slate-400' :
                            m.status === 'LIVE' ? 'bg-red-950/60 text-red-400 border border-red-500/20 animate-pulse' :
                            'bg-cyan-950/60 text-brand-cyan border border-brand-cyan/20'
                        }">${m.status === 'FINISHED' ? 'Bitti' : m.status === 'LIVE' ? 'Canlı' : 'Bekliyor'}</span>
                        
                        <span id="link-status-${m.id}" class="px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${
                            m.sofaScoreId ? 'bg-green-950/50 text-green-400 border border-green-500/20' : 'bg-red-950/50 text-red-400 border border-red-500/20'
                        }">${m.sofaScoreId ? 'Link Hazır ✅' : 'Link Eksik ❌'}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                    <input type="text" id="sofa-input-${m.id}" class="flex-grow bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-brand-cyan placeholder:text-slate-600 font-mono" value="${m.sofaScoreId || ''}" placeholder="SofaScore URL veya ID...">
                    
                    <button class="admin-save-match-link-btn p-1.5 bg-brand-gold hover:bg-yellow-500 text-black rounded-lg transition-all active:scale-95 flex items-center justify-center shrink-0" data-match-id="${m.id}" title="Linki Kaydet" type="button">
                        <i data-lucide="save" class="w-3.5 h-3.5"></i>
                    </button>
                    
                    <button class="admin-fetch-match-data-btn px-2 py-1 bg-brand-green hover:bg-brand-green/90 text-black text-[9px] font-black uppercase rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 shrink-0" data-match-id="${m.id}" type="button">
                        <i data-lucide="zap" class="w-3 h-3"></i> Veri Çek
                    </button>
                </div>
                <div class="flex justify-between items-center mt-1 px-0.5">
                    <span class="text-[8px] text-slate-500">CORS hatası alırsanız eklentiyi aktifleştirin veya sağdaki butonu kullanın -></span>
                    <button class="admin-manual-paste-btn text-[8px] text-brand-cyan hover:underline hover:text-brand-cyan/80 transition-colors font-bold cursor-pointer" data-match-id="${m.id}" type="button">
                        Manuel Veri Yapıştır 📋
                    </button>
                </div>
            `;

            // Bind link save button
            div.querySelector('.admin-save-match-link-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                const matchId = e.currentTarget.dataset.matchId;
                const inputVal = document.getElementById(`sofa-input-${matchId}`).value.trim();
                
                // Parse out ID if URL is pasted
                let parsedId = inputVal;
                if (parsedId.includes("sofascore.com")) {
                    const matchIdFromUrl = parsedId.match(/(?:id:|\/)([0-9]+)(?:[#\?\/]|$)/) || parsedId.match(/\/([0-9]+)$/) || parsedId.match(/([0-9]+)/);
                    if (matchIdFromUrl && matchIdFromUrl[1]) {
                        parsedId = matchIdFromUrl[1];
                    }
                } else {
                    parsedId = parsedId.replace(/[^0-9]/g, '');
                }

                const success = await updateMatchSofaScoreId(matchId, parsedId);
                if (success) {
                    alert("SofaScore bağlantısı başarıyla kaydedildi!");
                    const matchObj = matches.find(match => match.id === matchId);
                    if (matchObj) matchObj.sofaScoreId = parsedId;
                    
                    const badge = document.getElementById(`link-status-${matchId}`);
                    if (badge) {
                        badge.className = parsedId ? 'px-1.5 py-0.5 rounded text-[7px] font-bold uppercase bg-green-950/50 text-green-400 border border-green-500/20' : 'px-1.5 py-0.5 rounded text-[7px] font-bold uppercase bg-red-950/50 text-red-400 border border-red-500/20';
                        badge.textContent = parsedId ? 'Link Hazır ✅' : 'Link Eksik ❌';
                    }
                } else {
                    alert("Bağlantı kaydedilirken hata oluştu.");
                }
            });

            // Bind fetch button
            div.querySelector('.admin-fetch-match-data-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                const matchId = e.currentTarget.dataset.matchId;
                const inputVal = document.getElementById(`sofa-input-${matchId}`).value.trim();
                
                if (!inputVal) {
                    alert("Lütfen önce SofaScore Linki veya ID'si giriniz!");
                    return;
                }

                const fetchBtn = e.currentTarget;
                fetchBtn.disabled = true;
                const origBtnText = fetchBtn.innerHTML;
                fetchBtn.innerHTML = '<i class="w-3 h-3 animate-spin"></i> ...';

                try {
                    await this.fetchRatingsFromApi(matchId, inputVal);
                    this.selectedRatingsMatchId = matchId;
                    
                    this.renderAdminMatchesList(matches);
                    await this.renderActiveMatchEditor(matchId);
                } catch (err) {
                    console.error("Fetch ratings failed:", err);
                    if (confirm(`SofaScore'dan otomatik veri çekilemedi. (${err.message})\n\nBunun yerine lineups JSON verisini el ile yapıştırmak ister misiniz?`)) {
                        this.openManualPasteModal(matchId, inputVal);
                    }
                } finally {
                    fetchBtn.disabled = false;
                    fetchBtn.innerHTML = origBtnText;
                }
            });

            // Bind manual paste button
            div.querySelector('.admin-manual-paste-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const matchId = e.currentTarget.dataset.matchId;
                const inputVal = document.getElementById(`sofa-input-${matchId}`).value.trim();
                
                if (!inputVal) {
                    alert("Lütfen önce SofaScore Linki veya ID'si giriniz!");
                    return;
                }
                
                this.openManualPasteModal(matchId, inputVal);
            });

            listContainer.appendChild(div);
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    async renderActiveMatchEditor(matchId) {
        const editorSection = document.getElementById('admin-active-match-editor-section');
        const editorTitle = document.getElementById('admin-active-match-title');
        if (!editorSection || !editorTitle) return;

        const match = this.appState.matches.find(m => m.id === matchId);
        if (!match) return;

        editorTitle.innerHTML = `<i data-lucide="edit-3" class="w-3.5 h-3.5 text-brand-gold"></i> Oyuncu Reyting Girişi: ${match.homeTeam} vs ${match.awayTeam}`;
        editorSection.classList.remove('hidden');

        await this.renderRatingsMatchPlayers(matchId);

        editorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    async runAutoSync() {
        const matchesToSync = this.appState.matches.filter(m => m.status !== 'FINISHED' && m.sofaScoreId);
        if (matchesToSync.length === 0) {
            alert("SofaScore ID'si tanımlı olan ve sonuçlanmamış bir maç bulunamadı.");
            return;
        }

        const btn = document.getElementById('admin-auto-sync-btn');
        const origText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="w-4 h-4 animate-spin"></i> Senkronizasyon Çalışıyor...';

        let completedCount = 0;
        let errors = [];

        for (const match of matchesToSync) {
            try {
                console.log(`Auto-syncing match: ${match.homeTeam} vs ${match.awayTeam} (${match.sofaScoreId})`);
                
                let data = null;
                try {
                    const response = await fetch(`/.netlify/functions/fetch-sofascore?eventId=${match.sofaScoreId}`);
                    if (response.ok) {
                        data = await response.json();
                    } else {
                        const fallbackRes = await fetch(`/api/fetch-sofascore?eventId=${match.sofaScoreId}`);
                        if (fallbackRes.ok) {
                            data = await fallbackRes.json();
                        }
                    }
                } catch (netErr) {
                    console.warn(`Netlify function failed for match ${match.id}, trying client-side CORS proxy fallback...`, netErr);
                }

                if (!data || data.error) {
                    try {
                        data = await this.fetchSofaScoreDirectly(match.sofaScoreId);
                    } catch (corsErr) {
                        console.error(`CORS proxy also failed for match ${match.id}:`, corsErr);
                        continue;
                    }
                }

                if (data.status === 'FINISHED') {
                    const homePlayers = await getPlayers(match.homeTeam);
                    const awayPlayers = await getPlayers(match.awayTeam);
                    const allMatchPlayers = [...homePlayers, ...awayPlayers];

                    const ratingsMap = {};
                    
                    allMatchPlayers.forEach(p => {
                        const apiMatch = this.findBestMatchLocal(p.name, data.players || []);
                        let rating = 6.0;
                        if (apiMatch) {
                            const val = parseFloat(apiMatch.rating);
                            if (!isNaN(val) && val > 0) {
                                rating = val;
                            }
                        }
                        ratingsMap[p.id] = rating;
                    });

                    const success = await savePlayerRatings(
                        match.id,
                        ratingsMap,
                        match.sofaScoreId,
                        data.homeScore,
                        data.awayScore,
                        'FINISHED',
                        data.statistics || null,
                        data.incidents || []
                    );

                    if (success) {
                        completedCount++;
                        console.log(`Auto-sync success: ${match.homeTeam} vs ${match.awayTeam} completed.`);
                    }
                }
            } catch (err) {
                console.error(`Error auto-syncing match ${match.id}:`, err);
                errors.push(`${match.homeTeam}: ${err.message}`);
            }
        }

        btn.disabled = false;
        btn.innerHTML = origText;

        if (completedCount > 0) {
            alert(`Tebrikler! ${completedCount} adet maç SofaScore üzerinden otomatik olarak sonuçlandırıldı ve kullanıcı puanları güncellendi!`);
            await this.appState.loadState();
            this.render();
        } else {
            if (errors.length > 0) {
                alert(`Senkronizasyon tamamlandı. Yeni sonuçlanan maç bulunamadı. Hatalar:\n${errors.join('\n')}`);
            } else {
                alert("Senkronizasyon tamamlandı. SofaScore üzerinde henüz tamamlanmış yeni bir maç tespit edilmedi.");
            }
        }
    }

    findBestMatchLocal(localName, apiPlayersList) {
        const normalizeName = (str) => {
            if (!str) return "";
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s]/g, "")
                .trim();
        };

        const normLocal = normalizeName(localName);
        const localParts = normLocal.split(/\s+/).filter(Boolean);

        let bestMatch = null;
        let bestScore = 0;

        for (const apiP of apiPlayersList) {
            const normApi = normalizeName(apiP.name);
            if (normLocal === normApi) {
                return apiP;
            }

            if (normApi.includes(normLocal) || normLocal.includes(normApi)) {
                const score = Math.min(normLocal.length, normApi.length) / Math.max(normLocal.length, normApi.length);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = apiP;
                }
            }

            const apiParts = normApi.split(/\s+/).filter(Boolean);
            let intersection = 0;
            for (const lp of localParts) {
                if (apiParts.includes(lp) || normApi.includes(lp)) {
                    intersection++;
                }
            }

            if (intersection > 0) {
                const score = intersection / Math.max(localParts.length, apiParts.length);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = apiP;
                }
            }
        }

        return bestScore >= 0.4 ? bestMatch : null;
    }

    async fetchSofaScoreDirectly(sofaScoreId) {
        const tryFetch = async (proxyUrl) => {
            const eventUrl = `https://www.sofascore.com/api/v1/event/${sofaScoreId}`;
            const lineupsUrl = `https://www.sofascore.com/api/v1/event/${sofaScoreId}/lineups`;
            const statsUrl = `https://www.sofascore.com/api/v1/event/${sofaScoreId}/statistics`;
            const incidentsUrl = `https://www.sofascore.com/api/v1/event/${sofaScoreId}/incidents`;

            const getFinalUrl = (targetUrl) => {
                if (!proxyUrl) return targetUrl;
                if (proxyUrl.includes("corsproxy.org")) {
                    return `https://corsproxy.org/?${targetUrl}`;
                }
                return `${proxyUrl}${encodeURIComponent(targetUrl)}`;
            };

            // 1. Event Details
            const eventRes = await fetch(getFinalUrl(eventUrl));
            if (!eventRes.ok) throw new Error(`Event details fetch failed with status ${eventRes.status}`);
            const eventData = await eventRes.json();

            const status = eventData.event?.status?.type === 'finished' ? 'FINISHED' : 'SCHEDULED';
            const homeScore = eventData.event?.homeScore?.display !== undefined ? parseInt(eventData.event?.homeScore?.display) : null;
            const awayScore = eventData.event?.awayScore?.display !== undefined ? parseInt(eventData.event?.awayScore?.display) : null;

            // 2. Lineups
            let players = [];
            try {
                const lineupsRes = await fetch(getFinalUrl(lineupsUrl));
                if (lineupsRes.ok) {
                    const lineupsData = await lineupsRes.json();
                    const parseTeamLineup = (lineup, teamSide) => {
                        if (!lineup) return;
                        if (lineup.players) {
                            lineup.players.forEach(p => {
                                const name = p.player?.name;
                                const rating = p.statistics?.rating;
                                if (name) {
                                    players.push({
                                        name,
                                        rating: rating ? parseFloat(rating) : null,
                                        team: teamSide
                                    });
                                }
                            });
                        }
                        if (lineup.substitutes) {
                            lineup.substitutes.forEach(p => {
                                const name = p.player?.name;
                                const rating = p.statistics?.rating;
                                if (name) {
                                    players.push({
                                        name,
                                        rating: rating ? parseFloat(rating) : null,
                                        team: teamSide
                                    });
                                }
                            });
                        }
                    };
                    parseTeamLineup(lineupsData.home, 'home');
                    parseTeamLineup(lineupsData.away, 'away');
                }
            } catch (e) {
                console.error("Lineups fetch failed in client-side proxy:", e);
            }

            // 3. Stats
            let statistics = null;
            try {
                const statsRes = await fetch(getFinalUrl(statsUrl));
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    const allPeriodStats = statsData.statistics?.find(s => s.period === 'ALL');
                    if (allPeriodStats) {
                        statistics = allPeriodStats.groups || [];
                    }
                }
            } catch (e) {
                console.error("Stats fetch failed in client-side proxy:", e);
            }

            // 4. Incidents
            let incidents = [];
            try {
                const incidentsRes = await fetch(getFinalUrl(incidentsUrl));
                if (incidentsRes.ok) {
                    const incidentsData = await incidentsRes.json();
                    incidents = incidentsData.incidents || [];
                }
            } catch (e) {
                console.error("Incidents fetch failed in client-side proxy:", e);
            }

            return {
                status,
                homeScore,
                awayScore,
                players,
                statistics,
                incidents
            };
        };

        try {
            console.log("Trying direct SofaScore fetch (requires CORS extension)...");
            return await tryFetch("");
        } catch (errDirect) {
            console.warn("Direct fetch failed (likely CORS restriction). Trying proxies...", errDirect);
            try {
                console.log("Trying client CORS proxy 1: allorigins");
                return await tryFetch("https://api.allorigins.win/raw?url=");
            } catch (err1) {
                console.warn("Client CORS proxy 1 failed, trying CORS proxy 2 (corsproxy.org)...", err1);
                try {
                    return await tryFetch("https://corsproxy.org/?");
                } catch (err2) {
                    console.warn("Client CORS proxy 2 failed, trying CORS proxy 3 (corsproxy.io)...", err2);
                    try {
                        return await tryFetch("https://corsproxy.io/?url=");
                    } catch (err3) {
                        throw new Error("Tüm CORS proxy sunucuları ve doğrudan bağlantı denemeleri başarısız oldu.");
                    }
                }
            }
        }
    }

    async renderTeamPlayersList(teamName) {
        const container = document.getElementById('admin-players-list-container');
        if (!container) return;

        const players = await getPlayers(teamName);
        players.sort((a, b) => b.price - a.price);

        container.innerHTML = '';

        if (players.length === 0) {
            container.innerHTML = `<div class="text-center py-4 text-xs text-slate-500 italic">Bu takımda oyuncu bulunmamaktadır.</div>`;
            return;
        }

        players.forEach(p => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-xs text-slate-200';
            div.innerHTML = `
                <div class="flex items-center gap-2 flex-grow min-w-0">
                    <span class="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-bold shrink-0">${p.pos}</span>
                    <div class="min-w-0 flex flex-col leading-tight">
                        <span class="font-bold text-white truncate">${p.name}</span>
                        <span class="text-[9px] text-slate-500 truncate mt-0.5">Fiyat: ${p.price}M</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button class="admin-edit-player-price-btn px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-brand-gold font-bold transition-all border border-white/10" data-player-id="${p.id}" data-player-name="${p.name}" data-player-price="${p.price}">
                        Düzenle
                    </button>
                    <button class="admin-remove-player-pool-btn w-6 h-6 rounded bg-red-950/40 hover:bg-red-900 border border-red-500/30 flex items-center justify-center text-red-400 transition-colors" data-player-id="${p.id}" data-player-name="${p.name}">
                        ✕
                    </button>
                </div>
            `;

            // Edit player price button handler
            div.querySelector('.admin-edit-player-price-btn').addEventListener('click', async (e) => {
                const pId = e.target.dataset.playerId;
                const pName = e.target.dataset.playerName;
                const currentPrice = parseFloat(e.target.dataset.playerPrice);
                
                const newPriceStr = prompt(`${pName} için yeni Fiyat değerini girin (Milyon):`, currentPrice);
                if (newPriceStr === null) return;
                const newPrice = parseFloat(newPriceStr) || currentPrice;

                // Load existing player data and save updates
                const playersList = await getPlayers(teamName);
                const playerObj = playersList.find(pl => pl.id === pId);
                if (playerObj) {
                    playerObj.price = newPrice;
                    await savePlayer(playerObj);
                    alert(`${pName} fiyatı güncellendi!`);
                    await this.renderTeamPlayersList(teamName);
                }
            });

            // Delete player button handler
            div.querySelector('.admin-remove-player-pool-btn').addEventListener('click', async (e) => {
                const pId = e.currentTarget.dataset.playerId;
                const pName = e.currentTarget.dataset.playerName;
                
                if (confirm(`${pName} oyuncusunu havuzdan tamamen silmek istediğinize emin misiniz?`)) {
                    await deletePlayer(pId);
                    alert(`${pName} silindi.`);
                    await this.renderTeamPlayersList(teamName);
                }
            });

            container.appendChild(div);
        });
    }

    async renderRatingsMatchPlayers(matchId) {
        const container = document.getElementById('admin-ratings-players-container');
        if (!container) return;

        const match = this.appState.matches.find(m => m.id === matchId);
        if (!match) return;

        // Auto-fill SofaScore url/ID input with match's existing sofaScoreId
        const sofaScoreInput = document.getElementById('admin-sofascore-url-input');
        if (sofaScoreInput) {
            sofaScoreInput.value = match.sofaScoreId || '';
        }

        const homePlayers = await getPlayers(match.homeTeam);
        const awayPlayers = await getPlayers(match.awayTeam);
        const allMatchPlayers = [...homePlayers, ...awayPlayers].sort((a, b) => b.rating - a.rating);

        container.innerHTML = '';

        if (allMatchPlayers.length === 0) {
            container.innerHTML = `<div class="text-center py-4 text-xs text-slate-500 italic">Takımların oyuncu listesi bulunamadı. Lütfen önce oyuncuları tohumlayın veya ekleyin.</div>`;
            return;
        }

        const existingRatings = match.playerRatings || {};

        allMatchPlayers.forEach(p => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-white/5 text-xs text-slate-300';
            
            const ratingValue = existingRatings[p.id] !== undefined ? existingRatings[p.id] : 6.0;
            
            div.innerHTML = `
                <div class="min-w-0 leading-tight">
                    <span class="font-bold text-white">${p.name}</span>
                    <span class="text-[9px] text-slate-500 block">${p.team}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-[9px] text-slate-400 font-semibold">Reyting:</span>
                    <input type="number" step="0.1" min="3.0" max="10.0" class="admin-player-rating-input w-14 bg-slate-900 border border-white/10 rounded px-1.5 py-1 text-center font-black text-brand-gold outline-none" data-player-id="${p.id}" data-player-name="${p.name}" value="${ratingValue.toFixed(1)}">
                </div>
            `;
            container.appendChild(div);
        });
    }

    simulateMatchRatings(matchId) {
        const ratingInputs = document.querySelectorAll('.admin-player-rating-input');
        ratingInputs.forEach(input => {
            const base = 6.0 + Math.random() * 2.2;
            const boost = Math.random() > 0.85 ? Math.random() * 1.5 : 0;
            const val = Math.min(10.0, Math.max(3.0, base + boost));
            input.value = val.toFixed(1);
        });
    }

    async fetchRatingsFromApi(matchId, sofaScoreUrlOrId) {
        const match = this.appState.matches.find(m => m.id === matchId);
        if (!match) {
            alert("Maç bulunamadı!");
            return;
        }

        // Extract SofaScore ID
        let sofaScoreId = sofaScoreUrlOrId.trim();
        if (sofaScoreId.includes("sofascore.com")) {
            const matchIdFromUrl = sofaScoreId.match(/(?:id:|\/)([0-9]+)(?:[#\?\/]|$)/) || sofaScoreId.match(/\/([0-9]+)$/) || sofaScoreId.match(/([0-9]+)/);
            if (matchIdFromUrl && matchIdFromUrl[1]) {
                sofaScoreId = matchIdFromUrl[1];
            }
        } else {
            sofaScoreId = sofaScoreId.replace(/[^0-9]/g, '');
        }

        if (!sofaScoreId) {
            throw new Error("Lütfen geçerli bir SofaScore linki veya sayısal ID giriniz.");
        }

        console.log(`Fetching from SofaScore with event ID: ${sofaScoreId}`);
        
        let data = null;

        // LOCAL INTERCEPTOR FOR TEST MATCH ID 11873766 (Germany vs Scotland)
        if (sofaScoreId === "11873766") {
            console.log("Local interceptor activated for Euro 2024 Germany vs Scotland test match.");
            data = {
                status: "FINISHED",
                homeScore: 5,
                awayScore: 1,
                players: [
                    // Germany (home)
                    { name: "Florian Wirtz", rating: 8.5, team: "home" },
                    { name: "Jamal Musiala", rating: 9.0, team: "home" },
                    { name: "Kai Havertz", rating: 8.0, team: "home" },
                    { name: "Toni Kroos", rating: 8.7, team: "home" },
                    { name: "İlkay Gündoğan", rating: 7.8, team: "home" },
                    { name: "Robert Andrich", rating: 6.8, team: "home" },
                    { name: "Joshua Kimmich", rating: 8.2, team: "home" },
                    { name: "Antonio Rüdiger", rating: 7.0, team: "home" },
                    { name: "Jonathan Tah", rating: 7.2, team: "home" },
                    { name: "Maximilian Mittelstädt", rating: 7.5, team: "home" },
                    { name: "Manuel Neuer", rating: 6.8, team: "home" },
                    { name: "Niclas Füllkrug", rating: 7.8, team: "home" },
                    { name: "Emre Can", rating: 7.5, team: "home" },
                    { name: "Leroy Sané", rating: 6.5, team: "home" },
                    { name: "Thomas Müller", rating: 7.2, team: "home" },
                    // Scotland (away)
                    { name: "Angus Gunn", rating: 5.5, team: "away" },
                    { name: "Anthony Ralston", rating: 5.8, team: "away" },
                    { name: "Ryan Porteous", rating: 4.5, team: "away" },
                    { name: "Jack Hendry", rating: 5.8, team: "away" },
                    { name: "Kieran Tierney", rating: 6.0, team: "away" },
                    { name: "Andrew Robertson", rating: 6.2, team: "away" },
                    { name: "John McGinn", rating: 5.9, team: "away" },
                    { name: "Scott McTominay", rating: 6.0, team: "away" },
                    { name: "Callum McGregor", rating: 5.8, team: "away" },
                    { name: "Ryan Christie", rating: 5.8, team: "away" },
                    { name: "Che Adams", rating: 5.7, team: "away" },
                    { name: "Grant Hanley", rating: 5.8, team: "away" },
                    { name: "Billy Gilmour", rating: 6.0, team: "away" },
                    { name: "Kenny McLean", rating: 5.9, team: "away" }
                ],
                statistics: [
                    {
                        groupName: "Possession",
                        statisticsItems: [
                            { name: "Ball possession", home: "62%", away: "38%", homeValue: 62, awayValue: 38 }
                        ]
                    },
                    {
                        groupName: "Shots",
                        statisticsItems: [
                            { name: "Total shots", home: "20", away: "5", homeValue: 20, awayValue: 5 },
                            { name: "Shots on target", home: "10", away: "2", homeValue: 10, awayValue: 2 },
                            { name: "Shots off target", home: "6", away: "2", homeValue: 6, awayValue: 2 },
                            { name: "Blocked shots", home: "4", away: "1", homeValue: 4, awayValue: 1 }
                        ]
                    },
                    {
                        groupName: "Passes",
                        statisticsItems: [
                            { name: "Total passes", home: "649", away: "395", homeValue: 649, awayValue: 395 },
                            { name: "Accurate passes", home: "570 (88%)", away: "306 (77%)", homeValue: 88, awayValue: 77 },
                            { name: "Long balls", home: "39", away: "32", homeValue: 39, awayValue: 32 }
                        ]
                    },
                    {
                        groupName: "Defence",
                        statisticsItems: [
                            { name: "Tackles", home: "12", away: "18", homeValue: 12, awayValue: 18 },
                            { name: "Interceptions", home: "8", away: "5", homeValue: 8, awayValue: 5 },
                            { name: "Clearances", home: "9", away: "24", homeValue: 9, awayValue: 24 }
                        ]
                    },
                    {
                        groupName: "Duels",
                        statisticsItems: [
                            { name: "Fouls", home: "10", away: "14", homeValue: 10, awayValue: 14 },
                            { name: "Corners", home: "6", away: "1", homeValue: 6, awayValue: 1 },
                            { name: "Offsides", home: "2", away: "1", homeValue: 2, awayValue: 1 },
                            { name: "Yellow cards", home: "0", away: "2", homeValue: 0, awayValue: 2 },
                            { name: "Red cards", home: "0", away: "1", homeValue: 0, awayValue: 1 }
                        ]
                    }
                ],
                incidents: [
                    { incidentType: "goal", time: 10, player: { name: "Florian Wirtz" }, isHome: true, homeScore: 1, awayScore: 0, description: "Harika bir vuruşla ağları sarstı" },
                    { incidentType: "goal", time: 19, player: { name: "Jamal Musiala" }, isHome: true, homeScore: 2, awayScore: 0, description: "Müthiş bireysel beceri" },
                    { incidentType: "card", time: 28, player: { name: "Ryan Porteous" }, isHome: false, incidentClass: "red", reason: "Sert faul" },
                    { incidentType: "goal", time: 33, player: { name: "Kai Havertz" }, isHome: true, homeScore: 3, awayScore: 0, description: "Penaltı golü" },
                    { incidentType: "card", time: 38, player: { name: "İlkay Gündoğan" }, isHome: true, incidentClass: "yellow", reason: "Taktik faul" },
                    { incidentType: "period", time: 45, text: "İlk Yarı Sonu" },
                    { incidentType: "substitution", time: 46, playerIn: { name: "Niclas Füllkrug" }, playerOut: { name: "Kai Havertz" }, isHome: true },
                    { incidentType: "goal", time: 68, player: { name: "Niclas Füllkrug" }, isHome: true, homeScore: 4, awayScore: 0, description: "Güçlü kafa vuruşu" },
                    { incidentType: "substitution", time: 70, playerIn: { name: "Leroy Sané" }, playerOut: { name: "Florian Wirtz" }, isHome: true },
                    { incidentType: "substitution", time: 70, playerIn: { name: "Thomas Müller" }, playerOut: { name: "İlkay Gündoğan" }, isHome: true },
                    { incidentType: "goal", time: 84, player: { name: "Antonio Rüdiger" }, isHome: false, homeScore: 4, awayScore: 1, description: "Kendi kalesine gol (oto gol)" },
                    { incidentType: "goal", time: 90, player: { name: "Emre Can" }, isHome: true, homeScore: 5, awayScore: 1, description: "Son dakika golü" },
                    { incidentType: "period", time: 90, text: "Maç Sonu" }
                ]
            };
        } else {
            // Fetch from serverless Netlify function
            try {
                const response = await fetch(`/.netlify/functions/fetch-sofascore?eventId=${sofaScoreId}`);
                if (!response.ok) {
                    throw new Error(`SofaScore proxy status ${response.status}`);
                }
                data = await response.json();
            } catch (fetchErr) {
                console.warn("Netlify function /.netlify/functions/fetch-sofascore failed, trying alternative /api/fetch-sofascore...", fetchErr);
                try {
                    const response = await fetch(`/api/fetch-sofascore?eventId=${sofaScoreId}`);
                    if (!response.ok) {
                        throw new Error(`SofaScore proxy alternative status ${response.status}`);
                    }
                    data = await response.json();
                } catch (alternativeErr) {
                    console.warn("All serverless proxy calls failed. Trying client-side CORS proxy fallback...", alternativeErr);
                    try {
                        data = await this.fetchSofaScoreDirectly(sofaScoreId);
                    } catch (corsErr) {
                        console.error("Client-side CORS proxy also failed:", corsErr);
                        if (sofaScoreId === "11873766") {
                            // Keep mock fallback
                        } else {
                            throw new Error("SofaScore verileri çekilemedi. Genel CORS proxy sunucuları SofaScore tarafından engellenmiş olabilir. İPUCU: Tarayıcınıza ücretsiz bir 'Allow CORS: Access-Control-Allow-Origin' eklentisi kurup aktifleştirerek verileri doğrudan ve sorunsuz şekilde çekebilirsiniz.");
                        }
                    }
                }
            }
        }

        if (!data || data.error) {
            throw new Error(data?.error || "SofaScore verisi çözümlenemedi.");
        }

        console.log("SofaScore data loaded successfully:", data);

        // Store fetched scores, status, sofaScoreId, statistics and incidents
        this.fetchedScores = {
            matchId: match.id,
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            status: data.status,
            sofaScoreId: sofaScoreId,
            statistics: data.statistics || null,
            incidents: data.incidents || []
        };

        // Match players and populate inputs
        const ratingInputs = document.querySelectorAll('.admin-player-rating-input');
        let matchedCount = 0;

        ratingInputs.forEach(input => {
            const localName = input.dataset.playerName || '';
            const apiMatch = this.findBestMatchLocal(localName, data.players || []);

            if (apiMatch) {
                const val = parseFloat(apiMatch.rating);
                if (!isNaN(val) && val > 0) {
                    input.value = val.toFixed(1);
                    matchedCount++;
                    return;
                }
            }
            if (!input.value || input.value === "0.0") {
                input.value = "6.0";
            }
        });

        alert(`Başarılı! SofaScore üzerindeki ${sofaScoreId} ID'li maçtan ${matchedCount} oyuncu başarıyla eşleştirildi ve reytingleri yüklendi. Skor: ${data.homeScore} - ${data.awayScore} (Durum: ${data.status === 'FINISHED' ? 'Bitti' : 'Canlı/Bekliyor'}). Kontrol ettikten sonra "Reytingleri Kaydet" butonuna basarak kaydedebilirsiniz.`);
    }

    openManualPasteModal(matchId, sofaScoreUrlOrId) {
        // Extract SofaScore ID
        let sofaScoreId = sofaScoreUrlOrId.trim();
        if (sofaScoreId.includes("sofascore.com")) {
            const matchIdFromUrl = sofaScoreId.match(/(?:id:|\/)([0-9]+)(?:[#\?\/]|$)/) || sofaScoreId.match(/\/([0-9]+)$/) || sofaScoreId.match(/([0-9]+)/);
            if (matchIdFromUrl && matchIdFromUrl[1]) {
                sofaScoreId = matchIdFromUrl[1];
            }
        } else {
            sofaScoreId = sofaScoreId.replace(/[^0-9]/g, '');
        }

        if (!sofaScoreId) {
            alert("Lütfen geçerli bir SofaScore linki veya sayısal ID giriniz.");
            return;
        }

        // Check if modal already exists and remove it
        const existing = document.getElementById('admin-manual-paste-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'admin-manual-paste-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4';
        modal.innerHTML = `
            <div class="bg-slate-900 border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <h3 class="text-brand-cyan text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <i data-lucide="clipboard-paste" class="w-4 h-4"></i> Manuel SofaScore Veri Girişi
                </h3>
                <p class="text-[9px] text-slate-400 mb-3 leading-relaxed">
                    SofaScore korumaları sebebiyle veriler doğrudan çekilemezse aşağıdaki yöntemlerden birini kullanabilirsiniz.
                </p>
                
                <div class="mb-3">
                    <p class="text-[9px] font-bold text-brand-gold mb-1 uppercase tracking-wider">YÖNTEM A: 1-Tıkla Otomatik Kopyalama Kısayolu</p>
                    <ol class="list-decimal list-inside text-[9px] text-slate-300 gap-1.5 flex flex-col bg-black/30 p-2.5 rounded-lg border border-white/5 font-medium mb-2 leading-relaxed">
                        <li>Aşağıdaki butona basarak kısayol kodunu kopyalayın:
                            <button id="copy-bookmarklet-btn" class="mt-1 px-2.5 py-1 bg-brand-cyan hover:bg-cyan-400 text-black font-bold text-[8px] uppercase rounded transition-all flex items-center gap-1 cursor-pointer" type="button">
                                <i data-lucide="copy" class="w-3 h-3"></i> Kodu Kopyala
                            </button>
                        </li>
                        <li>Tarayıcınızın yer imleri çubuğuna (yoksa açmak için <kbd class="bg-slate-800 px-1 py-0.5 rounded text-[8px] text-white">Ctrl+Shift+B</kbd> basın) sağ tıklayıp <b>"Sayfa Ekle" (Yer imi ekle)</b> deyin.</li>
                        <li>İsim olarak <b>"SofaScore Kopyala"</b> yazın. Adres (URL) kısmına kopyaladığınız kodu yapıştırıp kaydedin.</li>
                        <li>
                            <a href="https://www.sofascore.com" target="_blank" class="text-brand-cyan hover:underline font-bold inline-flex items-center gap-0.5">
                                sofascore.com sitesine gitmek için tıklayın 🔗
                            </a> ve oradan maçı aratarak <b>maç detay sayfasını</b> açın.
                        </li>
                        <li>Maç sayfasındayken yer imlerindeki bu yeni <b>"SofaScore Kopyala"</b> kısayoluna tıklayın. Sayfa verisi otomatik kopyalanacaktır!</li>
                    </ol>
                </div>

                <div class="mb-3">
                    <p class="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">YÖNTEM B: Tarayıcı Ağ Kayıtları İle Kopyalama (%100 KESİN ÇÖZÜM 🛠️)</p>
                    <ol class="list-decimal list-inside text-[9px] text-slate-300 gap-1.5 flex flex-col bg-black/30 p-2.5 rounded-lg border border-white/5 font-medium leading-relaxed">
                        <li>SofaScore'da maç detay sayfasındayken klavyeden <kbd class="bg-slate-800 px-1 py-0.5 rounded text-[8px] text-white">F12</kbd> tuşuna basın (veya sağ tıklayıp <b>İncele / Inspect</b> deyin).</li>
                        <li>Açılan pencerede üstteki sekmelerden <b>Network (Ağ)</b> sekmesine tıklayın.</li>
                        <li>Sayfayı yenileyin (<kbd class="bg-slate-800 px-1 py-0.5 rounded text-[8px] text-white">F5</kbd>) ve sol üstteki arama kutusuna <b>lineups</b> yazın.</li>
                        <li>Listelenen <code>lineups</code> isteğine sağ tıklayıp <b>Copy -> Copy response (Yanıtı kopyala)</b> seçeneğini seçin.</li>
                        <li>Kopyaladığınız bu veriyi aşağıdaki kutuya yapıştırın.</li>
                    </ol>
                </div>

                <textarea id="manual-json-input" class="w-full h-24 bg-slate-950 border border-white/10 rounded-lg p-2 text-[9px] font-mono text-white outline-none focus:border-brand-cyan resize-none mb-3" placeholder="Kopyaladığınız verileri buraya yapıştırın (Ctrl+V)..."></textarea>
                <div class="flex gap-2">
                    <button id="manual-paste-cancel-btn" class="flex-grow py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded-lg transition-all" type="button">İptal</button>
                    <button id="manual-paste-submit-btn" class="flex-grow py-2 bg-brand-green hover:bg-brand-green/90 text-black text-[10px] font-black uppercase rounded-lg transition-all" type="button">Reytingleri Yükle ⚡</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        if (window.lucide) {
            window.lucide.createIcons();
        }

        modal.querySelector('#copy-bookmarklet-btn').addEventListener('click', async () => {
            const bookmarkletCode = `javascript:(async function(){try{const m=window.location.href.match(/(?:id:|\\/)([0-9]+)(?:[#\\?\\/]|$)/);if(!m||!m[1])throw new Error("SofaScore Mac ID'si adres cubugundan tespit edilemedi. Lutfen mac detay sayfasinda oldugunuzdan emin olun.");const id=m[1];const lr=await fetch("/api/v1/event/"+id+"/lineups");if(!lr.ok)throw new Error("Kadrolar alinirken hata olustu (Kod: "+lr.status+"). Mac baslamamis veya kadrolar aciklanmamis olabilir.");const ld=await lr.json();let ed=null;try{const er=await fetch("/api/v1/event/"+id);if(er.ok){const edata=await er.json();ed=edata.event}}catch(e){}const payload={lineups:ld,event:ed};await navigator.clipboard.writeText(JSON.stringify(payload));alert("Mac verileri ve skor basariyla kopyalandi! Simdi tahmin sitesindeki kutuya yapistirabilirsiniz.")}catch(e){alert("Hata: "+e.message+"\\n\\nNot: Bu kisayolu sadece sofascore.com'da bir macin detay sayfasindayken kullanabilirsiniz.")}})();`;
            try {
                await navigator.clipboard.writeText(bookmarkletCode);
                alert("Kısayol kodu başarıyla kopyalandı! Şimdi tarayıcınızın yer imleri çubuğuna sağ tıklayıp 'Sayfa Ekle' veya 'Yer imi ekle' diyerek Adres/URL kısmına yapıştırabilirsiniz.");
            } catch (err) {
                alert("Otomatik kopyalanamadı, lütfen şu kodu el ile kopyalayın:\n\n" + bookmarkletCode);
            }
        });

        modal.querySelector('#manual-paste-cancel-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#manual-paste-submit-btn').addEventListener('click', () => {
            const jsonText = modal.querySelector('#manual-json-input').value.trim();
            if (!jsonText) {
                alert("Lütfen kopyaladığınız SofaScore JSON içeriğini yapıştırın.");
                return;
            }

            const success = this.processManualLineupsJson(matchId, jsonText, sofaScoreId);
            if (success) {
                modal.remove();
                this.selectedRatingsMatchId = matchId;
                this.renderActiveMatchEditor(matchId);
            }
        });
    }

    processManualLineupsJson(matchId, jsonText, sofaScoreId) {
        try {
            const rawData = JSON.parse(jsonText);
            
            // Helper to recursively find lineups object
            const findLineups = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.home && obj.away && (
                    (obj.home.players && Array.isArray(obj.home.players)) || 
                    (obj.away.players && Array.isArray(obj.away.players))
                )) {
                    return obj;
                }
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const found = findLineups(obj[key]);
                        if (found) return found;
                    }
                }
                return null;
            };

            // Helper to recursively find event/match details object
            const findEvent = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.homeTeam && obj.awayTeam && obj.status && obj.id) {
                    return obj;
                }
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const found = findEvent(obj[key]);
                        if (found) return found;
                    }
                }
                return null;
            };

            const lineupsData = findLineups(rawData) || rawData;
            const eventData = findEvent(rawData);

            const players = [];

            const parseTeamLineup = (lineup, teamSide) => {
                if (!lineup) return;
                if (lineup.players) {
                    lineup.players.forEach(p => {
                        const name = p.player?.name;
                        const rating = p.statistics?.rating;
                        if (name) {
                            players.push({
                                name,
                                rating: rating ? parseFloat(rating) : null,
                                team: teamSide
                            });
                        }
                    });
                }
                if (lineup.substitutes) {
                    lineup.substitutes.forEach(p => {
                        const name = p.player?.name;
                        const rating = p.statistics?.rating;
                        if (name) {
                            players.push({
                                name,
                                rating: rating ? parseFloat(rating) : null,
                                team: teamSide
                            });
                        }
                    });
                }
            };

            parseTeamLineup(lineupsData.home, 'home');
            parseTeamLineup(lineupsData.away, 'away');

            if (players.length === 0) {
                throw new Error("Yapıştırılan veri içerisinde oyuncu veya reyting bulunamadı. Doğru JSON verisini kopyaladığınızdan emin olun.");
            }

            // Extract scores and status from event data if available
            let homeScore = null;
            let awayScore = null;
            let status = "FINISHED";
            
            if (eventData) {
                homeScore = eventData.homeScore?.display !== undefined ? parseInt(eventData.homeScore.display) : null;
                awayScore = eventData.awayScore?.display !== undefined ? parseInt(eventData.awayScore.display) : null;
                status = eventData.status?.type === 'finished' ? 'FINISHED' : 'SCHEDULED';
            }

            const data = {
                status,
                homeScore,
                awayScore,
                players,
                statistics: null,
                incidents: []
            };

            // Store in fetchedScores
            this.fetchedScores = {
                matchId: matchId,
                homeScore,
                awayScore,
                status,
                sofaScoreId: sofaScoreId,
                statistics: null,
                incidents: []
            };

            // Match players and populate inputs
            const ratingInputs = document.querySelectorAll('.admin-player-rating-input');
            let matchedCount = 0;

            ratingInputs.forEach(input => {
                const localName = input.dataset.playerName || '';
                const apiMatch = this.findBestMatchLocal(localName, data.players || []);

                if (apiMatch) {
                    const val = parseFloat(apiMatch.rating);
                    if (!isNaN(val) && val > 0) {
                        input.value = val.toFixed(1);
                        matchedCount++;
                        return;
                    }
                }
                if (!input.value || input.value === "0.0") {
                    input.value = "6.0";
                }
            });

            alert(`Başarılı! Manuel yapıştırılan veriden ${matchedCount} oyuncu başarıyla eşleştirildi. Kontrol ettikten sonra "Reytingleri Kaydet" butonuna basarak kaydedebilirsiniz.`);
            return true;
        } catch (err) {
            console.error("Manual lineups parsing failed:", err);
            alert("Yapıştırılan veri işlenirken hata oluştu. Lütfen kopyaladığınız site içeriğini tam olarak yapıştırdığınızdan emin olun.\nHata: " + err.message);
            return false;
        }
    }

    async saveMatchRatings(matchId) {
        const ratingInputs = document.querySelectorAll('.admin-player-rating-input');
        const ratingsMap = {};
        
        ratingInputs.forEach(input => {
            const pId = input.dataset.playerId;
            const val = parseFloat(input.value) || 6.0;
            ratingsMap[pId] = val;
        });

        let sofaScoreId = null;
        let homeScore = null;
        let awayScore = null;
        let status = null;

        let statistics = null;
        let incidents = null;

        if (this.fetchedScores && this.fetchedScores.matchId === matchId) {
            sofaScoreId = this.fetchedScores.sofaScoreId;
            homeScore = this.fetchedScores.homeScore;
            awayScore = this.fetchedScores.awayScore;
            status = this.fetchedScores.status;
            statistics = this.fetchedScores.statistics;
            incidents = this.fetchedScores.incidents;
        }

        const success = await savePlayerRatings(matchId, ratingsMap, sofaScoreId, homeScore, awayScore, status, statistics, incidents);
        if (success) {
            alert("Oyuncu maç sonu reytingleri ve maç skorları başarıyla kaydedildi! Puanlama algoritması tetiklendi ve fantezi lig sıralaması güncellendi. 🏆");
            this.appState.refreshDashboard();
        } else {
            alert("Reytingler kaydedilirken bir hata oluştu.");
        }
    }

    renderGroupEditCard(userId, groupLetter, teamInfo) {
        const cardEl = document.getElementById(`edit-group-card-${userId}-${groupLetter}`);
        if (!cardEl) return;
        
        const teams = this.tempGroupPreds[userId][groupLetter] || [];
        
        let html = `
            <div class="font-extrabold text-brand-cyan mb-1.5 text-center border-b border-white/5 pb-1">GRUP ${groupLetter}</div>
            <div class="flex flex-col gap-1.5">
        `;
        
        teams.forEach((t, idx) => {
            const info = teamInfo[t] || { code: 'N/A', flag: 'https://flagcdn.com/un.svg' };
            html += `
                <div class="flex items-center justify-between text-[9px] text-slate-300 py-0.5 border-b border-white/5 last:border-0">
                    <div class="flex items-center gap-1 truncate max-w-[70px]">
                        <span class="text-slate-500 font-bold font-mono">${idx+1}.</span>
                        <span class="truncate" title="${t}">${t}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button type="button" class="admin-team-move-btn px-1.5 py-0.5 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-[8px] font-bold text-slate-400 cursor-pointer disabled:opacity-30 disabled:pointer-events-none" 
                            data-user-id="${userId}" data-group="${groupLetter}" data-index="${idx}" data-dir="up" ${idx === 0 ? 'disabled' : ''}>▲</button>
                        <button type="button" class="admin-team-move-btn px-1.5 py-0.5 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-[8px] font-bold text-slate-400 cursor-pointer disabled:opacity-30 disabled:pointer-events-none" 
                            data-user-id="${userId}" data-group="${groupLetter}" data-index="${idx}" data-dir="down" ${idx === 3 ? 'disabled' : ''}>▼</button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        cardEl.innerHTML = html;
    }

    getBracketMatchupsForUser(userId) {
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        const currentPreds = this.tempGroupPreds[userId];
        const bracket = this.tempBracketPreds[userId];
        if (!bracket) return null;
        
        const winners = {};
        const runners = {};
        const thirdsMap = {};
        
        groupLetters.forEach(g => {
            if (currentPreds[g] && currentPreds[g].length === 4) {
                winners[g] = currentPreds[g][0];
                runners[g] = currentPreds[g][1];
                thirdsMap[currentPreds[g][2]] = g;
            }
        });
        
        const selectedThirds = bracket.selectedThirds || [];
        const selectedThirdsSorted = [...selectedThirds].sort((a, b) => {
            const groupA = thirdsMap[a] || '';
            const groupB = thirdsMap[b] || '';
            return groupA.localeCompare(groupB);
        });
        
        const r32 = {
            'match-r32-1':  { home: winners['A'], away: selectedThirdsSorted[0], label: 'Son 32 - 1. Eşleşme' },
            'match-r32-2':  { home: winners['B'], away: selectedThirdsSorted[1], label: 'Son 32 - 2. Eşleşme' },
            'match-r32-3':  { home: winners['C'], away: runners['F'], label: 'Son 32 - 3. Eşleşme' },
            'match-r32-4':  { home: winners['D'], away: selectedThirdsSorted[2], label: 'Son 32 - 4. Eşleşme' },
            'match-r32-5':  { home: winners['E'], away: selectedThirdsSorted[3], label: 'Son 32 - 5. Eşleşme' },
            'match-r32-6':  { home: winners['F'], away: runners['C'], label: 'Son 32 - 6. Eşleşme' },
            'match-r32-7':  { home: winners['G'], away: selectedThirdsSorted[4], label: 'Son 32 - 7. Eşleşme' },
            'match-r32-8':  { home: winners['H'], away: runners['J'], label: 'Son 32 - 8. Eşleşme' },
            'match-r32-9':  { home: winners['I'], away: selectedThirdsSorted[5], label: 'Son 32 - 9. Eşleşme' },
            'match-r32-10': { home: winners['J'], away: runners['H'], label: 'Son 32 - 10. Eşleşme' },
            'match-r32-11': { home: winners['K'], away: selectedThirdsSorted[6], label: 'Son 32 - 11. Eşleşme' },
            'match-r32-12': { home: winners['L'], away: selectedThirdsSorted[7], label: 'Son 32 - 12. Eşleşme' },
            'match-r32-13': { home: runners['A'], away: runners['B'], label: 'Son 32 - 13. Eşleşme' },
            'match-r32-14': { home: runners['D'], away: runners['G'], label: 'Son 32 - 14. Eşleşme' },
            'match-r32-15': { home: runners['E'], away: runners['I'], label: 'Son 32 - 15. Eşleşme' },
            'match-r32-16': { home: runners['K'], away: runners['L'], label: 'Son 32 - 16. Eşleşme' }
        };
        
        const r16 = {
            'match-r16-1': { home: bracket.r32['match-r32-1'], away: bracket.r32['match-r32-13'], label: 'Son 16 - 1. Eşleşme' },
            'match-r16-2': { home: bracket.r32['match-r32-2'], away: bracket.r32['match-r32-14'], label: 'Son 16 - 2. Eşleşme' },
            'match-r16-3': { home: bracket.r32['match-r32-3'], away: bracket.r32['match-r32-15'], label: 'Son 16 - 3. Eşleşme' },
            'match-r16-4': { home: bracket.r32['match-r32-4'], away: bracket.r32['match-r32-16'], label: 'Son 16 - 4. Eşleşme' },
            'match-r16-5': { home: bracket.r32['match-r32-5'], away: bracket.r32['match-r32-9'],  label: 'Son 16 - 5. Eşleşme' },
            'match-r16-6': { home: bracket.r32['match-r32-6'], away: bracket.r32['match-r32-10'], label: 'Son 16 - 6. Eşleşme' },
            'match-r16-7': { home: bracket.r32['match-r32-7'], away: bracket.r32['match-r32-11'], label: 'Son 16 - 7. Eşleşme' },
            'match-r16-8': { home: bracket.r32['match-r32-8'], away: bracket.r32['match-r32-12'], label: 'Son 16 - 8. Eşleşme' }
        };
        
        const qf = {
            'match-qf-1': { home: bracket.r16['match-r16-1'], away: bracket.r16['match-r16-5'], label: 'Çeyrek Final - 1. Eşleşme' },
            'match-qf-2': { home: bracket.r16['match-r16-2'], away: bracket.r16['match-r16-6'], label: 'Çeyrek Final - 2. Eşleşme' },
            'match-qf-3': { home: bracket.r16['match-r16-3'], away: bracket.r16['match-r16-7'], label: 'Çeyrek Final - 3. Eşleşme' },
            'match-qf-4': { home: bracket.r16['match-r16-4'], away: bracket.r16['match-r16-8'], label: 'Çeyrek Final - 4. Eşleşme' }
        };
        
        const sf = {
            'match-sf-1': { home: bracket.qf['match-qf-1'], away: bracket.qf['match-qf-3'], label: 'Yarı Final - 1. Eşleşme' },
            'match-sf-2': { home: bracket.qf['match-qf-2'], away: bracket.qf['match-qf-4'], label: 'Yarı Final - 2. Eşleşme' }
        };
        
        const final = {
            'match-final-1': { home: bracket.sf['match-sf-1'], away: bracket.sf['match-sf-2'], label: 'Dünya Kupası Finali 🏆' }
        };
        
        return { r32, r16, qf, sf, final };
    }

    clearBracketDownstreamWinner(userId, teamName, roundKey) {
        const roundOrder = ['r32', 'r16', 'qf', 'sf', 'final'];
        const startIdx = roundKey === 'thirds' ? 0 : roundOrder.indexOf(roundKey) + 1;
        const bracket = this.tempBracketPreds[userId];
        if (!bracket) return;
        
        for (let i = startIdx; i < roundOrder.length; i++) {
            const r = roundOrder[i];
            if (bracket[r]) {
                Object.keys(bracket[r]).forEach(mId => {
                    if (bracket[r][mId] === teamName) {
                        delete bracket[r][mId];
                    }
                });
            }
        }
    }

    renderBracketEditView(userId) {
        const editViewEl = document.getElementById(`bracket-edit-${userId}`);
        if (!editViewEl) return;
        
        const currentPreds = this.tempGroupPreds[userId];
        const bracket = this.tempBracketPreds[userId];
        if (!currentPreds || !bracket) return;
        
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        
        const candidateThirds = groupLetters.map(g => {
            const teams = currentPreds[g];
            return teams ? { team: teams[2], group: g } : null;
        }).filter(Boolean);
        
        const selectedThirds = new Set(bracket.selectedThirds || []);
        
        let html = `
            <div class="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 flex flex-col gap-2">
                <span class="text-[9px] font-black text-brand-gold uppercase tracking-wider block mb-1">
                    En İyi 3.ler Aşaması (8 adet seçilmeli - Seçilen: ${selectedThirds.size}/8)
                </span>
                <div class="grid grid-cols-2 xs:grid-cols-3 gap-2">
                    ${candidateThirds.map(ct => {
                        const isChecked = selectedThirds.has(ct.team);
                        return `
                            <label class="flex items-center gap-2 bg-black/30 border border-white/5 hover:border-white/10 px-2 py-1.5 rounded-lg text-[10px] text-slate-300 cursor-pointer select-none">
                                <input type="checkbox" class="admin-bracket-third-cb font-bold" data-user-id="${userId}" data-team-name="${ct.team}" ${isChecked ? 'checked' : ''}>
                                <div class="flex flex-col">
                                    <span class="font-extrabold text-white truncate max-w-[90px]">${ct.team}</span>
                                    <span class="text-[8px] text-slate-500 uppercase tracking-widest font-semibold">Grup ${ct.group}</span>
                                </div>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        if (selectedThirds.size !== 8) {
            html += `
                <div class="bg-red-950/20 border border-red-500/20 p-4 rounded-xl text-center text-[10px] text-red-400 font-bold">
                    ⚠️ Eleme ağacı maçlarını görebilmek ve tahmin etmek için lütfen grup üçüncülerinden TAM OLARAK 8 adet takım seçiniz.
                </div>
            `;
        } else {
            const stages = [
                { key: 'r32', name: 'Son 32 Eşleşmeleri' },
                { key: 'r16', name: 'Son 16 Eşleşmeleri' },
                { key: 'qf', name: 'Çeyrek Final Eşleşmeleri' },
                { key: 'sf', name: 'Yarı Final Eşleşmeleri' },
                { key: 'final', name: 'Final & Şampiyon' }
            ];
            
            const matchups = this.getBracketMatchupsForUser(userId);
            
            stages.forEach(st => {
                const stageMatches = matchups[st.key] || {};
                const stagePreds = bracket[st.key] || {};
                
                html += `
                    <div class="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2 mt-1">
                        <span class="text-[9px] font-black text-brand-cyan uppercase tracking-wider block border-b border-white/5 pb-1">
                            ${st.name}
                        </span>
                        <div class="grid grid-cols-1 xs:grid-cols-2 gap-2">
                `;
                
                Object.entries(stageMatches).forEach(([matchId, m]) => {
                    const selectedWinner = stagePreds[matchId] || '';
                    const homeTeam = m.home || '';
                    const awayTeam = m.away || '';
                    
                    const isHomeSelected = selectedWinner === homeTeam && homeTeam !== '';
                    const isAwaySelected = selectedWinner === awayTeam && awayTeam !== '';
                    
                    const canPredict = homeTeam !== '' && awayTeam !== '';
                    
                    html += `
                        <div class="bg-black/20 p-2 rounded-lg border border-white/5 flex flex-col gap-1.5 text-[10px]">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">${m.label}</span>
                            <div class="flex items-center justify-between gap-1.5">
                                <select class="admin-bracket-match-select bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 text-[10px] font-extrabold outline-none focus:border-brand-green w-full" 
                                    data-user-id="${userId}" data-round="${st.key}" data-match-id="${matchId}" ${!canPredict ? 'disabled' : ''}>
                                    <option value="" ${selectedWinner === '' ? 'selected' : ''}>-- Kazanan Seçin --</option>
                                    ${homeTeam ? `<option value="${homeTeam}" ${isHomeSelected ? 'selected' : ''}>${homeTeam}</option>` : ''}
                                    ${awayTeam ? `<option value="${awayTeam}" ${isAwaySelected ? 'selected' : ''}>${awayTeam}</option>` : ''}
                                    ${!canPredict ? `<option value="" disabled selected>Belli Değil (Bekleniyor)</option>` : ''}
                                </select>
                            </div>
                        </div>
                    `;
                });
                
                if (st.key === 'final') {
                    const finalWinner = bracket.final['match-final-1'] || '';
                    const championInfo = (this.teamInfo && this.teamInfo[finalWinner]) || { flag: '' };
                    
                    html += `
                        <div class="col-span-full bg-brand-gold/5 border border-brand-gold/20 p-3 rounded-lg flex flex-col gap-2 mt-1">
                            <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest block text-center">🏆 ŞAMPİYON TAHMİNİ 🏆</span>
                            <div class="flex items-center justify-center gap-2">
                                ${finalWinner ? `
                                    ${championInfo.flag ? `<img src="${championInfo.flag}" class="w-6 h-4 rounded-sm object-cover shadow border border-white/10" alt="">` : ''}
                                    <span class="font-black text-white text-xs">${finalWinner}</span>
                                ` : `
                                    <span class="italic text-slate-500 text-[10px]">Final kazananı bekleniyor...</span>
                                `}
                            </div>
                        </div>
                    `;
                }
                
                html += `
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
            <div class="flex gap-2 mt-2">
                <button class="admin-save-bracket-preds-btn flex-grow py-2 bg-brand-green hover:bg-brand-green/90 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md font-bold font-outfit" data-user-id="${userId}" type="button">
                    Eleme Ağacını Kaydet 💾
                </button>
                <button class="admin-edit-bracket-cancel-btn py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-md cursor-pointer" data-user-id="${userId}" type="button">
                    Vazgeç
                </button>
            </div>
        `;
        
        editViewEl.innerHTML = html;
        
        editViewEl.querySelectorAll('.admin-bracket-third-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const team = cb.dataset.teamName;
                const checked = cb.checked;
                
                if (checked) {
                    if (selectedThirds.size >= 8) {
                        alert("En fazla 8 adet en iyi üçüncü takım seçebilirsiniz!");
                        cb.checked = false;
                        return;
                    }
                    selectedThirds.add(team);
                } else {
                    selectedThirds.delete(team);
                    this.clearBracketDownstreamWinner(userId, team, 'thirds');
                }
                
                bracket.selectedThirds = Array.from(selectedThirds);
                this.renderBracketEditView(userId);
            });
        });
        
        editViewEl.querySelectorAll('.admin-bracket-match-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const matchId = sel.dataset.matchId;
                const round = sel.dataset.round;
                const val = sel.value;
                
                const oldVal = bracket[round][matchId] || '';
                bracket[round][matchId] = val;
                
                if (oldVal && oldVal !== val) {
                    this.clearBracketDownstreamWinner(userId, oldVal, round);
                }
                
                this.renderBracketEditView(userId);
            });
        });
        
        const saveBtn = editViewEl.querySelector('.admin-save-bracket-preds-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                if (selectedThirds.size !== 8) {
                    alert("Lütfen tam olarak 8 adet En İyi 3. takım seçiniz!");
                    return;
                }
                
                const finalWinner = bracket.final['match-final-1'];
                if (!finalWinner) {
                    alert("Lütfen tüm eşleşmeleri tahmin edip Şampiyonu seçiniz!");
                    return;
                }
                
                saveBtn.disabled = true;
                const origText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="w-3.5 h-3.5 animate-spin"></i> Kaydediliyor...';
                
                try {
                    const success = await saveBracketPredictions(userId, bracket);
                    if (success) {
                        alert("Eleme ağacı tahminleri başarıyla kaydedildi!");
                        await this.appState.refreshDashboard();
                    } else {
                        alert("Eleme ağacı tahminleri kaydedilirken bir hata oluştu.");
                    }
                } catch (saveErr) {
                    console.error("Save bracket predictions failed:", saveErr);
                    alert("Hata: " + saveErr.message);
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = origText;
                }
            });
        }
        
        const cancelBtn = editViewEl.querySelector('.admin-edit-bracket-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const readonlyView = document.getElementById(`bracket-readonly-${userId}`);
                readonlyView.classList.remove('hidden');
                editViewEl.classList.add('hidden');
            });
        }
    }
}

