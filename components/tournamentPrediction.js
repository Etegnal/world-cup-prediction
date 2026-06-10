// Tournament Prediction Component (SPA Section for predicting Group Standings & Knockout Bracket)
import { getGroupPredictions, saveGroupPredictions, getBracketPredictions, saveBracketPredictions } from '../firebase-db.js';

export class TournamentPrediction {
    constructor(containerId, appState) {
        this.container = document.getElementById(containerId);
        this.appState = appState;
        
        this.activeTab = 'groups'; // 'groups', 'thirds', 'bracket'
        this.activeGroupIndex = 0; // 0 to 11 (Groups A to L)
        
        this.groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        this.teamInfo = {};      // teamName -> { code, flag }
        this.groupTeams = {};    // groupLetter -> list of team names (sorted/current prediction)
        
        this.selectedThirds = new Set(); // set of selected 3rd-placed team names
        this.activeBracketRound = 'r32'; // 'r32', 'r16', 'qf', 'sff'
        
        // Bracket state (winners of each match)
        this.bracket = {
            r32: {},
            r16: {},
            qf: {},
            sf: {},
            final: {}
        };

        // Templates mapping round match winners to the next round matches
        this.bracketFlow = {
            r32: {
                'match-r32-1':  { targetMatch: 'match-r16-1', slot: 'home' },
                'match-r32-13': { targetMatch: 'match-r16-1', slot: 'away' },
                'match-r32-2':  { targetMatch: 'match-r16-2', slot: 'home' },
                'match-r32-14': { targetMatch: 'match-r16-2', slot: 'away' },
                'match-r32-3':  { targetMatch: 'match-r16-3', slot: 'home' },
                'match-r32-15': { targetMatch: 'match-r16-3', slot: 'away' },
                'match-r32-4':  { targetMatch: 'match-r16-4', slot: 'home' },
                'match-r32-16': { targetMatch: 'match-r16-4', slot: 'away' },
                'match-r32-5':  { targetMatch: 'match-r16-5', slot: 'home' },
                'match-r32-9':  { targetMatch: 'match-r16-5', slot: 'away' },
                'match-r32-6':  { targetMatch: 'match-r16-6', slot: 'home' },
                'match-r32-10': { targetMatch: 'match-r16-6', slot: 'away' },
                'match-r32-7':  { targetMatch: 'match-r16-7', slot: 'home' },
                'match-r32-11': { targetMatch: 'match-r16-7', slot: 'away' },
                'match-r32-8':  { targetMatch: 'match-r16-8', slot: 'home' },
                'match-r32-12': { targetMatch: 'match-r16-8', slot: 'away' }
            },
            r16: {
                'match-r16-1': { targetMatch: 'match-qf-1', slot: 'home' },
                'match-r16-5': { targetMatch: 'match-qf-1', slot: 'away' },
                'match-r16-2': { targetMatch: 'match-qf-2', slot: 'home' },
                'match-r16-6': { targetMatch: 'match-qf-2', slot: 'away' },
                'match-r16-3': { targetMatch: 'match-qf-3', slot: 'home' },
                'match-r16-7': { targetMatch: 'match-qf-3', slot: 'away' },
                'match-r16-4': { targetMatch: 'match-qf-4', slot: 'home' },
                'match-r16-8': { targetMatch: 'match-qf-4', slot: 'away' }
            },
            qf: {
                'match-qf-1': { targetMatch: 'match-sf-1', slot: 'home' },
                'match-qf-3': { targetMatch: 'match-sf-1', slot: 'away' },
                'match-qf-2': { targetMatch: 'match-sf-2', slot: 'home' },
                'match-qf-4': { targetMatch: 'match-sf-2', slot: 'away' }
            },
            sf: {
                'match-sf-1': { targetMatch: 'match-final-1', slot: 'home' },
                'match-sf-2': { targetMatch: 'match-final-1', slot: 'away' }
            }
        };

        this.initEventListenersBound = false;
    }

    async init() {
        this.extractTeamsData();
        
        if (!this.appState.activeUser) return;
        const userId = this.appState.activeUser.id;

        // 1. Load saved group predictions
        const savedGroups = await getGroupPredictions(userId);
        if (savedGroups && Object.keys(savedGroups).length > 0) {
            this.groupLetters.forEach(g => {
                if (savedGroups[g] && savedGroups[g].length === 4) {
                    this.groupTeams[g] = [...savedGroups[g]];
                }
            });
        }

        // 2. Load saved bracket predictions
        const savedBracket = await getBracketPredictions(userId);
        if (savedBracket) {
            this.bracket = {
                r32: savedBracket.r32 || {},
                r16: savedBracket.r16 || {},
                qf: savedBracket.qf || {},
                sf: savedBracket.sf || {},
                final: savedBracket.final || {}
            };
            if (savedBracket.selectedThirds) {
                this.selectedThirds = new Set(savedBracket.selectedThirds);
            }
        }
    }

    extractTeamsData() {
        const matches = this.appState.matches;
        
        // Dynamic extraction of team names, codes, and flags
        matches.forEach(m => {
            if (m.homeTeam) this.teamInfo[m.homeTeam] = { code: m.homeTeamCode, flag: m.homeFlag };
            if (m.awayTeam) this.teamInfo[m.awayTeam] = { code: m.awayTeamCode, flag: m.awayFlag };
        });

        // Initialize groupTeams dictionary
        this.groupLetters.forEach(g => {
            if (!this.groupTeams[g]) {
                const teams = new Set();
                matches.forEach(m => {
                    if (m.group === g) {
                        teams.add(m.homeTeam);
                        teams.add(m.awayTeam);
                    }
                });
                this.groupTeams[g] = Array.from(teams).slice(0, 4);
            }
        });
    }

