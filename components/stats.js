// Tournament Stats Component (renders API loaded lists of top scorers, assists, group standings and fixtures)
import { getApiStats, getMatches, getPlayers } from '../firebase-db.js';

export class Stats {
    constructor(containerId, appState) {
        this.container = document.getElementById(containerId);
        this.appState = appState;
        this.activeTab = 'standings'; // goals, assists, standings, fixtures
    }

    async render() {
        this.container.innerHTML = '';
        const stats = await getApiStats();
        let dbPlayers = [];
        try {
            dbPlayers = await getPlayers();
        } catch (err) {
            console.error("Failed to load players for stats mapping:", err);
        }

        // Update stats screen subtitle dynamically
        const subtitleEl = document.getElementById('stats-subtitle');
        if (subtitleEl) {
            if (this.activeTab === 'goals') {
                subtitleEl.textContent = 'En çok gol atan oyuncular ve performans reytingleri';
            } else if (this.activeTab === 'assists') {
                subtitleEl.textContent = 'En çok asist yapan oyuncular ve performans reytingleri';
            } else if (this.activeTab === 'standings') {
                subtitleEl.textContent = 'Grup puan durumları ve takım sıralamaları';
            } else if (this.activeTab === 'fixtures') {
                subtitleEl.textContent = 'Dünya Kupası tüm maç fikstürü ve sonuçları';
            }
        }

        // 1. Horizontal Tab Switcher (Fits 4 tabs beautifully)
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'flex bg-slate-950/60 border border-white/5 rounded-xl p-1 mb-5 text-[9px] uppercase font-bold gap-0.5';

        const addTab = (id, label, icon) => {
            const btn = document.createElement('button');
            const isActive = this.activeTab === id;
            btn.className = `flex-1 py-2 px-1 rounded-lg text-[9px] font-bold font-outfit uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                isActive ? 'bg-brand-blue text-white font-black shadow-lg shadow-blue-950/50' : 'text-slate-400 hover:text-white'
            }`;
            btn.innerHTML = `<i data-lucide="${icon}" class="w-3 h-3"></i> ${label}`;
            
            btn.addEventListener('click', () => {
                this.activeTab = id;
                this.render();
            });

            tabsContainer.appendChild(btn);
        };

        addTab('goals', 'Gol', 'dribbble');
        addTab('assists', 'Asist', 'sparkles');
        addTab('standings', 'Grup', 'table');
        addTab('fixtures', 'Fikstür', 'calendar');
        
        this.container.appendChild(tabsContainer);

        // 2. Dynamic Content Renderer based on active tab
        if (this.activeTab === 'goals' || this.activeTab === 'assists') {
            const listContainer = document.createElement('div');
            listContainer.className = 'flex flex-col gap-2.5';

            const activeList = this.activeTab === 'goals' ? stats.topScorers : stats.topAssists;
            const metricName = this.activeTab === 'goals' ? 'Gol' : 'Asist';
            const metricIcon = this.activeTab === 'goals' ? '⚽' : '🎯';

            if (!activeList || activeList.length === 0) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'w-full flex flex-col items-center justify-center p-8 text-center glassmorphism rounded-[2rem] border border-white/10 shadow-2xl mt-4 relative overflow-hidden';
                emptyEl.innerHTML = `
                    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-blue/20 blur-[50px] pointer-events-none"></div>
                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                        <i data-lucide="bar-chart-2" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-sm font-outfit font-black text-white uppercase tracking-wider mb-1">İstatistik Bulunamadı</h3>
                    <p class="text-[10px] text-slate-400 max-w-[240px] leading-relaxed font-medium">
                        Turnuva henüz başlamadığı veya API verileri çekilmediği için istatistik verisi bulunmamaktadır.
                    </p>
                `;
                listContainer.appendChild(emptyEl);
            } else {
                activeList.forEach((player, index) => {
                    const item = document.createElement('div');
                    item.className = 'flex items-center justify-between p-3.5 rounded-2xl glassmorphism hover:bg-slate-900/40 transition-all';
                    
                    const count = this.activeTab === 'goals' ? player.goals : player.assists;

                    const flagMap = {
                        "Meksika": "https://flagcdn.com/mx.svg",
                        "Güney Afrika": "https://flagcdn.com/za.svg",
                        "Güney Kore": "https://flagcdn.com/kr.svg",
                        "Çekya": "https://flagcdn.com/cz.svg",
                        "Kanada": "https://flagcdn.com/ca.svg",
                        "Bosna-Hersek": "https://flagcdn.com/ba.svg",
                        "Katar": "https://flagcdn.com/qa.svg",
                        "İsviçre": "https://flagcdn.com/ch.svg",
                        "Brezilya": "https://flagcdn.com/br.svg",
                        "Fas": "https://flagcdn.com/ma.svg",
                        "Haiti": "https://flagcdn.com/ht.svg",
                        "İskoçya": "https://flagcdn.com/gb-sct.svg",
                        "ABD": "https://flagcdn.com/us.svg",
                        "Paraguay": "https://flagcdn.com/py.svg",
                        "Avustralya": "https://flagcdn.com/au.svg",
                        "Türkiye": "https://flagcdn.com/tr.svg",
                        "Almanya": "https://flagcdn.com/de.svg",
                        "Curaçao": "https://flagcdn.com/cw.svg",
                        "Fildişi Sahili": "https://flagcdn.com/ci.svg",
                        "Ekvador": "https://flagcdn.com/ec.svg",
                        "Hollanda": "https://flagcdn.com/nl.svg",
                        "Japonya": "https://flagcdn.com/jp.svg",
                        "İsveç": "https://flagcdn.com/se.svg",
                        "Tunus": "https://flagcdn.com/tn.svg",
                        "Belçika": "https://flagcdn.com/be.svg",
                        "Mısır": "https://flagcdn.com/eg.svg",
                        "İran": "https://flagcdn.com/ir.svg",
                        "Yeni Zelanda": "https://flagcdn.com/nz.svg",
                        "İspanya": "https://flagcdn.com/es.svg",
                        "Yeşil Burun Adaları": "https://flagcdn.com/cv.svg",
                        "Suudi Arabistan": "https://flagcdn.com/sa.svg",
                        "Uruguay": "https://flagcdn.com/uy.svg",
                        "Fransa": "https://flagcdn.com/fr.svg",
                        "Senegal": "https://flagcdn.com/sn.svg",
                        "Irak": "https://flagcdn.com/iq.svg",
                        "Norveç": "https://flagcdn.com/no.svg",
                        "Arjantin": "https://flagcdn.com/ar.svg",
                        "Cezayir": "https://flagcdn.com/dz.svg",
                        "Avusturya": "https://flagcdn.com/at.svg",
                        "Ürdün": "https://flagcdn.com/jo.svg",
                        "Portekiz": "https://flagcdn.com/pt.svg",
                        "Dem. Kongo": "https://flagcdn.com/cd.svg",
                        "Özbekistan": "https://flagcdn.com/uz.svg",
                        "Kolombiya": "https://flagcdn.com/co.svg",
                        "İngiltere": "https://flagcdn.com/gb-eng.svg",
                        "Hırvatistan": "https://flagcdn.com/hr.svg",
                        "Gana": "https://flagcdn.com/gh.svg",
                        "Panama": "https://flagcdn.com/pa.svg"
                    };
                    const flagUrl = flagMap[player.team] || "https://flagcdn.com/un.svg";

                    // Match player with DB ratings dynamically
                    const normalizeName = (name) => {
                        return name.toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/ı/g, 'i')
                            .replace(/ş/g, 's')
                            .replace(/ğ/g, 'g')
                            .replace(/ç/g, 'c')
                            .replace(/ü/g, 'u')
                            .replace(/ö/g, 'o')
                            .trim();
                    };
                    const searchName = normalizeName(player.name);
                    const dbPlayer = dbPlayers.find(p => normalizeName(p.name) === searchName);

                    let ratingDisplay = '0.0';
                    if (dbPlayer && dbPlayer.rating !== undefined) {
                        const rawRating = parseFloat(dbPlayer.rating);
                        if (!isNaN(rawRating)) {
                            ratingDisplay = (rawRating > 10 ? rawRating / 10 : rawRating).toFixed(1);
                        }
                    } else if (player && player.rating !== undefined) {
                        const rawRating = parseFloat(player.rating);
                        if (!isNaN(rawRating)) {
                            ratingDisplay = rawRating.toFixed(1);
                        }
                    }

                    item.innerHTML = `
                        <div class="flex items-center gap-3.5">
                            <div class="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 font-outfit">
                                ${index + 1}
                            </div>

                            <div class="flex flex-col">
                                <span class="text-xs font-semibold text-slate-200">${player.name}</span>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                    <img src="${flagUrl}" alt="${player.team}" class="w-3.5 h-2.5 object-cover rounded-sm">
                                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">${player.team}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-4">
                            <div class="text-right">
                                <div class="flex items-center gap-1 justify-end">
                                    <span class="text-sm font-outfit font-black text-white">${count}</span>
                                    <span class="text-xs">${metricIcon}</span>
                                </div>
                                <p class="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.2">${metricName}</p>
                            </div>

                            <div class="border-l border-white/5 pl-4 py-1 text-center min-w-[45px]">
                                <span class="text-xs font-outfit font-black text-brand-cyan">${ratingDisplay}</span>
                                <p class="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Reyting</p>
                            </div>
                        </div>
                    `;

                    listContainer.appendChild(item);
                });
            }

