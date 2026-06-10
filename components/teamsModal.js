import { TEAMS_DATA } from './teamsData.js';
import { getPlayers, getMatches } from '../firebase-db.js';

export class TeamsModal {
    constructor(containerId, appState) {
        this.container = document.getElementById(containerId);
        this.appState = appState;
        this.activeTeam = null; // Key like "Turkey", "Argentina", or null for main list
    }

    open(pushState = true) {
        this.activeTeam = null;
        this.container.classList.add('active');
        this.render();
        if (pushState) {
            window.history.pushState({ screen: this.appState.activeScreen, modal: 'teams', team: null }, '');
        }
    }

    close() {
        this.container.classList.remove('active');
    }

    async render() {
        this.container.innerHTML = '';

        if (this.activeTeam === null) {
            this.renderTeamsList();
        } else {
            await this.renderTeamDetails(this.activeTeam);
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderTeamsList() {
        // Sort teams: Turkey is always 100 strength so it will be first. The rest are sorted by strength descending.
        const allTeams = Object.entries(TEAMS_DATA)
            .map(([key, value]) => ({ key, ...value }))
            .sort((a, b) => b.strength - a.strength);

        // Deduplicate by nameTr to avoid showing duplicate entries in case of overlapping data keys
        const seenNames = new Set();
        const sortedTeams = [];
        for (const t of allTeams) {
            if (!seenNames.has(t.nameTr)) {
                seenNames.add(t.nameTr);
                sortedTeams.push(t);
            }
        }

        // Separate Turkey from the rest for special layout or styling
        const turkeyTeam = sortedTeams.find(t => t.key === 'Turkey');
        const otherTeams = sortedTeams.filter(t => t.key !== 'Turkey');

        this.container.innerHTML = `
            <!-- Sticky Header -->
            <div class="fantasy-header-section shrink-0 border-b border-white/5">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest flex items-center gap-1.5">
                        <i data-lucide="globe" class="w-4 h-4 text-brand-cyan animate-pulse"></i>
                        TAKIMLAR • DÜNYA KUPASI
                    </span>
                    <button id="close-teams-btn" class="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/15 transition-colors cursor-pointer text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                    Turnuvada yarışan 48 ülkenin detayları, kadroları ve maç programları
                </p>
            </div>

            <!-- Scrollable Body -->
            <div class="flex-grow p-4 overflow-y-auto pb-12 space-y-5">
                <!-- Turkey (Bizim Çocuklar) Special Section -->
                ${turkeyTeam ? `
                <div class="flex flex-col gap-2">
                    <span class="text-[8px] font-black text-brand-red uppercase tracking-widest pl-1">Bizim Çocuklar 🇹🇷</span>
                    <button class="team-card-special relative w-full p-4 rounded-2xl bg-gradient-to-r from-red-950/80 to-red-900/60 border border-brand-red/40 hover:border-brand-red/60 transition-all flex items-center justify-between text-left overflow-hidden group shadow-lg shadow-red-950/20 cursor-pointer" data-team="${turkeyTeam.key}">
                        <!-- Subtle moving flag backdrop -->
                        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-no-repeat bg-right bg-contain opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" style="background-image: url('${turkeyTeam.flag}');"></div>
                        
                        <div class="flex items-center gap-4 z-10">
                            <img src="${turkeyTeam.flag}" class="w-16 h-11 object-cover rounded-lg border border-white/10 shadow-md">
                            <div class="flex flex-col">
                                <span class="text-sm font-outfit font-black text-white tracking-wide uppercase">${turkeyTeam.nameTr}</span>
                                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Bizim Çocuklar • Milli Takım Detayları</span>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all z-10"></i>
                    </button>
                </div>
                ` : ''}

                <!-- Other Countries Section -->
                <div class="flex flex-col gap-2.5">
                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Dünya Takımları</span>
                    <div class="grid grid-cols-2 gap-4">
                        ${otherTeams.map(t => {
                            return `
                                <button class="team-card-btn flex flex-col items-center text-center gap-2 group cursor-pointer focus:outline-none" data-team="${t.key}">
                                    <div class="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-md">
                                        <img src="${t.flag}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="">
                                    </div>
                                    <span class="text-[10px] font-bold text-slate-300 group-hover:text-brand-cyan uppercase tracking-wide leading-tight">${t.nameTr}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        this.attachListListeners();
    }

    async renderTeamDetails(teamKey) {
        const details = TEAMS_DATA[teamKey];
        if (!details) {
            this.activeTeam = null;
            this.renderTeamsList();
            return;
        }

        // Fetch Squad
        const players = await getPlayers(details.nameTr);
        // Sort players: GK (KL), DEF, MID (ORT), FW (FOR)
        const posOrder = { "KL": 1, "DEF": 2, "ORT": 3, "FOR": 4 };
        players.sort((a, b) => (posOrder[a.pos] || 9) - (posOrder[b.pos] || 9));

        // Fetch Matches
        const allMatches = await getMatches();
        const teamMatches = allMatches.filter(m => 
            m.homeTeam.toLowerCase().trim() === details.nameTr.toLowerCase().trim() || 
            m.awayTeam.toLowerCase().trim() === details.nameTr.toLowerCase().trim()
        );
        // Sort matches chronologically
        teamMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        this.container.innerHTML = `
            <!-- Sticky Header -->
            <div class="fantasy-header-section shrink-0 border-b border-white/5 relative overflow-hidden">
                <!-- Waving subtle background flag -->
                <div class="absolute inset-0 opacity-[0.07] pointer-events-none" style="background: url('${details.flag}') no-repeat center center / cover; transform: scale(1.05); filter: blur(1px); animation: flagWave 6s ease-in-out infinite;"></div>
                
                <div class="flex justify-between items-center relative z-10">
                    <button id="btn-teams-back" class="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/15 transition-colors cursor-pointer text-slate-400 hover:text-white">
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    </button>
                    <span class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest flex items-center gap-1.5">
                        ${details.nameTr} DETAYI
                    </span>
                    <button id="close-teams-btn" class="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/15 transition-colors cursor-pointer text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-grow p-4 overflow-y-auto pb-16 relative space-y-5">
                <!-- Inline style for custom waving animation -->
                <style>
                    @keyframes flagWave {
                        0% { transform: scale(1.08) translate(0, 0); }
                        50% { transform: scale(1.08) translate(-1%, 1.5%); }
                        100% { transform: scale(1.08) translate(0, 0); }
                    }
                </style>

                <!-- SECTION 1: Country Info & History Card -->
                <div class="relative bg-slate-900/40 border border-white/5 p-4 rounded-2xl overflow-hidden flex flex-col gap-4">
                    <!-- Subtle background flag mask -->
                    <div class="absolute inset-0 opacity-[0.06] pointer-events-none" style="background: url('${details.flag}') no-repeat center center / cover;"></div>
                    
                    <div class="flex items-center gap-4 relative z-10">
                        <img src="${details.flag}" class="w-16 h-11 object-cover rounded-lg border border-white/10 shadow-lg" alt="">
                        <div>
                            <h2 class="text-base font-outfit font-black text-white tracking-wide uppercase">${details.nameTr}</h2>
                            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Milli Takım Bilgileri</p>
                        </div>
                    </div>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-3 gap-2 relative z-10 text-center items-stretch">
                        <div class="bg-black/30 border border-white/5 p-2 rounded-xl flex flex-col justify-center">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Nüfus</span>
                            <span class="text-[10px] font-black text-slate-200 mt-0.5 block">${details.population}</span>
                        </div>
                        <div class="bg-black/30 border border-white/5 p-2 rounded-xl flex flex-col justify-center">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">FIFA Katılımı</span>
                            <span class="text-[10px] font-black text-slate-200 mt-0.5 block">${details.fifaJoined}</span>
                        </div>
                        <div class="bg-black/30 border border-white/5 p-2 rounded-xl flex flex-col justify-center min-w-0">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Kupa Başarısı</span>
                            <span class="text-[9px] font-black text-brand-gold mt-0.5 block leading-tight whitespace-normal break-words" title="${details.achievements}">${details.achievements}</span>
                        </div>
                    </div>

                    <!-- History Text -->
                    <div class="relative z-10 text-[10px] text-slate-400 leading-relaxed font-medium bg-black/20 p-3 rounded-xl border border-white/5">
                        <i data-lucide="info" class="w-3.5 h-3.5 text-brand-cyan shrink-0 float-left mr-2 mt-0.5"></i>
                        ${details.history}
                    </div>
                </div>

                <!-- SECTION 2: Match Fixtures -->
                <div class="flex flex-col gap-2.5">
                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Turnuva Maç Takvimi</span>
                    
                    ${teamMatches.length === 0 ? `
                        <div class="text-center py-4 text-[10px] text-slate-500 italic">Planlanmış maç bulunmuyor.</div>
                    ` : `
                        <div class="flex flex-col gap-2">
                            ${teamMatches.map(m => {
                                const isFinished = m.status === 'FINISHED';
                                const d = new Date(m.date);
                                const dateStr = `${d.getDate()} Haz ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                                return `
                                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-white/5 text-xs text-slate-300">
                                        <div class="flex flex-col">
                                            <span class="text-[8px] font-bold text-brand-cyan uppercase tracking-wider mb-0.5">${dateStr}</span>
                                            <div class="flex items-center gap-2">
                                                <img src="${m.homeFlag}" class="w-4 h-3 object-cover rounded-sm border border-white/5" alt="">
                                                <span class="font-bold ${m.homeTeam === details.nameTr ? 'text-white' : 'text-slate-400'}">${m.homeTeam}</span>
                                                <span class="text-[9px] text-slate-600 font-black">vs</span>
                                                <span class="font-bold ${m.awayTeam === details.nameTr ? 'text-white' : 'text-slate-400'}">${m.awayTeam}</span>
                                                <img src="${m.awayFlag}" class="w-4 h-3 object-cover rounded-sm border border-white/5" alt="">
                                            </div>
                                        </div>
                                        ${isFinished ? `
                                            <div class="bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-extrabold text-[10px] px-2 py-1 rounded">
                                                ${m.homeScore} - ${m.awayScore}
                                            </div>
                                        ` : `
                                            <span class="text-[8px] font-black text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-1 rounded">
                                                ${m.group.length === 1 ? 'Grup ' + m.group : m.group}
                                            </span>
                                        `}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <!-- SECTION 3: Players Squad List -->
                <div class="flex flex-col gap-2.5">
                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">26 Kişilik Kadro</span>
                    
                    ${players.length === 0 ? `
                        <div class="text-center py-4 text-[10px] text-slate-500 italic">Kadro bilgisi bulunmamaktadır.</div>
                    ` : `
                        <div class="flex flex-col gap-2">
                            ${players.map(p => `
                                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/20 hover:bg-slate-900/40 border border-white/5 transition-all text-xs text-slate-300">
                                    <div class="flex items-center gap-3">
                                        <div class="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-[9px] font-extrabold text-brand-cyan">
                                            ${p.pos}
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="font-semibold text-slate-200">${p.name}</span>
                                            <span class="text-[8px] text-slate-500 font-medium">${p.club || 'Bilinmiyor'}</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="text-center">
                                            <span class="text-[10px] font-black text-slate-300 block">${p.price}M</span>
                                            <span class="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Değer</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        this.attachDetailListeners();
    }

    attachListListeners() {
        // Close modal button
        const closeBtn = document.getElementById('close-teams-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (this.activeTeam) {
                    window.history.go(-2);
                } else {
                    window.history.back();
                }
            });
        }

        // Team card selection click
        const cards = this.container.querySelectorAll('.team-card-special, .team-card-btn');
        cards.forEach(c => {
            c.addEventListener('click', () => {
                const team = c.dataset.team;
                this.activeTeam = team;
                window.history.pushState({ screen: this.appState.activeScreen, modal: 'teams', team: team }, '');
                this.render();
            });
        });
    }

    attachDetailListeners() {
        // Back to list button
        const backBtn = document.getElementById('btn-teams-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Close modal button
        const closeBtn = document.getElementById('close-teams-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (this.activeTeam) {
                    window.history.go(-2);
                } else {
                    window.history.back();
                }
            });
        }
    }
}