    bindStaticEvents() {
        if (this.initEventListenersBound) return;

        // Back button to fixtures dashboard
        const btnBack = document.getElementById('btn-back-to-matches');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Horizontal sub-tabs navigation
        const tabGroups = document.getElementById('btn-tab-groups');
        const tabThirds = document.getElementById('btn-tab-thirds');
        const tabBracket = document.getElementById('btn-tab-bracket');

        if (tabGroups && tabThirds && tabBracket) {
            tabGroups.addEventListener('click', () => this.switchSubTab('groups'));
            tabThirds.addEventListener('click', () => this.switchSubTab('thirds'));
            tabBracket.addEventListener('click', () => this.switchSubTab('bracket'));
        }

        // Groups step next/prev pagination
        const btnPrev = document.getElementById('btn-prev-group');
        const btnNext = document.getElementById('btn-next-group');
        if (btnPrev) btnPrev.addEventListener('click', () => this.changeActiveGroup(-1));
        if (btnNext) btnNext.addEventListener('click', () => this.changeActiveGroup(1));

        // Thirds step completion proceed button
        const btnProceed = document.getElementById('btn-proceed-to-bracket');
        if (btnProceed) {
            btnProceed.addEventListener('click', () => {
                if (this.selectedThirds.size === 8) {
                    this.switchSubTab('bracket');
                }
            });
        }

        // Bracket round sub-tabs
        const r32Tab = document.getElementById('btn-bracket-tab-r32');
        const r16Tab = document.getElementById('btn-bracket-tab-r16');
        const qfTab = document.getElementById('btn-bracket-tab-qf');
        const sffTab = document.getElementById('btn-bracket-tab-sff');

        if (r32Tab && r16Tab && qfTab && sffTab) {
            r32Tab.addEventListener('click', () => this.switchBracketRound('r32'));
            r16Tab.addEventListener('click', () => this.switchBracketRound('r16'));
            qfTab.addEventListener('click', () => this.switchBracketRound('qf'));
            sffTab.addEventListener('click', () => this.switchBracketRound('sff'));
        }

        // Save Predictions Button
        const btnSave = document.getElementById('btn-save-all-predictions');
        if (btnSave) {
            btnSave.addEventListener('click', () => this.saveAllPredictions());
        }

        this.initEventListenersBound = true;
    }

    switchSubTab(tabName) {
        this.activeTab = tabName;
        
        const tabs = {
            groups: document.getElementById('btn-tab-groups'),
            thirds: document.getElementById('btn-tab-thirds'),
            bracket: document.getElementById('btn-tab-bracket')
        };
        const containers = {
            groups: document.getElementById('container-groups'),
            thirds: document.getElementById('container-thirds'),
            bracket: document.getElementById('container-bracket')
        };

        // Reset classes
        Object.keys(tabs).forEach(k => {
            if (tabs[k]) {
                tabs[k].className = "flex-grow py-2.5 rounded-xl text-center transition-all text-slate-400";
                tabs[k].style.boxShadow = 'none';
            }
            if (containers[k]) containers[k].classList.add('hidden');
        });

        // Set active
        if (tabs[tabName]) {
            tabs[tabName].className = "flex-grow py-2.5 rounded-xl text-center transition-all bg-brand-gold text-black font-extrabold shadow-neon-gold";
        }
        if (containers[tabName]) containers[tabName].classList.remove('hidden');

        this.render();
    }

    changeActiveGroup(direction) {
        const nextIdx = this.activeGroupIndex + direction;
        if (nextIdx >= 0 && nextIdx < this.groupLetters.length) {
            this.activeGroupIndex = nextIdx;
            this.render();
        } else if (nextIdx === this.groupLetters.length) {
            this.switchSubTab('thirds');
        }
    }

