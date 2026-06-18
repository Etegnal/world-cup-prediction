import { getPlayers, saveFantasySquad, getFantasySquad, getMatches, getMatchFantasyRound } from '../firebase-db.js';

export class FantasyLeague {
    constructor(containerId, appState) {
        this.container = document.getElementById(containerId);
        this.appState = appState;
        
        this.activeRound = null; // Round key, e.g. "round_1", "round_32", etc.
        this.dayMatches = []; // All matches in this round
        // Squad slots: index 0 (KL), 1-4 (DEF), 5-7 (ORT), 8-10 (FOR)
        this.squad = Array(11).fill(null);
        this.captainIndex = null; // index of the captain in this.squad
        
        this.playersPool = [];
        this.activeSelectionIndex = null; // index of slot currently being selected
        
        this.searchQuery = '';
        this.activeTeamFilter = 'all'; // all, or team name
        
        // Modal references (the container itself acts as the modal overlay)
        this.modal = this.container;
        
        // Initial setup
        this.setupHTMLStructure();
    }

    setupHTMLStructure() {
        // We will build the layout dynamically when init() is called.
    }

    /**
     * Extracts a YYYY-MM-DD date key from a match date string.
     * Uses local timezone to determine the "day".
     */
    getDateKey(dateStr) {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Formats a date key like "2026-06-14" to "14 Haziran 2026"
     */
    formatDateLabel(dateKey) {
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const parts = dateKey.split('-');
        const day = parseInt(parts[2]);
        const month = months[parseInt(parts[1]) - 1];
        const year = parts[0];
        return `${day} ${month} ${year}`;
    }

    isRoundLocked() {
        const activeUser = this.appState.activeUser;
        if (activeUser && activeUser.unlockedFantasyRounds && activeUser.unlockedFantasyRounds.includes(this.activeRound)) {
            return false;
        }
        if (!this.dayMatches || this.dayMatches.length === 0) return false;
        let earliestMatchTime = Infinity;
        this.dayMatches.forEach(m => {
            const time = new Date(m.date).getTime();
            if (time < earliestMatchTime) earliestMatchTime = time;
        });
        const lockTime = earliestMatchTime - 15 * 60 * 1000;
        return Date.now() >= lockTime;
    }

    async init(roundKey) {
        this.activeRound = roundKey;
        this.squad = Array(11).fill(null);
        this.captainIndex = null;
        this.searchQuery = '';
        this.activeTeamFilter = 'all';
        
        // Get all matches and filter by this round key
        const allMatches = await getMatches();
        this.dayMatches = allMatches.filter(m => getMatchFantasyRound(m, allMatches) === roundKey);
        
        // Load player pool from all teams playing in this round
        const teamNames = new Set();
        this.dayMatches.forEach(m => {
            if (m.homeTeam && m.homeTeam !== 'Belirsiz') teamNames.add(m.homeTeam);
            if (m.awayTeam && m.awayTeam !== 'Belirsiz') teamNames.add(m.awayTeam);
        });
        
        // Fallback: If no matches have teams defined yet (e.g. initial knockout phase), load players from all teams
        if (teamNames.size === 0) {
            allMatches.forEach(m => {
                if (m.homeTeam && m.homeTeam !== 'Belirsiz') teamNames.add(m.homeTeam);
                if (m.awayTeam && m.awayTeam !== 'Belirsiz') teamNames.add(m.awayTeam);
            });
        }
        
        // Load all players from these teams in a single database query
        const allPlayers = await getPlayers();
        this.playersPool = allPlayers.filter(p => teamNames.has(p.team));
        
        // Load existing squad if user saved one for this round key
        const userId = this.appState.activeUser ? this.appState.activeUser.id : null;
        if (userId) {
            const saved = await getFantasySquad(userId, roundKey);
            if (saved && saved.players) {
                saved.players.forEach((pId, idx) => {
                    const player = this.playersPool.find(p => p.id === pId);
                    if (player) {
                        this.squad[idx] = player;
                    }
                });
                
                // Assign captain
                if (saved.captain) {
                    const capIdx = saved.players.indexOf(saved.captain);
                    if (capIdx !== -1) {
                        this.captainIndex = capIdx;
                    }
                }
            }
        }
        
        this.render();
    }

    getBudgetUsed() {
        return this.squad.reduce((sum, p) => sum + (p ? p.price : 0), 0);
    }

    abbreviateName(name) {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 8);
        const first = parts[0][0];
        const last = parts[parts.length - 1];
        const result = `${first}. ${last}`;
        return result.length > 11 ? result.substring(0, 10) + '.' : result;
    }

