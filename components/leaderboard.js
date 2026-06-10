// Leaderboard Component (ranking listing + custom weekly badges 👑/📉 + podium layout + sub-tabs + accordion detailed breakdown)
import { getUsers, getPredictions, getAllFantasySquads, getPlayers, getMatchFantasyRound } from '../firebase-db.js';

export class Leaderboard {
    constructor(containerId, appState) {
        this.container = document.getElementById(containerId);
        this.appState = appState;
        this.activeTab = 'general'; // 'general', 'predictions', 'fantasy'
        
        this.allFantasySquads = [];
        this.playersPool = [];
        this.matches = [];
    }

    async render() {
        this.container.innerHTML = '';
        const users = await getUsers();
        
        // Fetch all predictions and all squads to compute counts
        const allPredictions = await getPredictions();
        this.allFantasySquads = await getAllFantasySquads();
        this.playersPool = await getPlayers();
        this.matches = this.appState.matches;

        // Sub-tabs navigation menu
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'flex bg-slate-950/60 rounded-2xl p-1 text-[10px] font-bold uppercase gap-1 mb-4 border border-white/5 shadow-inner select-none';
        
        const tabs = [
            { key: 'general', label: 'Genel', colorClass: 'bg-brand-gold text-black shadow-neon-gold' },
            { key: 'predictions', label: 'Tahmin', colorClass: 'bg-brand-cyan text-black shadow-neon-cyan' },
            { key: 'fantasy', label: 'Fantezi', colorClass: 'bg-brand-green text-black shadow-neon-green' }
        ];

        tabsContainer.innerHTML = tabs.map(tab => {
            const isActive = tab.key === this.activeTab;
            return `
                <button class="leaderboard-tab flex-grow py-2 rounded-xl text-center transition-all cursor-pointer ${
                    isActive 
                    ? `${tab.colorClass} font-extrabold` 
                    : 'text-slate-400 hover:text-white'
                }" data-tab="${tab.key}">
                    ${tab.label}
                </button>
            `;
        }).join('');

        this.container.appendChild(tabsContainer);

        // Add event listeners to tabs
        tabsContainer.querySelectorAll('.leaderboard-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this.render();
            });
        });

        // Sort users based on active tab
        if (this.activeTab === 'general') {
            users.sort((a, b) => b.points - a.points);
        } else if (this.activeTab === 'predictions') {
            users.sort((a, b) => {
                const aPts = a.predictionPoints !== undefined ? a.predictionPoints : a.points;
                const bPts = b.predictionPoints !== undefined ? b.predictionPoints : b.points;
                return bPts - aPts;
            });
        } else if (this.activeTab === 'fantasy') {
            users.sort((a, b) => {
                const aPts = a.fantasyPoints || 0;
                const bPts = b.fantasyPoints || 0;
                return bPts - aPts;
            });
        }

        if (users.length === 0) {
            this.container.innerHTML = `
                <div class="w-full flex flex-col items-center justify-center p-8 text-center glassmorphism rounded-[2rem] border border-white/10 shadow-2xl mt-4 relative overflow-hidden">
                    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-gold/20 blur-[50px] pointer-events-none"></div>
                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                        <i data-lucide="users-2" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-sm font-outfit font-black text-white uppercase tracking-wider mb-1">Kullanıcı Bulunamadı</h3>
                    <p class="text-[10px] text-slate-400 max-w-[240px] leading-relaxed font-medium">
                        Kayıtlı kullanıcı bulunamadı. Yeni bir hesap oluşturarak ilk tahminlerinizi girmeye başlayın!
                    </p>
                </div>
            `;
            if (window.lucide) {
                window.lucide.createIcons();
            }
            return;
        }

        // 1. TOP PODIUM LAYOUT (If we have at least 3 users)
        const podiumContainer = document.createElement('div');
        podiumContainer.className = 'grid grid-cols-3 gap-3 items-end mb-6 mt-2 px-1';

        const firstPlace = users[0];
        const secondPlace = users[1];
        const thirdPlace = users[2];

        // Second Place Card
        if (secondPlace) {
            podiumContainer.appendChild(this.createPodiumCard(secondPlace, 2, 'h-32 bg-slate-900/60 border-white/5', 'text-slate-400'));
        }
        
        // First Place Card (Taller, center, golden borders)
        if (firstPlace) {
            podiumContainer.appendChild(this.createPodiumCard(firstPlace, 1, 'h-40 bg-gradient-to-tr from-brand-gold/15 to-brand-red/15 border-brand-gold/40 shadow-neon-gold', 'text-brand-gold font-extrabold animate-bounce'));
        }

        // Third Place Card
        if (thirdPlace) {
            podiumContainer.appendChild(this.createPodiumCard(thirdPlace, 3, 'h-28 bg-slate-900/60 border-white/5', 'text-amber-600'));
        }

        this.container.appendChild(podiumContainer);

        // 2. DETAILED LIST VIEW
        const listContainer = document.createElement('div');
        listContainer.className = 'flex flex-col gap-3';

        users.forEach((u, index) => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'flex flex-col gap-1.5 bg-slate-900/10 border border-white/5 rounded-2xl p-1.5 transition-all';

            const row = document.createElement('div');
            const isSelf = u.id === this.appState.activeUser.id;
            
            row.className = `flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                isSelf ? 'border border-brand-gold/20 bg-brand-gold/5' : 'hover:bg-slate-800/40'
            }`;

            // Avatar & Name with badge
            let badgeHtml = '';
            if (u.badge === 'kahin') {
                badgeHtml = '<span class="text-xs ml-1.5" title="Haftanın Kahini">👑</span>';
            } else if (u.badge === 'aglayan') {
                badgeHtml = '<span class="text-xs ml-1.5" title="Haftanın Ağlayanı">📉</span>';
            }

            const userPredsCount = allPredictions.filter(p => p.userId === u.id).length;
            const userSquadsCount = this.allFantasySquads.filter(s => s.userId === u.id).length;

            let displayPts = u.points;
            if (this.activeTab === 'predictions') {
                displayPts = u.predictionPoints !== undefined ? u.predictionPoints : u.points;
            } else if (this.activeTab === 'fantasy') {
                displayPts = u.fantasyPoints || 0;
            }

            row.innerHTML = `
                <div class="flex items-center gap-3.5">
                    <!-- Rank Number -->
                    <span class="text-xs font-outfit font-black text-slate-500 w-4">${index + 1}</span>
                    
                    <!-- Gradient User Avatar -->
                    <div class="w-8 h-8 rounded-full ${u.avatar} p-0.5 shadow-md flex items-center justify-center text-white font-outfit font-bold text-[10px]">
                        ${u.name.substring(0, 1).toUpperCase()}
                    </div>

                    <!-- User Name -->
                    <div class="flex flex-col">
                        <span class="text-xs font-semibold text-slate-200 flex items-center">
                            ${u.name} ${badgeHtml}
                            ${isSelf ? '<span class="text-[8px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.2 rounded-md font-bold ml-1.5 uppercase">Siz</span>' : ''}
                        </span>
                        <span class="text-[8px] text-slate-400/90 font-medium mt-0.5 flex items-center gap-2.5">
                            <span>🔮 Tahmin: <span class="text-slate-200 font-bold">${u.predictionPoints !== undefined ? u.predictionPoints : u.points} P</span> (${userPredsCount} Maç)</span>
                            <span>🏃 Fantezi: <span class="text-slate-200 font-bold">${u.fantasyPoints || 0} P</span> (${userSquadsCount} Kadro)</span>
                        </span>
                    </div>
                </div>

                <!-- Score Points Display -->
                <div class="flex items-center gap-2 shrink-0">
                    <span class="text-xs font-outfit font-black text-brand-gold">${displayPts} P</span>
                    <i id="chevron-${u.id}" data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"></i>
                </div>
            `;

            const breakdown = document.createElement('div');
            breakdown.id = `breakdown-${u.id}`;
            breakdown.className = 'hidden flex flex-col gap-2.5 p-3.5 border-t border-white/5 bg-slate-950/20 rounded-b-xl';

            itemContainer.appendChild(row);
            itemContainer.appendChild(breakdown);
            listContainer.appendChild(itemContainer);

            // Click listener to toggle breakdown
            row.addEventListener('click', (e) => {
                if (e.target.closest('.breakdown-select')) return; // Avoid triggering when selecting dropdown

                const isHidden = breakdown.classList.contains('hidden');
                
                // Close other breakdowns
                document.querySelectorAll('[id^="breakdown-"]').forEach(el => {
                    if (el.id !== breakdown.id) {
                        el.classList.add('hidden');
                    }
                });
                document.querySelectorAll('[id^="chevron-"]').forEach(el => {
                    if (el.id !== `chevron-${u.id}`) {
                        el.style.transform = '';
                    }
                });

                const chevron = document.getElementById(`chevron-${u.id}`);
                if (isHidden) {
                    breakdown.classList.remove('hidden');
                    if (chevron) chevron.style.transform = 'rotate(180deg)';
                    
                    const activeRound = this.appState.getCurrentFantasyRound();
                    this.renderUserBreakdown(u.id, activeRound, breakdown);
                } else {
                    breakdown.classList.add('hidden');
                    if (chevron) chevron.style.transform = '';
                }
            });
        });

        this.container.appendChild(listContainer);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderUserBreakdown(userId, roundKey, container) {
        const squad = this.allFantasySquads.find(s => s.userId === userId && s.matchId === roundKey);
        
        const FANTASY_ROUNDS = [
            { key: 'round_1', label: '1. Maç' },
            { key: 'round_2', label: '2. Maç' },
            { key: 'round_3', label: '3. Maç' },
            { key: 'round_32', label: 'Son 32' },
            { key: 'round_16', label: 'Son 16' },
            { key: 'quarter', label: 'Çeyrek F.' },
            { key: 'semi', label: 'Yarı F.' },
            { key: 'final', label: 'Final' }
        ];

        const selectHtml = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-black text-brand-gold uppercase tracking-wider">Kadro Tur Kırılımı:</span>
                <select class="breakdown-select bg-slate-900 border border-white/10 rounded-lg px-2 py-0.5 text-[9px] text-white font-bold outline-none cursor-pointer">
                    ${FANTASY_ROUNDS.map(r => `
                        <option value="${r.key}" ${r.key === roundKey ? 'selected' : ''}>${r.label}</option>
                    `).join('')}
                </select>
            </div>
        `;

        if (!squad || !squad.players || squad.players.length === 0) {
            container.innerHTML = `
                ${selectHtml}
                <div class="text-center py-4 bg-white/5 border border-dashed border-white/5 rounded-xl">
                    <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Bu turda fantezi kadrosu kurulmamış.</span>
                </div>
            `;
            this.bindBreakdownSelectEvent(userId, container);
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        let playersHtml = '';
        let totalRoundFantasyPts = 0;

        squad.players.forEach(pId => {
            const player = this.playersPool.find(p => p.id === pId);
            if (!player) return;

            const scoreInfo = this.getPlayerFantasyScore(pId, roundKey, squad);
            totalRoundFantasyPts += scoreInfo.finalScore;

            const posColors = {
                'KL': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                'DEF': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                'ORT': 'text-green-400 bg-green-500/10 border-green-500/20',
                'FOR': 'text-red-400 bg-red-500/10 border-red-500/20'
            };
            const posBadge = `<span class="text-[8px] font-black border px-1.5 py-0.2 rounded-md ${posColors[player.pos] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'}">${player.pos}</span>`;

            playersHtml += `
                <div class="flex items-center justify-between p-1.5 bg-slate-900/50 border border-white/5 rounded-xl text-[9px]">
                    <div class="flex items-center gap-2 truncate">
                        ${posBadge}
                        <span class="text-slate-200 font-bold truncate">${player.name}</span>
                        ${scoreInfo.isCaptain ? '<span class="text-[8px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.2 rounded-md font-bold uppercase ml-1">C</span>' : ''}
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-slate-500">Reyting: <span class="text-slate-300 font-semibold">${scoreInfo.rating > 0 ? scoreInfo.rating.toFixed(1) : '-'}</span></span>
                        <span class="text-brand-green font-black">+${scoreInfo.finalScore.toFixed(1)} P</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            ${selectHtml}
            <div class="flex flex-col gap-1.5">
                ${playersHtml}
            </div>
            <div class="flex justify-between items-center pt-2 mt-1 border-t border-white/5 text-[9px] font-black uppercase">
                <span class="text-slate-400">Tur Toplamı:</span>
                <span class="text-brand-gold">${totalRoundFantasyPts.toFixed(1)} Puan</span>
            </div>
        `;

        this.bindBreakdownSelectEvent(userId, container);
        if (window.lucide) window.lucide.createIcons();
    }

    bindBreakdownSelectEvent(userId, container) {
        const select = container.querySelector('.breakdown-select');
        if (select) {
            select.addEventListener('change', (e) => {
                const selectedRound = e.target.value;
                this.renderUserBreakdown(userId, selectedRound, container);
            });
        }
    }

    getPlayerFantasyScore(playerId, roundKey, squad) {
        const dayMatches = this.matches.filter(m => {
            return getMatchFantasyRound(m, this.matches) === roundKey;
        });

        let ratingSum = 0;

        dayMatches.forEach(match => {
            if (match.status === 'FINISHED' && match.playerRatings && match.playerRatings[playerId] !== undefined) {
                const rating = parseFloat(match.playerRatings[playerId]) || 0;
                ratingSum += rating;
            }
        });

        const baseScore = ratingSum;
        const isCaptain = squad.captain === playerId;
        const finalScore = isCaptain ? baseScore * 2 : baseScore;

        return {
            rating: baseScore,
            finalScore: Math.round(finalScore * 10) / 10,
            isCaptain
        };
    }

    createPodiumCard(user, place, heightClass, textColorClass) {
        const card = document.createElement('div');
        card.className = `flex-1 flex flex-col items-center justify-between p-3 rounded-2xl border text-center relative ${heightClass}`;
        
        let crownHtml = '';
        if (place === 1) {
            crownHtml = '<div class="absolute -top-3 left-1/2 -translate-x-1/2 text-lg animate-pulse">👑</div>';
        }

        let displayPts = user.points;
        if (this.activeTab === 'predictions') {
            displayPts = user.predictionPoints !== undefined ? user.predictionPoints : user.points;
        } else if (this.activeTab === 'fantasy') {
            displayPts = user.fantasyPoints || 0;
        }

        card.innerHTML = `
            ${crownHtml}
            <div class="flex flex-col items-center">
                <!-- Avatar -->
                <div class="w-10 h-10 rounded-full ${user.avatar} p-0.5 shadow-lg flex items-center justify-center text-white font-outfit font-bold text-sm">
                    ${user.name.substring(0, 1).toUpperCase()}
                </div>
                <!-- Name -->
                <span class="text-[10px] font-bold text-slate-200 mt-2 truncate w-20 block leading-tight">${user.name}</span>
            </div>

            <!-- Rank Place Badge -->
            <div class="flex flex-col items-center mt-1">
                <span class="text-[9px] font-outfit font-black ${textColorClass} uppercase tracking-widest">${place}. SIRA</span>
                <span class="text-xs font-outfit font-black text-brand-gold mt-0.5">${displayPts} Pts</span>
            </div>
        `;
        return card;
    }
}