    switchBracketRound(roundName) {
        this.activeBracketRound = roundName;

        const tabs = {
            r32: document.getElementById('btn-bracket-tab-r32'),
            r16: document.getElementById('btn-bracket-tab-r16'),
            qf: document.getElementById('btn-bracket-tab-qf'),
            sff: document.getElementById('btn-bracket-tab-sff')
        };

        Object.keys(tabs).forEach(k => {
            if (tabs[k]) {
                tabs[k].className = "flex-grow py-1.5 rounded-lg text-center transition-all text-slate-400";
            }
        });

        if (tabs[roundName]) {
            tabs[roundName].className = "flex-grow py-1.5 rounded-lg text-center transition-all bg-brand-gold text-black font-extrabold shadow-sm";
        }

        // Scroll the horizontal tree container to the column
        const treeContainer = document.getElementById('bracket-matchups-list');
        const targetColId = roundName === 'sff' ? 'bracket-column-sf' : `bracket-column-${roundName}`;
        const targetColumn = document.getElementById(targetColId);
        
        if (treeContainer && targetColumn) {
            const containerRect = treeContainer.getBoundingClientRect();
            const targetRect = targetColumn.getBoundingClientRect();
            const scrollLeft = treeContainer.scrollLeft + (targetRect.left - containerRect.left) - 16;
            treeContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }

    async render() {
        this.bindStaticEvents();

        if (this.activeTab === 'groups') {
            this.renderGroupsProgress();
            this.renderGroupCard();
        } else if (this.activeTab === 'thirds') {
            this.renderThirdsSelector();
        } else if (this.activeTab === 'bracket') {
            this.renderBracketMatchups();
        }
        
        if (window.lucide) window.lucide.createIcons();
    }

    // --- STEP 1: GROUPS VIEW ---
    renderGroupsProgress() {
        const bar = document.getElementById('groups-progress-bar');
        if (!bar) return;
        
        bar.innerHTML = '';
        this.groupLetters.forEach((g, idx) => {
            const dot = document.createElement('div');
            // If predicted (all 4 teams exist)
            const isCompleted = this.groupTeams[g] && this.groupTeams[g].length === 4;
            const isActive = idx === this.activeGroupIndex;
            
            let classStr = "group-progress-dot border border-white/10 p-2.5 rounded-xl text-slate-400 bg-white/5 cursor-pointer";
            if (isActive) classStr += " active";
            else if (isCompleted) classStr += " completed";
            
            dot.className = classStr;
            dot.textContent = `GRUP ${g}`;
            dot.addEventListener('click', () => {
                this.activeGroupIndex = idx;
                this.render();
            });
            bar.appendChild(dot);
        });
    }

    renderGroupCard() {
        const card = document.getElementById('group-editor-card');
        if (!card) return;

        const groupLetter = this.groupLetters[this.activeGroupIndex];
        const teams = this.groupTeams[groupLetter] || [];

        // Setup cards HTML with drag-drop and arrow controllers
        let listHtml = '';
        teams.forEach((t, idx) => {
            const info = this.teamInfo[t] || { code: 'N/A', flag: '' };
            let positionLabel = '';
            let bgBadgeClass = '';
            if (idx === 0) { positionLabel = '🥇 1. Lider'; bgBadgeClass = 'standing-badge-1'; }
            else if (idx === 1) { positionLabel = '🥈 2. İkinci'; bgBadgeClass = 'standing-badge-2'; }
            else if (idx === 2) { positionLabel = '🥉 3. Üçüncü'; bgBadgeClass = 'standing-badge-3'; }
            else { positionLabel = '❌ 4. Elendi'; bgBadgeClass = 'standing-badge-4'; }

            listHtml += `
                <div class="draggable-team-card flex items-center justify-between p-3.5 bg-slate-900/60 border border-white/5 rounded-2xl ${bgBadgeClass}" 
                     draggable="true" data-index="${idx}" data-team="${t}">
                    
                    <div class="flex items-center gap-3">
                        <!-- Flagpole waving design -->
                        <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-7 bg-slate-800 dark:bg-slate-700 rounded-full border-r border-white/10"></span>
                            <img src="${info.flag}" class="w-6 h-4 waving-flag shadow-sm" alt="${t} Bayrağı">
                        </div>
                        <div>
                            <span class="text-xs font-black text-slate-100">${t}</span>
                            <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">${info.code}</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-slate-300">
                            ${positionLabel}
                        </span>
                        <!-- Up/Down arrows for mobile re-ordering -->
                        <div class="flex flex-col gap-1">
                            <button class="btn-arrow-up w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 active:scale-90 cursor-pointer" data-idx="${idx}">
                                <i data-lucide="chevron-up" class="w-3 h-3"></i>
                            </button>
                            <button class="btn-arrow-down w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 active:scale-90 cursor-pointer" data-idx="${idx}">
                                <i data-lucide="chevron-down" class="w-3 h-3"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 bg-brand-cyan/10 blur-[15px] pointer-events-none"></div>
            <div class="flex justify-between items-center pb-2 border-b border-white/5">
                <span class="text-xs font-outfit font-black text-brand-cyan uppercase tracking-widest">GRUP ${groupLetter} SIRALAMASI</span>
                <span class="text-[9px] text-slate-400 font-medium">Sürükle veya oklarla sırala</span>
            </div>
            
            <div id="drag-drop-list" class="flex flex-col gap-3">
                ${listHtml}
            </div>
        `;

        // Bind Drag & Drop and arrow click handlers
        this.bindDragEvents();
        this.bindArrowEvents();
        
        // Show/hide pagination buttons
        const btnPrev = document.getElementById('btn-prev-group');
        const btnNext = document.getElementById('btn-next-group');
        if (btnPrev) btnPrev.style.visibility = this.activeGroupIndex === 0 ? 'hidden' : 'visible';
        if (btnNext) {
            if (this.activeGroupIndex === this.groupLetters.length - 1) {
                btnNext.innerHTML = 'En İyi 3. Aşaması ➔';
                btnNext.className = "flex-1 py-3 bg-gradient-to-r from-brand-gold to-yellow-600 text-black text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-yellow-950/45";
            } else {
                btnNext.innerHTML = 'Sıradaki Grup ▶';
                btnNext.className = "flex-1 py-3 bg-gradient-to-r from-brand-green to-brand-blue text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer";
            }
        }
    }

    bindDragEvents() {
        const list = document.getElementById('drag-drop-list');
        const cards = list.querySelectorAll('.draggable-team-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.index);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingCard = list.querySelector('.dragging');
            const siblings = [...list.querySelectorAll('.draggable-team-card:not(.dragging)')];
            
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                return offset < 0;
            });
            
            list.insertBefore(draggingCard, nextSibling);
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            // Reconstruct array based on current DOM order
            const finalCards = [...list.querySelectorAll('.draggable-team-card')];
            const newOrder = finalCards.map(c => c.dataset.team);
            const groupLetter = this.groupLetters[this.activeGroupIndex];
            
            // Update standings and re-render card to apply standings color themes
            this.updateGroupStandings(groupLetter, newOrder);
        });
    }