    /**
     * Get all unique teams for today's matches with their flags
     */
    getTeamsWithFlags() {
        const teams = [];
        const seen = new Set();
        this.dayMatches.forEach(m => {
            if (!seen.has(m.homeTeam)) {
                seen.add(m.homeTeam);
                teams.push({ name: m.homeTeam, flag: m.homeFlag });
            }
            if (!seen.has(m.awayTeam)) {
                seen.add(m.awayTeam);
                teams.push({ name: m.awayTeam, flag: m.awayFlag });
            }
        });
        return teams;
    }

    /**
     * Gets the flag URL for a player based on their team
     */
    getPlayerFlag(player) {
        if (this.dayMatches) {
            for (const m of this.dayMatches) {
                if (player.team.toLowerCase() === m.homeTeam.toLowerCase()) return m.homeFlag;
                if (player.team.toLowerCase() === m.awayTeam.toLowerCase()) return m.awayFlag;
            }
        }
        if (this.allMatches) {
            for (const m of this.allMatches) {
                if (player.team.toLowerCase() === m.homeTeam.toLowerCase()) return m.homeFlag;
                if (player.team.toLowerCase() === m.awayTeam.toLowerCase()) return m.awayFlag;
            }
        }
        return '';
    }

    render() {
        if (!this.activeRound) return;
        
        const isLocked = this.isRoundLocked();
        const budgetUsed = this.getBudgetUsed();
        const budgetPct = Math.min((budgetUsed / 100) * 100, 100);
        const budgetColor = budgetUsed > 100 ? '#ef4444' : (budgetUsed >= 85 ? '#f59e0b' : '#00c853');
        
        const teams = this.getTeamsWithFlags();
        
        const FANTASY_ROUNDS = [
            { key: 'round_1', label: '1. Maç' },
            { key: 'round_2', label: '2. Maç' },
            { key: 'round_3', label: '3. Maç' },
            { key: 'round_32', label: 'Son 32' },
            { key: 'round_16', label: 'Son 16' },
            { key: 'quarter', label: 'Çeyrek' },
            { key: 'semi', label: 'Yarı F.' },
            { key: 'final', label: 'Final' }
        ];

        const activeRoundObj = FANTASY_ROUNDS.find(r => r.key === this.activeRound);
        const activeRoundLabel = activeRoundObj ? activeRoundObj.label : this.activeRound;

        const roundTabsHtml = FANTASY_ROUNDS.map(r => {
            const isActive = r.key === this.activeRound;
            return `
                <button class="fantasy-round-tab shrink-0 px-3 py-1.5 rounded-xl font-outfit font-black text-[9px] uppercase tracking-wider transition-all border ${
                    isActive 
                    ? 'bg-brand-gold text-black border-brand-gold shadow-md shadow-yellow-950/20' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                }" data-round="${r.key}">
                    ${r.label}
                </button>
            `;
        }).join('');

        // Build teams display as scrollable badges
        const teamsHtml = teams.length > 0 ? teams.map(t => `
            <div class="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg shrink-0">
                <img src="${t.flag}" class="w-4 h-3 object-cover rounded" alt="">
                <span class="text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap">${t.name}</span>
            </div>
        `).join('') : '<div class="text-[9px] text-slate-500 italic px-1">Eşleşmeler henüz belirlenmedi</div>';

        // Build match pairs display
        const matchPairsHtml = this.dayMatches.length > 0 ? this.dayMatches.map(m => `
            <div class="flex items-center gap-1.5 bg-black/30 border border-white/5 px-2 py-1 rounded-lg shrink-0">
                <img src="${m.homeFlag}" class="w-3.5 h-2.5 object-cover rounded" alt="">
                <span class="text-[8px] font-semibold text-slate-400">${m.homeTeam}</span>
                <span class="text-[7px] text-slate-600 font-bold">vs</span>
                <span class="text-[8px] font-semibold text-slate-400">${m.awayTeam}</span>
                <img src="${m.awayFlag}" class="w-3.5 h-2.5 object-cover rounded" alt="">
            </div>
        `).join('') : '';
        
        this.modal.innerHTML = `
            <!-- Header Section -->
            <div class="fantasy-header-section flex flex-col gap-2.5">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest flex items-center gap-1.5">
                        <i data-lucide="award" class="w-4 h-4 text-brand-green animate-bounce"></i>
                        Fantezi 11 • Kadro Kur
                    </span>
                    <button id="close-fantasy-btn" class="hidden w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/15 transition-colors cursor-pointer text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Horizontal Round Tabs Selector -->
                <div class="flex gap-1.5 overflow-x-auto pb-1 mt-0.5 scrollbar-thin">
                    ${roundTabsHtml}
                </div>

                <!-- Round & Teams Info -->
                <div class="mt-0.5">
                    <div class="flex items-center gap-1.5 mb-1.5">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-brand-cyan"></i>
                        <span class="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">${activeRoundLabel} Kadrosu</span>
                        <span class="text-[9px] text-slate-500 font-semibold ml-1">(${this.dayMatches.length} Maç • ${teams.length} Takım)</span>
                    </div>

                    <!-- Scrollable Teams -->
                    <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        ${teamsHtml}
                    </div>

                    <!-- Match pairs -->
                    ${matchPairsHtml ? `
                    <div class="flex gap-1.5 overflow-x-auto pb-1 mt-1.5 scrollbar-thin">
                        ${matchPairsHtml}
                    </div>
                    ` : ''}
                </div>

                <!-- Budget Tracker Bar -->
                <div class="bg-black/40 border border-white/5 px-3 py-2 rounded-xl">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[9px] text-slate-400 font-semibold uppercase">Bütçe</span>
                        <span class="text-xs font-outfit font-black" style="color: ${budgetColor}">${budgetUsed.toFixed(1)}M / 100M</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" style="width: ${budgetPct}%; background: ${budgetColor}"></div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="flex-grow p-4 flex flex-col gap-4 overflow-y-auto pb-24">
                <!-- Helper Notice -->
                <div class="text-[10px] text-slate-400 bg-white/5 border border-white/5 p-3 rounded-2xl flex items-start gap-2 leading-relaxed">
                    <i data-lucide="info" class="w-3.5 h-3.5 text-brand-cyan shrink-0 mt-0.5"></i>
                    <span>Bu turda oynanan <b>tüm maçlardan</b> seçerek kadronuzu kurun. <b>Kaptan (C)</b> seçmeyi unutmayın — kaptanın reytingi <b>2 kat</b> hesaplanır!</span>
                </div>

                <!-- Fantezi Kadro Listesi -->
                <div class="flex flex-col gap-4">
                    <!-- Kaleci Section -->
                    <div class="flex flex-col gap-2">
                        <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest pl-1">Kaleci (1)</span>
                        <div class="flex flex-col gap-2">
                            ${this.renderSlotMarkup(0, "KL", "Kaleci")}
                        </div>
                    </div>

                    <!-- Defans Section -->
                    <div class="flex flex-col gap-2">
                        <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest pl-1">Defans Oyuncuları (4)</span>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            ${this.renderSlotMarkup(1, "DEF", "Sol Bek")}
                            ${this.renderSlotMarkup(2, "DEF", "Stoper 1")}
                            ${this.renderSlotMarkup(3, "DEF", "Stoper 2")}
                            ${this.renderSlotMarkup(4, "DEF", "Sağ Bek")}
                        </div>
                    </div>

                    <!-- Orta Saha Section -->
                    <div class="flex flex-col gap-2">
                        <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest pl-1">Orta Saha Oyuncuları (3)</span>
                        <div class="flex flex-col gap-2">
                            ${this.renderSlotMarkup(5, "ORT", "Sol Orta Saha")}
                            ${this.renderSlotMarkup(6, "ORT", "Merkez Orta Saha")}
                            ${this.renderSlotMarkup(7, "ORT", "Sağ Orta Saha")}
                        </div>
                    </div>

                    <!-- Forvet Section -->
                    <div class="flex flex-col gap-2">
                        <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest pl-1">Forvet Oyuncuları (3)</span>
                        <div class="flex flex-col gap-2">
                            ${this.renderSlotMarkup(8, "FOR", "Sol Kanat")}
                            ${this.renderSlotMarkup(9, "FOR", "Santrfor")}
                            ${this.renderSlotMarkup(10, "FOR", "Sağ Kanat")}
                        </div>
                    </div>
                </div>

                <!-- Options / AutoFill Section -->
                <div class="flex gap-3 mt-1">
                    <button id="fantasy-clear-btn" class="flex-grow py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" ${isLocked ? 'disabled' : ''}>
                        KADROYU TEMİZLE
                    </button>
                    <button id="fantasy-autofill-btn" class="flex-grow py-2.5 rounded-xl bg-gradient-to-r from-brand-green to-brand-blue text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed" ${isLocked ? 'disabled' : ''}>
                        OTOMATİK DOLDUR
                    </button>
                </div>
            </div>

            <!-- Bottom Floating Action Bar -->
            <div class="sticky bottom-[58px] left-0 right-0 p-4 bg-brand-dark/95 border-t border-white/5 z-30">
                <button id="fantasy-save-btn" class="w-full py-3 ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-gold hover:bg-yellow-500 text-black active:scale-95'} text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-yellow-950/40" ${isLocked ? 'disabled' : ''}>
                    ${isLocked ? 'Kadro Seçimi Kilitlendi 🔐' : 'Kadro Planını Kaydet 💾'}
                </button>
            </div>

            <!-- Selection Drawer Component (Backdrop + Content) -->
            <div id="fantasy-drawer-backdrop" class="fantasy-drawer-backdrop"></div>
            <div id="fantasy-drawer" class="fantasy-drawer">
                <!-- Dynamic Selection Drawer content will be injected here -->
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        this.attachEventListeners();
    }

    renderSlotMarkup(index, pos, label) {
        const isLocked = this.isRoundLocked();
        const player = this.squad[index];
        if (player) {
            const isCaptain = this.captainIndex === index;
            const flagUrl = this.getPlayerFlag(player);
            return `
                <div class="fantasy-slot filled-card-slot ${isCaptain ? 'captain-glow' : ''} ${isLocked ? 'opacity-90 cursor-default' : ''}" data-index="${index}">
                    <div class="flex items-center gap-3 min-w-0">
                        <!-- Flag or Player Image -->
                        <div class="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            <img src="${flagUrl}" class="w-7 h-5 object-cover rounded shadow-sm" alt="">
                        </div>
                        <div class="text-left min-w-0">
                            <span class="block text-[8px] font-black text-brand-gold tracking-wider uppercase">${pos} • ${label}</span>
                            <span class="block text-xs font-bold text-white truncate mt-0.5">${player.name}</span>
                            <span class="block text-[9px] text-slate-400 truncate mt-0.5">${player.club || 'Kulüpsüz'} • ${player.team}</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2.5 shrink-0">
                        <div class="text-right">
                            <span class="block text-[10px] font-black text-slate-300">${player.price}M</span>
                        </div>
                        ${isLocked ? `
                            <span class="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black" title="Kaptan">
                                ${isCaptain ? '👑' : 'C'}
                            </span>
                        ` : `
                            <!-- Captain Toggle Crown Button -->
                            <button class="fantasy-captain-btn w-6 h-6 rounded-lg ${isCaptain ? 'bg-brand-gold text-black font-black' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'} border border-white/10 flex items-center justify-center text-[10px] font-black z-20 transition-all cursor-pointer" data-index="${index}" title="Kaptan Yap">
                                ${isCaptain ? '👑' : 'C'}
                            </button>
                            <!-- Remove Cross Button -->
                            <button class="fantasy-remove-btn w-6 h-6 rounded-lg bg-red-950/20 hover:bg-red-500/30 border border-red-500/20 hover:border-red-500/50 flex items-center justify-center text-red-400 hover:text-white text-xs font-bold z-20 transition-all cursor-pointer" data-index="${index}" title="Kadro dışı bırak">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                        `}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="fantasy-slot empty-card-slot ${isLocked ? 'cursor-default opacity-50' : ''}" data-index="${index}" data-pos="${pos}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-slate-400 shrink-0">
                            <i data-lucide="${isLocked ? 'lock' : 'plus'}" class="w-4.5 h-4.5 opacity-70"></i>
                        </div>
                        <div class="text-left">
                            <span class="block text-[8px] font-black text-brand-cyan tracking-wider uppercase">${pos} • ${label}</span>
                            <span class="block text-[10px] text-slate-500 font-bold mt-0.5">${isLocked ? 'Tahmin Süresi Doldu' : 'Oyuncu Ekle'}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-[9px] font-semibold text-slate-600">${isLocked ? 'Kilitli 🔐' : 'Boş'}</span>
                        ${isLocked ? '' : '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-600"></i>'}
                    </div>
                </div>
            `;
        }
    }

    attachEventListeners() {
        // Close overlay modal click — navigate back to matches screen
        const closeBtn = document.getElementById('close-fantasy-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Round Tabs click
        const roundTabs = this.modal.querySelectorAll('.fantasy-round-tab');
        roundTabs.forEach(tab => {
            tab.addEventListener('click', async () => {
                const roundKey = tab.dataset.round;
                window.history.replaceState({ screen: this.appState.activeScreen, modal: 'fantasy', roundKey: roundKey }, '');
                await this.init(roundKey);
            });
        });

        // Click on pitch slots (either empty or filled to open/interact)
        const slots = this.modal.querySelectorAll('.fantasy-slot');
        slots.forEach(slot => {
            slot.addEventListener('click', (e) => {
                if (this.isRoundLocked()) return;
                // If the click is on sub-buttons, prevent standard click
                if (e.target.closest('.fantasy-captain-btn') || e.target.closest('.fantasy-remove-btn')) {
                    return;
                }
                const index = parseInt(slot.dataset.index);
                const pos = slot.dataset.pos || this.squad[index].pos;
                this.openSelectionDrawer(index, pos);
            });
        });

        // Captain Crown Buttons click
        const capBtns = this.modal.querySelectorAll('.fantasy-captain-btn');
        capBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isRoundLocked()) return;
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.captainIndex = index;
                this.render();
            });
        });

        // Remove buttons click
        const removeBtns = this.modal.querySelectorAll('.fantasy-remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isRoundLocked()) return;
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.squad[index] = null;
                if (this.captainIndex === index) {
                    this.captainIndex = null;
                }
                this.render();
            });
        });

        // Clear button
        const clearBtn = document.getElementById('fantasy-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (this.isRoundLocked()) return;
                if (confirm("Kadrodaki tüm oyuncuları çıkarmak istediğinize emin misiniz?")) {
                    this.squad = Array(11).fill(null);
                    this.captainIndex = null;
                    this.render();
                }
            });
        }

        // Auto fill button
        const autoFillBtn = document.getElementById('fantasy-autofill-btn');
        if (autoFillBtn) {
            autoFillBtn.addEventListener('click', () => {
                if (this.isRoundLocked()) return;
                try {
                    const result = this.autoFillSquadAlgorithm(this.playersPool);
                    this.squad = result.squad;
                    this.captainIndex = result.captainIndex;
                    this.render();
                } catch (err) {
                    alert(err.message);
                }
            });
        }

        // Save button
        const saveBtn = document.getElementById('fantasy-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                if (this.isRoundLocked()) {
                    alert("Bu turun tahmin süresi dolmuştur! Kadro kaydedilemez.");
                    return;
                }
                await this.saveSquad();
            });
        }
    }

    openSelectionDrawer(index, pos) {
        this.activeSelectionIndex = index;
        const drawer = document.getElementById('fantasy-drawer');
        const backdrop = document.getElementById('fantasy-drawer-backdrop');
        
        drawer.classList.add('active');
        backdrop.classList.add('active');
        
        // Reset query and filter
        this.searchQuery = '';
        this.activeTeamFilter = 'all';
        
        // Render the skeleton first (input + tabs), then populate the list
        this.renderDrawerSkeleton(pos);
        this.renderDrawerPlayersList(pos);
        
        // Backdrop click close
        const closeDrawer = () => {
            drawer.classList.remove('active');
            backdrop.classList.remove('active');
            backdrop.removeEventListener('click', closeDrawer);
        };
        backdrop.addEventListener('click', closeDrawer);
    }

    closeSelectionDrawer() {
        const drawer = document.getElementById('fantasy-drawer');
        const backdrop = document.getElementById('fantasy-drawer-backdrop');
        if (drawer) drawer.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
    }

    /**
     * Renders the drawer skeleton (header, search input, team filter tabs, and empty list container).
     * This is only called ONCE when the drawer opens, so the input element is never destroyed.
     */
    renderDrawerSkeleton(pos) {
        const drawer = document.getElementById('fantasy-drawer');
        if (!drawer) return;
        
        const posLabels = { 'KL': 'Kaleci', 'DEF': 'Defans', 'ORT': 'Orta Saha', 'FOR': 'Forvet' };
        const posLabel = posLabels[pos] || pos;
        
        // Get all teams for filter tabs
        const teams = this.getTeamsWithFlags();
        const teamTabsHtml = teams.map(t => `
            <button class="drawer-team-tab flex items-center gap-1 py-1 px-2 rounded-lg text-center transition-all text-slate-400 shrink-0" data-team="${t.name}">
                <img src="${t.flag}" class="w-3 h-2 object-cover rounded" alt="">
                <span class="text-[8px] font-bold uppercase whitespace-nowrap">${t.name}</span>
            </button>
        `).join('');
        
        drawer.innerHTML = `
            <div class="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                <div>
                    <h3 class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest">${posLabel} Seçimi</h3>
                    <p id="drawer-player-count" class="text-[9px] text-slate-500 font-semibold mt-0.5">Yükleniyor...</p>
                </div>
                <button id="close-drawer-btn" class="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 text-slate-400 hover:text-white cursor-pointer">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
            </div>

            <!-- Search bar -->
            <div class="relative mb-3">
                <input type="text" id="drawer-player-search" class="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none pl-8 focus:border-brand-green/40" placeholder="Oyuncu veya kulüp ara..." value="" autocomplete="off" dir="ltr">
                <i data-lucide="search" class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
            </div>

            <!-- Team Tabs (scrollable) -->
            <div class="flex bg-black/45 rounded-xl p-1 text-[9px] font-bold uppercase gap-1 mb-3 border border-white/5 overflow-x-auto scrollbar-thin">
                <button id="drawer-tab-all" class="drawer-team-tab flex-shrink-0 py-1 px-3 rounded-lg text-center transition-all bg-brand-green text-black font-black">Tümü</button>
                ${teamTabsHtml}
            </div>

            <!-- Players list container (only this part is re-rendered on search/filter) -->
            <div id="drawer-players-list" class="flex-grow overflow-y-auto scrollbar-thin flex flex-col gap-2 pr-1 max-h-[300px]">
                <!-- Dynamic player rows injected here -->
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Attach event listeners for the skeleton (these stay alive the whole time the drawer is open)
        const closeDrawerBtn = document.getElementById('close-drawer-btn');
        if (closeDrawerBtn) {
            closeDrawerBtn.addEventListener('click', () => this.closeSelectionDrawer());
        }

        // "All" tab
        document.getElementById('drawer-tab-all').addEventListener('click', () => {
            this.activeTeamFilter = 'all';
            this.updateTabStyles();
            this.renderDrawerPlayersList(pos);
        });

        // Per-team tabs
        drawer.querySelectorAll('.drawer-team-tab[data-team]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTeamFilter = tab.dataset.team;
                this.updateTabStyles();
                this.renderDrawerPlayersList(pos);
            });
        });

        // Search Input — only updates the list, does NOT re-render the skeleton
        const searchInput = document.getElementById('drawer-player-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderDrawerPlayersList(pos);
            });
            // Focus the input after skeleton renders
            setTimeout(() => searchInput.focus(), 50);
        }
    }

    /**
     * Updates the visual active state on team filter tabs.
     */
    updateTabStyles() {
        const drawer = document.getElementById('fantasy-drawer');
        if (!drawer) return;
        
        const allTab = document.getElementById('drawer-tab-all');
        const teamTabs = drawer.querySelectorAll('.drawer-team-tab[data-team]');

        if (this.activeTeamFilter === 'all') {
            allTab.classList.add('bg-brand-green', 'text-black', 'font-black');
            allTab.classList.remove('text-slate-400');
        } else {
            allTab.classList.remove('bg-brand-green', 'text-black', 'font-black');
            allTab.classList.add('text-slate-400');
        }

        teamTabs.forEach(tab => {
            if (tab.dataset.team === this.activeTeamFilter) {
                tab.classList.add('bg-brand-green', 'text-black', 'font-black');
                tab.classList.remove('text-slate-400');
            } else {
                tab.classList.remove('bg-brand-green', 'text-black', 'font-black');
                tab.classList.add('text-slate-400');
            }
        });
    }

    /**
     * Renders ONLY the filtered/searched player rows inside #drawer-players-list.
     * The search input and tabs are NOT touched.
     */
    renderDrawerPlayersList(pos) {
        const listContainer = document.getElementById('drawer-players-list');
        const countEl = document.getElementById('drawer-player-count');
        if (!listContainer) return;
        
        // Filter players matching position
        let players = this.playersPool.filter(p => p.pos === pos);
        
        // Apply team filter
        if (this.activeTeamFilter !== 'all') {
            players = players.filter(p => p.team.toLowerCase() === this.activeTeamFilter.toLowerCase());
        }
        
        // Apply search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase().trim();
            players = players.filter(p => p.name.toLowerCase().includes(query) || p.club.toLowerCase().includes(query));
        }
        
        // Sort by price desc
        players.sort((a, b) => b.price - a.price);
        
        // Update count
        if (countEl) {
            countEl.textContent = `${players.length} Oyuncu Listeleniyor`;
        }
        
        listContainer.innerHTML = players.map(player => {
            const isAlreadySelected = this.squad.some(s => s && s.id === player.id);
            const currentInSlot = this.squad[this.activeSelectionIndex];
            
            // Calculate budget if we add this player (replacing whatever was there)
            const oldPrice = currentInSlot ? currentInSlot.price : 0;
            const newBudgetUsed = this.getBudgetUsed() - oldPrice + player.price;
            const isOverBudget = newBudgetUsed > 100 && !isAlreadySelected;
            
            const flagUrl = this.getPlayerFlag(player);
            
            return `
                <div class="drawer-player-row flex items-center justify-between p-2.5 rounded-xl border border-white/5 transition-all select-none ${
                    isAlreadySelected ? 'bg-white/5 opacity-55 border-brand-green/20' : (isOverBudget ? 'bg-red-950/5 opacity-55 border-red-500/10 cursor-not-allowed' : 'bg-slate-900/60 hover:bg-slate-900 border-white/10 hover:border-brand-green/20 cursor-pointer')
                }" data-player-id="${player.id}" data-selected="${isAlreadySelected}" data-over-budget="${isOverBudget}">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <img src="${flagUrl}" class="w-5 h-3.5 object-cover rounded shadow-sm shrink-0" alt="">
                        <div class="min-w-0 leading-tight">
                            <h4 class="text-xs font-bold text-white truncate">${player.name}</h4>
                            <p class="text-[9px] text-slate-500 truncate mt-0.5">${player.club || 'Kulüpsüz'} • ${player.team}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <div class="text-right">
                            <span class="text-xs font-black text-brand-gold uppercase block">${player.price}M</span>
                        </div>
                        ${
                            isAlreadySelected ? `
                                <span class="px-2 py-0.5 bg-brand-green/10 text-brand-green font-bold text-[8px] uppercase tracking-wider rounded border border-brand-green/20">Seçili</span>
                            ` : (
                                isOverBudget ? `
                                    <span class="px-2 py-0.5 bg-red-950/20 text-red-400 font-bold text-[8px] uppercase tracking-wider rounded border border-red-500/20">Bütçe Aşıyor</span>
                                ` : `
                                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
                                `
                            )
                        }
                    </div>
                </div>
            `;
        }).join('');

        if (players.length === 0) {
            listContainer.innerHTML = `<div class="text-center py-6 text-[10px] text-slate-500 italic">Aradığınız kriterlerde oyuncu bulunamadı.</div>`;
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Attach click listeners for player rows
        listContainer.querySelectorAll('.drawer-player-row').forEach(row => {
            row.addEventListener('click', () => {
                const isSelected = row.dataset.selected === 'true';
                const isOverBudget = row.dataset.overBudget === 'true';
                
                if (isSelected) {
                    alert("Bu oyuncu kadronuzda zaten seçilmiş durumda!");
                    return;
                }
                
                if (isOverBudget) {
                    alert("Bu oyuncunun fiyatı bütçenizi (100M) aşmaktadır!");
                    return;
                }
                
                const pId = row.dataset.playerId;
                const player = this.playersPool.find(p => p.id === pId);
                if (player) {
                    this.squad[this.activeSelectionIndex] = player;
                    
                    // If we replaced a player who was captain, clear captain
                    if (this.captainIndex === this.activeSelectionIndex) {
                        this.captainIndex = null;
                    }
                    
                    this.closeSelectionDrawer();
                    this.render();
                }
            });
        });
    }

    autoFillSquadAlgorithm(pool) {
        const kls = pool.filter(p => p.pos === 'KL').sort((a, b) => b.price - a.price);
        const defs = pool.filter(p => p.pos === 'DEF').sort((a, b) => b.price - a.price);
        const orts = pool.filter(p => p.pos === 'ORT').sort((a, b) => b.price - a.price);
        const fors = pool.filter(p => p.pos === 'FOR').sort((a, b) => b.price - a.price);

        if (kls.length < 1 || defs.length < 4 || orts.length < 3 || fors.length < 3) {
            throw new Error("Kadro seçimi için takımların oyuncu havuzunda yeterli oyuncu bulunamadı!");
        }

        // Start by selecting the top rated players in each position
        let autofilledSquad = [
            kls[0],
            ...defs.slice(0, 4),
            ...orts.slice(0, 3),
            ...fors.slice(0, 3)
        ];

        const getPrice = () => autofilledSquad.reduce((sum, p) => sum + p.price, 0);

        // Greedy Downgrade Algorithm if we are over budget
        let iterations = 0;
        while (getPrice() > 100 && iterations < 200) {
            iterations++;
            let bestSwap = null;
            let maxSavings = 0;

            for (let i = 0; i < autofilledSquad.length; i++) {
                const current = autofilledSquad[i];
                const subPool = current.pos === 'KL' ? kls : (current.pos === 'DEF' ? defs : (current.pos === 'ORT' ? orts : fors));
                
                // Find alternatives not already in our squad
                const alternatives = subPool.filter(alt => alt.price < current.price && !autofilledSquad.some(s => s.id === alt.id));
                if (alternatives.length > 0) {
                    // Pick the best rated alternative that is cheaper
                    const candidate = alternatives[0];
                    const savings = current.price - candidate.price;
                    if (savings > maxSavings) {
                        maxSavings = savings;
                        bestSwap = { index: i, replacement: candidate };
                    }
                }
            }

            if (bestSwap) {
                autofilledSquad[bestSwap.index] = bestSwap.replacement;
            } else {
                break;
            }
        }
        
        // Choose highest priced player as Captain
        let capIndex = 0;
        let highestPrice = 0;
        autofilledSquad.forEach((p, index) => {
            if (p.price > highestPrice) {
                highestPrice = p.price;
                capIndex = index;
            }
        });

        return {
            squad: autofilledSquad,
            captainIndex: capIndex
        };
    }

    async saveSquad() {
        if (this.isRoundLocked()) {
            alert("Bu turun tahmin süresi dolmuştur! Kadro kaydedilemez.");
            return;
        }
        // Validation checks
        const emptySlots = this.squad.filter(p => p === null).length;
        if (emptySlots > 0) {
            alert(`Kadronuz tamamlanmamış! Lütfen boş kalan ${emptySlots} pozisyonu doldurun.`);
            return;
        }

        const budgetUsed = this.getBudgetUsed();
        if (budgetUsed > 100) {
            alert(`Bütçe sınırını aştınız! Kadro maliyeti: ${budgetUsed.toFixed(1)}M. Maksimum bütçe 100M olmalıdır.`);
            return;
        }

        if (this.captainIndex === null || !this.squad[this.captainIndex]) {
            alert("Lütfen kadronuzdan bir Kaptan (C) seçin!");
            return;
        }

        const userId = this.appState.activeUser ? this.appState.activeUser.id : null;
        if (!userId) {
            alert("Lütfen kadronuzu kaydetmek için giriş yapın!");
            return;
        }

        const squadData = {
            players: this.squad.map(p => p.id),
            captain: this.squad[this.captainIndex].id
        };

        // Save using roundKey instead of matchId
        const success = await saveFantasySquad(userId, this.activeRound, squadData);
        if (success) {
            alert("Fantezi 11 kadronuz başarıyla kaydedildi! Maç sonu oyuncu puanları genel sıralamanıza yansıyacaktır. 🏆");
            window.history.back();
            
            // Refresh main dashboard to show updated fantasy lineup status
            this.appState.refreshDashboard();
        } else {
            alert("Kadro kaydedilirken bir hata oluştu!");
        }
    }
}