            this.container.appendChild(listContainer);
        }
        
        else if (this.activeTab === 'standings') {
            const matches = await getMatches();
            
            const groups = {};
            const teamFlags = {};
            
            const isKnockoutStage = (groupName) => {
                return ['Son 32', 'Son 16', 'Çeyrek Final', 'Yarı Final', 'Üçüncülük', 'Final'].includes(groupName);
            };

            matches.forEach(m => {
                if (m.group) {
                    if (!groups[m.group]) groups[m.group] = [];
                    if (!groups[m.group].includes(m.homeTeam)) {
                        groups[m.group].push(m.homeTeam);
                        teamFlags[m.homeTeam] = m.homeFlag;
                    }
                    if (!groups[m.group].includes(m.awayTeam)) {
                        groups[m.group].push(m.awayTeam);
                        teamFlags[m.awayTeam] = m.awayFlag;
                    }
                }
            });

            const standings = {};

            // Initialize standings ONLY for group stage groups
            Object.keys(groups).forEach(gName => {
                if (!isKnockoutStage(gName)) {
                    groups[gName].forEach(team => {
                        standings[team] = {
                            team: team,
                            group: gName,
                            played: 0,
                            won: 0,
                            drawn: 0,
                            lost: 0,
                            gf: 0,
                            ga: 0,
                            gd: 0,
                            points: 0
                        };
                    });
                }
            });

            // Calculate standings from matches ONLY for group stage matches
            matches.forEach(m => {
                if (m.status === 'FINISHED' && m.group && !isKnockoutStage(m.group)) {
                    const home = m.homeTeam;
                    const away = m.awayTeam;
                    const hs = parseInt(m.homeScore) || 0;
                    const as = parseInt(m.awayScore) || 0;

                    if (standings[home] && standings[away]) {
                        standings[home].played++;
                        standings[away].played++;
                        standings[home].gf += hs;
                        standings[home].ga += as;
                        standings[away].gf += as;
                        standings[away].ga += hs;

                        if (hs > as) {
                            standings[home].won++;
                            standings[home].points += 3;
                            standings[away].lost++;
                        } else if (hs < as) {
                            standings[away].won++;
                            standings[away].points += 3;
                            standings[home].lost++;
                        } else {
                            standings[home].drawn++;
                            standings[home].points += 1;
                            standings[away].drawn++;
                            standings[away].points += 1;
                        }
                        standings[home].gd = standings[home].gf - standings[home].ga;
                        standings[away].gd = standings[away].gf - standings[away].ga;
                    }
                }
            });

            // Render each Group Standing table or Knockout Stage teams list
            const standingsGrid = document.createElement('div');
            standingsGrid.className = 'flex flex-col gap-6 pr-1 pb-10';

            Object.keys(groups).forEach(gName => {
                if (isKnockoutStage(gName)) {
                    const groupTeams = groups[gName];

                    const groupCard = document.createElement('div');
                    groupCard.className = 'shrink-0 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/5 rounded-3xl p-4 flex flex-col gap-3 relative overflow-hidden';
                    groupCard.innerHTML = `
                        <div class="absolute -top-12 left-0 w-24 h-24 bg-brand-cyan/5 blur-xl pointer-events-none"></div>
                        <div class="flex justify-between items-center border-b border-slate-300 dark:border-white/5 pb-2">
                            <span class="text-xs font-outfit font-black text-brand-gold tracking-widest uppercase">${gName}</span>
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-wider">World Cup 2026</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-800 dark:text-slate-300">
                            ${groupTeams.map(teamName => {
                                return `
                                    <div class="flex items-center gap-2 p-2 bg-slate-200/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                                        <img src="${teamFlags[teamName] || 'https://flagcdn.com/un.svg'}" alt="${teamName}" style="width:16px;height:12px;object-fit:cover;border-radius:2px;border:1px solid rgba(255,255,255,0.1);" class="shrink-0">
                                        <span class="text-slate-800 dark:text-slate-200 truncate font-bold">${teamName}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                    standingsGrid.appendChild(groupCard);
                } else {
                    const groupTeams = groups[gName].map(t => standings[t] || { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
                    // Sort by points desc, then gd desc, then gf desc
                    groupTeams.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

                    const groupCard = document.createElement('div');
                    groupCard.className = 'shrink-0 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-300 dark:border-white/5 rounded-3xl p-4 flex flex-col gap-3 relative overflow-hidden';
                    groupCard.innerHTML = `
                        <div class="absolute -top-12 left-0 w-24 h-24 bg-brand-cyan/5 blur-xl pointer-events-none"></div>
                        <div class="flex justify-between items-center border-b border-slate-300 dark:border-white/5 pb-2">
                            <span class="text-xs font-outfit font-black text-brand-gold tracking-widest uppercase">Grup ${gName} Puan Durumu</span>
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-wider">World Cup 2026</span>
                        </div>
                        <table class="w-full text-left text-[10px] font-semibold text-slate-800 dark:text-slate-300">
                            <thead>
                                <tr class="text-slate-500 uppercase tracking-wider text-[8px] border-b border-slate-200 dark:border-white/5">
                                    <th class="py-1.5 w-6">#</th>
                                    <th class="py-1.5">Takım</th>
                                    <th class="py-1.5 text-center w-6">O</th>
                                    <th class="py-1.5 text-center w-6">G</th>
                                    <th class="py-1.5 text-center w-6">B</th>
                                    <th class="py-1.5 text-center w-6">M</th>
                                    <th class="py-1.5 text-center w-6">Av</th>
                                    <th class="py-1.5 text-center w-8 text-slate-800 dark:text-white">P</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${groupTeams.map((t, idx) => {
                                    const isQualifying = idx < 2;
                                    const rowColorClass = isQualifying ? 'bg-brand-green/[0.05] dark:bg-brand-green/[0.02]' : '';
                                    const numColorClass = idx === 0 ? 'text-brand-gold' : (idx === 1 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500');
                                    const gdColor = t.gd > 0 ? 'text-green-600 dark:text-green-400' : (t.gd < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400');
                                    const gdText = t.gd > 0 ? '+' + t.gd : String(t.gd);
                                    const ptColor = isQualifying ? 'text-green-600 dark:text-green-400 font-extrabold' : 'text-slate-800 dark:text-white';
                                    return `
                                        <tr class="border-b border-slate-200 dark:border-white/[0.02] hover:bg-slate-200/50 dark:hover:bg-white/[0.02] ${rowColorClass}">
                                            <td class="py-2 font-bold ${numColorClass}">${idx + 1}</td>
                                            <td class="py-2">
                                                <div style="display:flex;align-items:center;gap:6px;">
                                                    <img src="${teamFlags[t.team] || 'https://flagcdn.com/un.svg'}" alt="${t.team}" style="width:14px;height:10px;object-fit:cover;border-radius:2px;border:1px solid rgba(255,255,255,0.1);">
                                                    <span class="text-slate-800 dark:text-slate-200" style="font-weight:700;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.team}</span>
                                                </div>
                                            </td>
                                            <td class="py-2 text-center font-medium">${t.played}</td>
                                            <td class="py-2 text-center font-medium text-slate-500">${t.won}</td>
                                            <td class="py-2 text-center font-medium text-slate-500">${t.drawn}</td>
                                            <td class="py-2 text-center font-medium text-slate-500">${t.lost}</td>
                                            <td class="py-2 text-center font-bold ${gdColor}">${gdText}</td>
                                            <td class="py-2 text-center font-black ${ptColor}">${t.points}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    `;
                    standingsGrid.appendChild(groupCard);
                }
            });

            this.container.appendChild(standingsGrid);
        }

        else if (this.activeTab === 'fixtures') {
            const matches = await getMatches();
            
            // Group matches by date!
            const matchesByDate = {};
            matches.forEach(m => {
                const dateObj = new Date(m.date);
                const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
                if (!matchesByDate[dateStr]) {
                    matchesByDate[dateStr] = [];
                }
                matchesByDate[dateStr].push(m);
            });

            const fixturesScroll = document.createElement('div');
            fixturesScroll.className = 'flex flex-col gap-5 pr-1 pb-10';

            Object.keys(matchesByDate).forEach(dateStr => {
                const dateGroup = document.createElement('div');
                dateGroup.className = 'flex flex-col gap-2.5';
                
                const titleSpan = document.createElement('span');
                titleSpan.className = 'text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1';
                titleSpan.textContent = dateStr;
                dateGroup.appendChild(titleSpan);

                const listDiv = document.createElement('div');
                listDiv.className = 'flex flex-col gap-2';
                
                matchesByDate[dateStr].forEach(m => {
                    const matchCard = document.createElement('div');
                    const isFinished = m.status === 'FINISHED';
                    const isLive = m.status === 'LIVE';
                    const timeStr = new Date(m.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    
                    matchCard.className = 'w-full bg-slate-950/40 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between transition-all hover:bg-slate-900/40 relative overflow-hidden cursor-pointer hover:border-brand-blue/30 active:scale-[0.98] duration-200';
                    
                    matchCard.innerHTML = `
                        <!-- Home team -->
                        <div class="flex items-center gap-2 flex-1 min-w-0">
                            <img src="${m.homeFlag}" alt="${m.homeTeam}" class="w-4 h-3 object-cover rounded-sm border border-white/10 shrink-0">
                            <span class="text-xs font-bold text-slate-200 truncate">${m.homeTeam}</span>
                        </div>

                        <!-- Time / Score -->
                        <div class="flex flex-col items-center justify-center min-w-[70px] text-center px-1">
                            ${isFinished || isLive ? `
                                <span class="text-xs font-outfit font-black ${isLive ? 'text-red-400 animate-pulse' : 'text-brand-cyan'}">${m.homeScore} : ${m.awayScore}</span>
                                ${m.penaltyHomeScore !== undefined && m.penaltyAwayScore !== undefined ? `
                                    <span class="text-[8px] font-bold text-slate-400 mt-0.5">(pen. ${m.penaltyHomeScore}:${m.penaltyAwayScore})</span>
                                ` : ''}
                                <span class="text-[7px] font-bold ${isLive ? 'text-red-400 animate-pulse' : 'text-slate-500'} tracking-wider mt-0.5">${isLive ? 'CANLI' : 'BİTTİ'}</span>
                            ` : `
                                <span class="text-xs font-outfit font-black text-slate-300 leading-none">${timeStr}</span>
                                <span class="text-[7px] font-bold text-brand-cyan tracking-wider mt-1 uppercase">${m.group ? m.group + ' GRUBU' : 'Grup Aşaması'}</span>
                            `}
                        </div>

                        <!-- Away team -->
                        <div class="flex items-center gap-2 flex-1 justify-end min-w-0 text-right">
                            <span class="text-xs font-bold text-slate-200 truncate text-right">${m.awayTeam}</span>
                            <img src="${m.awayFlag}" alt="${m.awayTeam}" class="w-4 h-3 object-cover rounded-sm border border-white/10 shrink-0">
                        </div>
                    `;

                    matchCard.addEventListener('click', () => {
                        const mIdx = matches.indexOf(m);
                        // Open match detail popup directly on current screen (both finished and unplayed)
                        this.appState.fixtureCardComp.openMatchDetail(m, mIdx);
                    });

                    listDiv.appendChild(matchCard);
                });
                
                dateGroup.appendChild(listDiv);
                fixturesScroll.appendChild(dateGroup);
            });

            this.container.appendChild(fixturesScroll);
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}