    bindArrowEvents() {
        const card = document.getElementById('group-editor-card');
        const upButtons = card.querySelectorAll('.btn-arrow-up');
        const downButtons = card.querySelectorAll('.btn-arrow-down');
        
        const groupLetter = this.groupLetters[this.activeGroupIndex];
        const teams = [...this.groupTeams[groupLetter]];

        upButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (idx > 0) {
                    // Swap with previous
                    [teams[idx], teams[idx - 1]] = [teams[idx - 1], teams[idx]];
                    this.updateGroupStandings(groupLetter, teams);
                }
            });
        });

        downButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (idx < teams.length - 1) {
                    // Swap with next
                    [teams[idx], teams[idx + 1]] = [teams[idx + 1], teams[idx]];
                    this.updateGroupStandings(groupLetter, teams);
                }
            });
        });
    }

    updateGroupStandings(groupLetter, newOrder) {
        // Save the old 3rd placed team to check if it has been replaced
        const oldThird = this.groupTeams[groupLetter][2];
        const newThird = newOrder[2];
        
        this.groupTeams[groupLetter] = newOrder;

        // If the third-placed team has changed, clear it from selectedThirds and bracket R32
        if (oldThird && oldThird !== newThird) {
            if (this.selectedThirds.has(oldThird)) {
                this.selectedThirds.delete(oldThird);
            }
            this.clearTeamFromBracket(oldThird);
        }

        // If there's any change in top 2, clear the old team from bracket
        const oldTop2 = this.groupTeams[groupLetter].slice(0, 2);
        this.groupTeams[groupLetter].forEach((team, i) => {
            if (i >= 2) { // no longer top 2
                this.clearTeamFromBracket(team);
            }
        });

        this.render();
    }

    clearTeamFromBracket(teamName) {
        // Clear winner/slots of bracket that contain this team
        const rounds = ['r32', 'r16', 'qf', 'sf', 'final'];
        rounds.forEach(round => {
            if (this.bracket[round]) {
                Object.keys(this.bracket[round]).forEach(matchId => {
                    if (this.bracket[round][matchId] === teamName) {
                        delete this.bracket[round][matchId];
                    }
                });
            }
        });
    }

    // --- STEP 2: THIRDS SELECTOR VIEW ---
    renderThirdsSelector() {
        const grid = document.getElementById('thirds-selection-grid');
        const counter = document.getElementById('thirds-selection-counter');
        const btnProceed = document.getElementById('btn-proceed-to-bracket');
        if (!grid || !counter || !btnProceed) return;

        grid.innerHTML = '';

        // Extract the 3rd placed teams from all 12 groups
        const thirdTeams = this.groupLetters.map(g => {
            return {
                group: g,
                teamName: this.groupTeams[g][2]
            };
        });

        thirdTeams.forEach(t => {
            const isSelected = this.selectedThirds.has(t.teamName);
            const info = this.teamInfo[t.teamName] || { code: 'N/A', flag: '' };

            const card = document.createElement('div');
            card.className = `third-selector-card flex items-center justify-between p-3 bg-slate-900/60 border border-white/5 rounded-2xl transition-all ${isSelected ? 'selected' : ''}`;
            
            card.innerHTML = `
                <div class="flex items-center gap-2">
                    <img src="${info.flag}" class="w-5 h-3.5 waving-flag rounded-sm" alt="${t.teamName}">
                    <div>
                        <span class="text-[11px] font-black text-slate-100 block max-w-[90px] truncate">${t.teamName}</span>
                        <span class="text-[8px] text-slate-400 font-bold uppercase block">GRUP ${t.group}</span>
                    </div>
                </div>
                <div>
                    ${isSelected ? `
                        <div class="w-4.5 h-4.5 rounded-full bg-brand-green/20 border border-brand-green text-brand-green flex items-center justify-center">
                            <i data-lucide="check" class="w-2.5 h-2.5"></i>
                        </div>
                    ` : `
                        <div class="w-4.5 h-4.5 rounded-full border border-white/20"></div>
                    `}
                </div>
            `;

            card.addEventListener('click', () => {
                if (this.selectedThirds.has(t.teamName)) {
                    this.selectedThirds.delete(t.teamName);
                    this.clearTeamFromBracket(t.teamName);
                } else {
                    if (this.selectedThirds.size >= 8) {
                        alert("En fazla 8 adet en iyi üçüncü takım seçebilirsiniz!");
                        return;
                    }
                    this.selectedThirds.add(t.teamName);
                }
                this.renderThirdsSelector();
            });

            grid.appendChild(card);
        });

        // Update counter & proceed button
        counter.textContent = `${this.selectedThirds.size} / 8`;
        if (this.selectedThirds.size === 8) {
            btnProceed.disabled = false;
            btnProceed.className = "w-full py-3 bg-gradient-to-r from-brand-gold to-yellow-600 hover:from-brand-gold hover:to-yellow-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-yellow-950 cursor-pointer animate-pulse";
        } else {
            btnProceed.disabled = true;
            btnProceed.className = "w-full py-3 bg-white/5 border border-white/10 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl transition-all cursor-not-allowed opacity-50";
        }
        
        if (window.lucide) window.lucide.createIcons();
    }

    // --- STEP 3: ELEMELER BRACKET VIEW ---
    getKnockoutTeams() {
        // Collects group winners & runners-up
        const winners = {};
        const runners = {};
        this.groupLetters.forEach(g => {
            winners[g] = this.groupTeams[g][0];
            runners[g] = this.groupTeams[g][1];
        });

        // Collect 8 selected third-placed teams sorted alphabetically/group wise
        const selectedThirdsSorted = Array.from(this.selectedThirds).sort((a, b) => {
            // Find which groups they belong to
            let groupA = '';
            let groupB = '';
            this.groupLetters.forEach(g => {
                if (this.groupTeams[g][2] === a) groupA = g;
                if (this.groupTeams[g][2] === b) groupB = g;
            });
            return groupA.localeCompare(groupB);
        });

        return { winners, runners, thirds: selectedThirdsSorted };
    }

    createMatchCardHtml(m, roundKey) {
        const predictedWinner = this.bracket[roundKey] ? this.bracket[roundKey][m.id] : null;

        const homeInfo = this.teamInfo[m.home] || { code: 'TBD', flag: '' };
        const awayInfo = this.teamInfo[m.away] || { code: 'TBD', flag: '' };

        const isHomeSelected = predictedWinner && predictedWinner === m.home;
        const isAwaySelected = predictedWinner && predictedWinner === m.away;

        const hasWinnerClass = predictedWinner ? 'has-winner' : '';
        const hasHomeClass = m.home ? 'has-home' : '';

        return `
            <div class="bracket-match-card flex flex-col gap-1.5 relative overflow-hidden p-2 rounded-xl bg-slate-900/90 border border-white/5 shadow-lg w-[180px] flex-shrink-0 ${hasWinnerClass} ${hasHomeClass}" data-match-id="${m.id}">
                <div class="text-[8px] font-black uppercase text-brand-gold tracking-widest pl-1">
                    ${m.label}
                </div>
                <div class="flex flex-col gap-1">
                    <!-- Home Team Row -->
                    <div class="bracket-team-row flex items-center justify-between p-1.5 px-2.5 border border-white/5 rounded-lg text-[10px] transition-all hover:bg-white/5 cursor-pointer ${isHomeSelected ? 'selected-winner selected-winner-glow bg-brand-gold/10 text-brand-gold border-brand-gold/30 font-bold' : 'text-slate-300'}" 
                         data-match="${m.id}" data-round="${roundKey}" data-team="${m.home || ''}">
                        <div class="flex items-center gap-2">
                            ${m.home && homeInfo.flag ? `<img src="${homeInfo.flag}" class="w-5 h-3.5 waving-flag rounded-sm" alt="">` : `<div class="w-5 h-3.5 bg-slate-800 rounded-sm border border-white/10"></div>`}
                            <span class="font-extrabold truncate max-w-[85px] ${m.home ? '' : 'text-slate-500 italic font-normal'}">${m.home || 'Belli Değil'}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            ${isHomeSelected ? `<i data-lucide="check" class="w-3 h-3 text-brand-gold animate-pulse mr-0.5"></i>` : ''}
                            <span class="text-[8px] font-black opacity-60 uppercase tracking-widest">${homeInfo.code}</span>
                        </div>
                    </div>

                    <!-- Away Team Row -->
                    <div class="bracket-team-row flex items-center justify-between p-1.5 px-2.5 border border-white/5 rounded-xl text-[10px] transition-all hover:bg-white/5 cursor-pointer ${isAwaySelected ? 'selected-winner selected-winner-glow bg-brand-gold/10 text-brand-gold border-brand-gold/30 font-bold' : 'text-slate-300'}" 
                         data-match="${m.id}" data-round="${roundKey}" data-team="${m.away || ''}">
                        <div class="flex items-center gap-2">
                            ${m.away && awayInfo.flag ? `<img src="${awayInfo.flag}" class="w-5 h-3.5 waving-flag rounded-sm" alt="">` : `<div class="w-5 h-3.5 bg-slate-800 rounded-sm border border-white/10"></div>`}
                            <span class="font-extrabold truncate max-w-[85px] ${m.away ? '' : 'text-slate-500 italic font-normal'}">${m.away || 'Belli Değil'}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            ${isAwaySelected ? `<i data-lucide="check" class="w-3 h-3 text-brand-gold animate-pulse mr-0.5"></i>` : ''}
                            <span class="text-[8px] font-black opacity-60 uppercase tracking-widest">${awayInfo.code}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderBracketMatchups() {
        const list = document.getElementById('bracket-matchups-list');
        if (!list) return;

        // Preserve scroll positions
        const savedScrollLeft = list.scrollLeft;
        const savedScrollTop = list.scrollTop;

        list.innerHTML = '';
        
        // Re-style matchups list dynamically to support horizontal scrolling tree
        list.className = "flex flex-row gap-8 overflow-x-auto overflow-y-auto max-h-[580px] pr-1 py-4 scrollbar-thin select-none relative";
        list.style.minHeight = "480px";

        const koTeams = this.getKnockoutTeams();

        // 1. Son 32 (16 matches, ordered to feed clean pairs into Son 16)
        const R32_MATCHES_MAP = {
            'match-r32-1':  { home: koTeams.winners['A'], away: koTeams.thirds[0] || 'En İyi 3. (1)', label: 'Son 32 - 1. Eşleşme' },
            'match-r32-2':  { home: koTeams.winners['B'], away: koTeams.thirds[1] || 'En İyi 3. (2)', label: 'Son 32 - 2. Eşleşme' },
            'match-r32-3':  { home: koTeams.winners['C'], away: koTeams.runners['F'], label: 'Son 32 - 3. Eşleşme' },
            'match-r32-4':  { home: koTeams.winners['D'], away: koTeams.thirds[2] || 'En İyi 3. (3)', label: 'Son 32 - 4. Eşleşme' },
            'match-r32-5':  { home: koTeams.winners['E'], away: koTeams.thirds[3] || 'En İyi 3. (4)', label: 'Son 32 - 5. Eşleşme' },
            'match-r32-6':  { home: koTeams.winners['F'], away: koTeams.runners['C'], label: 'Son 32 - 6. Eşleşme' },
            'match-r32-7':  { home: koTeams.winners['G'], away: koTeams.thirds[4] || 'En İyi 3. (5)', label: 'Son 32 - 7. Eşleşme' },
            'match-r32-8':  { home: koTeams.winners['H'], away: koTeams.runners['J'], label: 'Son 32 - 8. Eşleşme' },
            'match-r32-9':  { home: koTeams.winners['I'], away: koTeams.thirds[5] || 'En İyi 3. (6)', label: 'Son 32 - 9. Eşleşme' },
            'match-r32-10': { home: koTeams.winners['J'], away: koTeams.runners['H'], label: 'Son 32 - 10. Eşleşme' },
            'match-r32-11': { home: koTeams.winners['K'], away: koTeams.thirds[6] || 'En İyi 3. (7)', label: 'Son 32 - 11. Eşleşme' },
            'match-r32-12': { home: koTeams.winners['L'], away: koTeams.thirds[7] || 'En İyi 3. (8)', label: 'Son 32 - 12. Eşleşme' },
            'match-r32-13': { home: koTeams.runners['A'], away: koTeams.runners['B'], label: 'Son 32 - 13. Eşleşme' },
            'match-r32-14': { home: koTeams.runners['D'], away: koTeams.runners['G'], label: 'Son 32 - 14. Eşleşme' },
            'match-r32-15': { home: koTeams.runners['E'], away: koTeams.runners['I'], label: 'Son 32 - 15. Eşleşme' },
            'match-r32-16': { home: koTeams.runners['K'], away: koTeams.runners['L'], label: 'Son 32 - 16. Eşleşme' }
        };

        const R32_ORDER = [
            'match-r32-1', 'match-r32-13',
            'match-r32-2', 'match-r32-14',
            'match-r32-3', 'match-r32-15',
            'match-r32-4', 'match-r32-16',
            'match-r32-5', 'match-r32-9',
            'match-r32-6', 'match-r32-10',
            'match-r32-7', 'match-r32-11',
            'match-r32-8', 'match-r32-12'
        ];

        // 2. Son 16 (8 matches)
        const R16_MATCHES_MAP = {
            'match-r16-1': { home: this.bracket.r32['match-r32-1'], away: this.bracket.r32['match-r32-13'], label: 'Son 16 - 1. Eşleşme' },
            'match-r16-2': { home: this.bracket.r32['match-r32-2'], away: this.bracket.r32['match-r32-14'], label: 'Son 16 - 2. Eşleşme' },
            'match-r16-3': { home: this.bracket.r32['match-r32-3'], away: this.bracket.r32['match-r32-15'], label: 'Son 16 - 3. Eşleşme' },
            'match-r16-4': { home: this.bracket.r32['match-r32-4'], away: this.bracket.r32['match-r32-16'], label: 'Son 16 - 4. Eşleşme' },
            'match-r16-5': { home: this.bracket.r32['match-r32-5'], away: this.bracket.r32['match-r32-9'],  label: 'Son 16 - 5. Eşleşme' },
            'match-r16-6': { home: this.bracket.r32['match-r32-6'], away: this.bracket.r32['match-r32-10'], label: 'Son 16 - 6. Eşleşme' },
            'match-r16-7': { home: this.bracket.r32['match-r32-7'], away: this.bracket.r32['match-r32-11'], label: 'Son 16 - 7. Eşleşme' },
            'match-r16-8': { home: this.bracket.r32['match-r32-8'], away: this.bracket.r32['match-r32-12'], label: 'Son 16 - 8. Eşleşme' }
        };

        const R16_ORDER = [
            'match-r16-1', 'match-r16-5',
            'match-r16-2', 'match-r16-6',
            'match-r16-3', 'match-r16-7',
            'match-r16-4', 'match-r16-8'
        ];

        // 3. Çeyrek Final (4 matches)
        const QF_MATCHES_MAP = {
            'match-qf-1': { home: this.bracket.r16['match-r16-1'], away: this.bracket.r16['match-r16-5'], label: 'Çeyrek Final - 1. Eşleşme' },
            'match-qf-2': { home: this.bracket.r16['match-r16-2'], away: this.bracket.r16['match-r16-6'], label: 'Çeyrek Final - 2. Eşleşme' },
            'match-qf-3': { home: this.bracket.r16['match-r16-3'], away: this.bracket.r16['match-r16-7'], label: 'Çeyrek Final - 3. Eşleşme' },
            'match-qf-4': { home: this.bracket.r16['match-r16-4'], away: this.bracket.r16['match-r16-8'], label: 'Çeyrek Final - 4. Eşleşme' }
        };

        const QF_ORDER = [
            'match-qf-1', 'match-qf-3',
            'match-qf-2', 'match-qf-4'
        ];

        // 4. Yarı Final (2 matches)
        const SF_MATCHES_MAP = {
            'match-sf-1': { home: this.bracket.qf['match-qf-1'], away: this.bracket.qf['match-qf-3'], label: 'Yarı Final - 1. Eşleşme' },
            'match-sf-2': { home: this.bracket.qf['match-qf-2'], away: this.bracket.qf['match-qf-4'], label: 'Yarı Final - 2. Eşleşme' }
        };

        const SF_ORDER = [
            'match-sf-1', 'match-sf-2'
        ];

        // 5. Final (1 match)
        const FINAL_MATCH = { id: 'match-final-1', home: this.bracket.sf['match-sf-1'], away: this.bracket.sf['match-sf-2'], label: 'DÜNYA KUPASI FİNALİ 🏆' };

        // Helper to construct a column wrapper with sticky header
        const createColumn = (colId, title, itemsCount, buildContentFn) => {
            const colWrapper = document.createElement('div');
            colWrapper.className = "bracket-column-wrapper flex flex-col h-[1250px] min-w-[200px] flex-shrink-0";
            
            const header = document.createElement('div');
            header.className = "text-center pb-2 border-b border-white/10 mb-3 bg-slate-900/40 py-2 rounded-xl shadow-sm";
            header.innerHTML = `<span class="text-[10px] font-black uppercase text-brand-gold tracking-widest">${title}</span>`;
            colWrapper.appendChild(header);

            const col = document.createElement('div');
            col.id = colId;
            col.className = "bracket-column flex-grow flex flex-col justify-around relative";
            buildContentFn(col);
            colWrapper.appendChild(col);

            return colWrapper;
        };

        // Render Columns
        // Column 1: Son 32
        const colR32 = createColumn('bracket-column-r32', 'Son 32', 16, (col) => {
            for (let i = 0; i < R32_ORDER.length; i += 2) {
                const id1 = R32_ORDER[i];
                const id2 = R32_ORDER[i+1];
                const m1 = { id: id1, ...R32_MATCHES_MAP[id1] };
                const m2 = { id: id2, ...R32_MATCHES_MAP[id2] };
                
                const pair = document.createElement('div');
                const winner1 = this.bracket.r32[id1];
                const winner2 = this.bracket.r32[id2];
                const hasWinnersClass = (winner1 && winner2) ? 'has-winners' : '';
                pair.className = `bracket-match-pair ${hasWinnersClass}`;
                
                pair.innerHTML = this.createMatchCardHtml(m1, 'r32') + this.createMatchCardHtml(m2, 'r32');
                col.appendChild(pair);
            }
        });
        list.appendChild(colR32);

        // Column 2: Son 16
        const colR16 = createColumn('bracket-column-r16', 'Son 16', 8, (col) => {
            for (let i = 0; i < R16_ORDER.length; i += 2) {
                const id1 = R16_ORDER[i];
                const id2 = R16_ORDER[i+1];
                const m1 = { id: id1, ...R16_MATCHES_MAP[id1] };
                const m2 = { id: id2, ...R16_MATCHES_MAP[id2] };
                
                const pair = document.createElement('div');
                const winner1 = this.bracket.r16[id1];
                const winner2 = this.bracket.r16[id2];
                const hasWinnersClass = (winner1 && winner2) ? 'has-winners' : '';
                pair.className = `bracket-match-pair ${hasWinnersClass}`;
                
                pair.innerHTML = this.createMatchCardHtml(m1, 'r16') + this.createMatchCardHtml(m2, 'r16');
                col.appendChild(pair);
            }
        });
        list.appendChild(colR16);

        // Column 3: Çeyrek F.
        const colQF = createColumn('bracket-column-qf', 'Çeyrek Final', 4, (col) => {
            for (let i = 0; i < QF_ORDER.length; i += 2) {
                const id1 = QF_ORDER[i];
                const id2 = QF_ORDER[i+1];
                const m1 = { id: id1, ...QF_MATCHES_MAP[id1] };
                const m2 = { id: id2, ...QF_MATCHES_MAP[id2] };
                
                const pair = document.createElement('div');
                const winner1 = this.bracket.qf[id1];
                const winner2 = this.bracket.qf[id2];
                const hasWinnersClass = (winner1 && winner2) ? 'has-winners' : '';
                pair.className = `bracket-match-pair ${hasWinnersClass}`;
                
                pair.innerHTML = this.createMatchCardHtml(m1, 'qf') + this.createMatchCardHtml(m2, 'qf');
                col.appendChild(pair);
            }
        });
        list.appendChild(colQF);

        // Column 4: Yarı F.
        const colSF = createColumn('bracket-column-sf', 'Yarı Final', 2, (col) => {
            const id1 = SF_ORDER[0];
            const id2 = SF_ORDER[1];
            const m1 = { id: id1, ...SF_MATCHES_MAP[id1] };
            const m2 = { id: id2, ...SF_MATCHES_MAP[id2] };
            
            const pair = document.createElement('div');
            const winner1 = this.bracket.sf[id1];
            const winner2 = this.bracket.sf[id2];
            const hasWinnersClass = (winner1 && winner2) ? 'has-winners' : '';
            pair.className = `bracket-match-pair ${hasWinnersClass}`;
            
            pair.innerHTML = this.createMatchCardHtml(m1, 'sf') + this.createMatchCardHtml(m2, 'sf');
            col.appendChild(pair);
        });
        list.appendChild(colSF);

        // Column 5: Final
        const colFinal = createColumn('bracket-column-final', 'Final', 1, (col) => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = "flex justify-center items-center h-full";
            cardWrapper.innerHTML = this.createMatchCardHtml(FINAL_MATCH, 'final');
            col.appendChild(cardWrapper);
        });
        list.appendChild(colFinal);

        // Column 6: Şampiyon
        const colChampion = createColumn('bracket-column-champion', 'Şampiyon', 1, (col) => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = "flex justify-center items-center h-full";
            
            const championName = this.bracket.final['match-final-1'];
            if (championName) {
                const info = this.teamInfo[championName] || { code: 'N/A', flag: '' };
                cardWrapper.innerHTML = `
                    <div class="champion-reveal-card bg-gradient-to-tr from-brand-gold/25 via-yellow-600/10 to-transparent border-2 border-brand-gold rounded-[2rem] p-6 text-center shadow-neon-gold relative overflow-hidden w-[180px] h-[220px] flex flex-col justify-center items-center">
                        <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 bg-brand-gold/20 blur-[15px] pointer-events-none"></div>
                        <i data-lucide="trophy" class="w-10 h-10 text-brand-gold mx-auto mb-2 animate-bounce"></i>
                        <h4 class="text-[9px] font-outfit font-black text-brand-gold uppercase tracking-widest leading-none mb-2">DÜNYA ŞAMPİYONU 👑</h4>
                        <img src="${info.flag}" class="w-12 h-8 waving-flag shadow-lg border border-white/10 mb-2" alt="">
                        <span class="text-xs font-outfit font-black text-white uppercase tracking-tight truncate max-w-[150px]">${championName}</span>
                        <span class="text-[8px] font-black text-brand-gold bg-black/40 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">${info.code}</span>
                    </div>
                `;
            } else {
                cardWrapper.innerHTML = `
                    <div class="champion-reveal-card border border-dashed border-white/10 rounded-[2rem] p-6 text-center bg-slate-900/20 w-[180px] h-[220px] flex flex-col justify-center items-center gap-2">
                        <i data-lucide="trophy" class="w-8 h-8 text-slate-700"></i>
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-normal">Şampiyon Bekleniyor</span>
                    </div>
                `;
            }
            col.appendChild(cardWrapper);
        });
        list.appendChild(colChampion);

        // Bind Click Handlers for all rows
        list.querySelectorAll('.bracket-team-row').forEach(row => {
            row.addEventListener('click', () => {
                const matchId = row.dataset.match;
                const rKey = row.dataset.round;
                const teamName = row.dataset.team;

                if (!teamName) return; // ignore TBD
                this.selectBracketWinner(rKey, matchId, teamName);
            });
        });

        // Restore scroll positions
        list.scrollLeft = savedScrollLeft;
        list.scrollTop = savedScrollTop;
    }

    selectBracketWinner(roundKey, matchId, teamName) {
        const oldWinner = this.bracket[roundKey] ? this.bracket[roundKey][matchId] : null;
        
        if (!this.bracket[roundKey]) this.bracket[roundKey] = {};
        this.bracket[roundKey][matchId] = teamName;

        // If winner changed, clear downstream matches containing the oldWinner
        if (oldWinner && oldWinner !== teamName) {
            this.clearDownstreamWinner(oldWinner, roundKey);
        }

        this.renderBracketMatchups();
        if (window.lucide) window.lucide.createIcons();
    }

    clearDownstreamWinner(teamName, roundKey) {
        const roundOrder = ['r32', 'r16', 'qf', 'sf', 'final'];
        const startIdx = roundOrder.indexOf(roundKey) + 1;
        
        for (let i = startIdx; i < roundOrder.length; i++) {
            const r = roundOrder[i];
            if (this.bracket[r]) {
                Object.keys(this.bracket[r]).forEach(mId => {
                    if (this.bracket[r][mId] === teamName) {
                        delete this.bracket[r][mId];
                    }
                });
            }
        }
    }

    // --- STEP 4: SAVE PREDICTIONS ---
    async saveAllPredictions() {
        const userId = this.appState.activeUser.id;
        
        // Validation: Ensure all 12 groups are ranked, 8 thirds are selected, and bracket matches are predicted
        let isGroupsOk = true;
        this.groupLetters.forEach(g => {
            if (!this.groupTeams[g] || this.groupTeams[g].length !== 4) isGroupsOk = false;
        });

        if (!isGroupsOk) {
            alert("Lütfen tüm 12 grubun sıralamalarını tahmin ediniz!");
            return;
        }

        if (this.selectedThirds.size !== 8) {
            alert("Lütfen en iyi üçüncüler aşamasından tam olarak 8 adet takım seçiniz!");
            return;
        }

        // Bracket check: check if final winner is selected
        const finalWinner = this.bracket.final['match-final-1'];
        if (!finalWinner) {
            alert("Lütfen tüm eleme eşleşmelerini tahmin edip şampiyonu seçiniz!");
            return;
        }

        // Prepare bracket predictions data structure
        const bracketPred = {
            r32: this.bracket.r32,
            r16: this.bracket.r16,
            qf: this.bracket.qf,
            sf: this.bracket.sf,
            final: this.bracket.final,
            selectedThirds: Array.from(this.selectedThirds)
        };

        const btnSave = document.getElementById('btn-save-all-predictions');
        btnSave.disabled = true;
        btnSave.innerHTML = `<span class="w-4 h-4 border-2 border-t-black border-white/20 rounded-full animate-spin inline-block mr-2 align-middle"></span> Kaydediliyor...`;

        try {
            // Save both group standings predictions and bracket matchups predictions
            await saveGroupPredictions(userId, this.groupTeams);
            await saveBracketPredictions(userId, bracketPred);
            
            alert("Tüm turnuva tahminleriniz başarıyla kaydedildi! Puan durumunuz yeniden hesaplandı. 🏆");
            
            // Navigate back to fixtures list
            this.appState.navigateToScreen('matches');
        } catch (e) {
            console.error(e);
            alert("Tahminler kaydedilirken bir hata oluştu!");
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = 'Turnuva Tahminlerini Kaydet 💾';
        }
    }
}
