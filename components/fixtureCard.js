import { savePrediction, getPredictions, getUsers, getPlayers, syncLiveScoresFromSportDb, getLiveScoresCache, translateCommentaryToTurkish } from '../firebase-db.js';

// Helper to get real match preview details (H2H, Stadiums, Star Players) dynamically
// Helper to get real match preview details (H2H, Stadiums, Star Players) dynamically
const getMatchDetailsHelper = (homeTeam, awayTeam, group = null, allMatches = []) => {
    const details = {
        stadium: "MetLife Stadium, East Rutherford (USA)",
        homeForm: ["W", "D", "W", "L", "W"],
        awayForm: ["D", "W", "L", "W", "D"],
        homeStar: { name: "Star Player", club: "Top Club", rating: "85", pos: "ORT" },
        awayStar: { name: "Star Player", club: "Top Club", rating: "85", pos: "ORT" },
        homeWinProb: 45,
        drawProb: 25,
        awayWinProb: 30
    };
    
    const h = homeTeam.toLowerCase();
    const a = awayTeam.toLowerCase();
    
    // Assign stadium based on Group letter dynamically
    if (group) {
        const gLetter = group.trim().toUpperCase();
        const stadiumsMap = {
            "A": [
                "Estadio Azteca, Mexico City (MEX)",
                "Estadio Akron, Guadalajara (MEX)",
                "Estadio BBVA, Monterrey (MEX)"
            ],
            "B": [
                "BMO Field, Toronto (CAN)",
                "BC Place, Vancouver (CAN)",
                "Levi's Stadium, San Francisco (USA)"
            ],
            "C": [
                "MetLife Stadium, East Rutherford (USA)",
                "Gillette Stadium, Boston (USA)",
                "Lincoln Financial Field, Philadelphia (USA)"
            ],
            "D": [
                "SoFi Stadium, Los Angeles (USA)",
                "Lumen Field, Seattle (USA)",
                "BC Place, Vancouver (CAN)"
            ],
            "E": [
                "Mercedes-Benz Stadium, Atlanta (USA)",
                "Hard Rock Stadium, Miami (USA)",
                "GEHA Field at Arrowhead Stadium, Kansas City (USA)"
            ],
            "F": [
                "AT&T Stadium, Dallas (USA)",
                "NRG Stadium, Houston (USA)",
                "Mercedes-Benz Stadium, Atlanta (USA)"
            ],
            "G": [
                "SoFi Stadium, Los Angeles (USA)",
                "Lumen Field, Seattle (USA)",
                "Levi's Stadium, San Francisco (USA)"
            ],
            "H": [
                "Hard Rock Stadium, Miami (USA)",
                "Mercedes-Benz Stadium, Atlanta (USA)",
                "Gillette Stadium, Boston (USA)"
            ],
            "I": [
                "MetLife Stadium, East Rutherford (USA)",
                "Lincoln Financial Field, Philadelphia (USA)",
                "Gillette Stadium, Boston (USA)"
            ],
            "J": [
                "AT&T Stadium, Dallas (USA)",
                "NRG Stadium, Houston (USA)",
                "GEHA Field at Arrowhead Stadium, Kansas City (USA)"
            ],
            "K": [
                "SoFi Stadium, Los Angeles (USA)",
                "Levi's Stadium, San Francisco (USA)",
                "Lumen Field, Seattle (USA)"
            ],
            "L": [
                "BMO Field, Toronto (CAN)",
                "BC Place, Vancouver (CAN)",
                "MetLife Stadium, East Rutherford (USA)"
            ]
        };
        
        const groupStadiums = stadiumsMap[gLetter] || stadiumsMap["C"];
        const hash = (homeTeam.charCodeAt(0) + awayTeam.charCodeAt(0)) % groupStadiums.length;
        details.stadium = groupStadiums[hash];
    } else {
        // Fallback team-based detection if group is null
        if (h.includes("meksika") || a.includes("meksika")) {
            details.stadium = "Estadio Azteca, Mexico City (MEX)";
        } else if (h.includes("kanada") || a.includes("kanada")) {
            details.stadium = "BMO Field, Toronto (CAN)";
        } else if (h.includes("abd") || a.includes("abd")) {
            details.stadium = "Lumen Field, Seattle (USA)";
        } else if (h.includes("türkiye") || a.includes("türkiye")) {
            details.stadium = "AT&T Stadium, Dallas (USA)";
        } else if (h.includes("almanya") || a.includes("almanya")) {
            details.stadium = "Hard Rock Stadium, Miami (USA)";
        } else if (h.includes("fransa") || a.includes("fransa")) {
            details.stadium = "Mercedes-Benz Stadium, Atlanta (USA)";
        } else if (h.includes("arjantin") || a.includes("arjantin")) {
            details.stadium = "MetLife Stadium, New Jersey (USA)";
        } else if (h.includes("ingiltere") || a.includes("ingiltere")) {
            details.stadium = "Gillette Stadium, Boston (USA)";
        } else if (h.includes("ispanya") || a.includes("ispanya")) {
            details.stadium = "Levi's Stadium, San Francisco (USA)";
        } else if (h.includes("portekiz") || a.includes("portekiz")) {
            details.stadium = "Gillette Stadium, Boston (USA)";
        }
    }
    
    const playersMap = {
        "meksika": { name: "Santiago Giménez", club: "Feyenoord", rating: "84", pos: "FOR" },
        "güney afrika": { name: "Lyle Foster", club: "Burnley", rating: "77", pos: "FOR" },
        "güney kore": { name: "Son Heung-min", club: "Tottenham", rating: "87", pos: "KAN" },
        "çekya": { name: "Patrik Schick", club: "Leverkusen", rating: "82", pos: "FOR" },
        "kanada": { name: "Alphonso Davies", club: "Bayern", rating: "85", pos: "BEK" },
        "bosna-hersek": { name: "Edin Džeko", club: "Fenerbahçe", rating: "80", pos: "FOR" },
        "katar": { name: "Akram Afif", club: "Al-Sadd", rating: "78", pos: "KAN" },
        "isviçre": { name: "Granit Xhaka", club: "Leverkusen", rating: "84", pos: "ORT" },
        "brezilya": { name: "Vinícius Jr.", club: "Real Madrid", rating: "90", pos: "KAN" },
        "fas": { name: "Achraf Hakimi", club: "PSG", rating: "85", pos: "BEK" },
        "haiti": { name: "Frantzdy Pierrot", club: "AEK", rating: "72", pos: "FOR" },
        "iskoçya": { name: "Scott McTominay", club: "Napoli", rating: "80", pos: "ORT" },
        "abd": { name: "Christian Pulisic", club: "Milan", rating: "83", pos: "KAN" },
        "paraguay": { name: "Miguel Almirón", club: "Newcastle", rating: "80", pos: "KAN" },
        "avustralya": { name: "Mathew Ryan", club: "Roma", rating: "78", pos: "KL" },
        "türkiye": { name: "Arda Güler", club: "Real Madrid", rating: "85", pos: "ORT" },
        "almanya": { name: "Jamal Musiala", club: "Bayern", rating: "88", pos: "ORT" },
        "curaçao": { name: "Leandro Bacuna", club: "Groningen", rating: "70", pos: "ORT" },
        "hollanda": { name: "Xavi Simons", club: "Leipzig", rating: "85", pos: "ORT" },
        "japonya": { name: "Kaoru Mitoma", club: "Brighton", rating: "83", pos: "KAN" },
        "fildişi sahili": { name: "Sébastien Haller", club: "Leganés", rating: "80", pos: "FOR" },
        "ekvador": { name: "Moises Caicedo", club: "Chelsea", rating: "83", pos: "ORT" },
        "isveç": { name: "Viktor Gyökeres", club: "Sporting CP", rating: "87", pos: "FOR" },
        "tunus": { name: "Aïssa Laïdouni", club: "Al-Wakrah", rating: "76", pos: "ORT" },
        "ispanya": { name: "Lamine Yamal", club: "Barcelona", rating: "88", pos: "KAN" },
        "yeşil burun adaları": { name: "Garry Rodrigues", club: "Sivasspor", rating: "74", pos: "KAN" },
        "belçika": { name: "Kevin De Bruyne", club: "Man City", rating: "89", pos: "ORT" },
        "mısır": { name: "Mohamed Salah", club: "Liverpool", rating: "89", pos: "KAN" },
        "suudi arabistan": { name: "Salem Al-Dawsari", club: "Al-Hilal", rating: "78", pos: "KAN" },
        "uruguay": { name: "Federico Valverde", club: "Real Madrid", rating: "88", pos: "ORT" },
        "iran": { name: "Mehdi Taremi", club: "Inter", rating: "81", pos: "FOR" },
        "yeni zelanda": { name: "Chris Wood", club: "Nottingham", rating: "78", pos: "FOR" },
        "fransa": { name: "Kylian Mbappé", club: "Real Madrid", rating: "91", pos: "FOR" },
        "senegal": { name: "Nicolas Jackson", club: "Chelsea", rating: "82", pos: "FOR" },
        "irak": { name: "Aymen Hussein", club: "Al-Khor", rating: "75", pos: "FOR" },
        "norveç": { name: "Erling Haaland", club: "Man City", rating: "91", pos: "FOR" },
        "arjantin": { name: "Lionel Messi", club: "Inter Miami", rating: "89", pos: "ORT" },
        "cezayir": { name: "Riyad Mahrez", club: "Al-Ahli", rating: "80", pos: "KAN" },
        "avusturya": { name: "Marcel Sabitzer", club: "Dortmund", rating: "82", pos: "ORT" },
        "ürdün": { name: "Mousa Al-Tamari", club: "Montpellier", rating: "78", pos: "KAN" },
        "portekiz": { name: "Cristiano Ronaldo", club: "Al-Nassr", rating: "85", pos: "FOR" },
        "demokratik kongo": { name: "Yoane Wissa", club: "Brentford", rating: "78", pos: "KAN" },
        "ingiltere": { name: "Jude Bellingham", club: "Real Madrid", rating: "90", pos: "ORT" },
        "hırvatistan": { name: "Luka Modrić", club: "Real Madrid", rating: "83", pos: "ORT" },
        "gana": { name: "Mohammed Kudus", club: "West Ham", rating: "84", pos: "ORT" },
        "panama": { name: "Adalberto Carrasquilla", club: "Houston", rating: "74", pos: "ORT" },
        "özbekistan": { name: "Abbosbek Fayzullaev", club: "CSKA", rating: "78", pos: "ORT" },
        "kolombiya": { name: "Luis Díaz", club: "Liverpool", rating: "85", pos: "KAN" }
    };
    
    let homeKey = Object.keys(playersMap).find(k => h.includes(k)) || "türkiye";
    let awayKey = Object.keys(playersMap).find(k => a.includes(k)) || "avustralya";
    
    details.homeStar = playersMap[homeKey];
    details.awayStar = playersMap[awayKey];
    
    // Assign realistic form guides for all 48 teams and append finished World Cup matches!
    const getTeamForm = (teamName) => {
        const name = teamName.toLowerCase().trim();
        let initialForm = ["W", "D", "W", "L", "W"]; // Default fallback
        
        if (name.includes("türkiye")) initialForm = ["W", "D", "W", "W", "D"];
        else if (name.includes("brezilya")) initialForm = ["W", "D", "L", "W", "W"];
        else if (name.includes("arjantin")) initialForm = ["W", "W", "W", "D", "W"];
        else if (name.includes("fransa")) initialForm = ["W", "W", "D", "W", "W"];
        else if (name.includes("ingiltere")) initialForm = ["W", "D", "W", "L", "W"];
        else if (name.includes("almanya")) initialForm = ["W", "W", "W", "D", "W"];
        else if (name.includes("ispanya")) initialForm = ["W", "W", "W", "W", "D"];
        else if (name.includes("portekiz")) initialForm = ["W", "W", "L", "W", "W"];
        else if (name.includes("hollanda")) initialForm = ["W", "D", "W", "W", "L"];
        else if (name.includes("belçika")) initialForm = ["D", "W", "L", "W", "D"];
        else if (name.includes("uruguay")) initialForm = ["W", "D", "W", "D", "W"];
        else if (name.includes("fas")) initialForm = ["W", "W", "W", "L", "W"];
        else if (name.includes("japonya")) initialForm = ["W", "W", "W", "W", "W"];
        else if (name.includes("abd")) initialForm = ["D", "W", "L", "W", "D"];
        else if (name.includes("kanada")) initialForm = ["W", "D", "W", "L", "W"];
        else if (name.includes("meksika")) initialForm = ["W", "L", "W", "D", "W"];
        else if (name.includes("hırvatistan")) initialForm = ["D", "W", "D", "W", "L"];
        else if (name.includes("isviçre")) initialForm = ["W", "D", "W", "L", "D"];
        else if (name.includes("senegal")) initialForm = ["W", "W", "D", "W", "L"];
        else if (name.includes("güney kore")) initialForm = ["W", "W", "D", "W", "D"];
        else if (name.includes("iskoçya")) initialForm = ["L", "D", "W", "L", "D"];
        else if (name.includes("ekvador")) initialForm = ["W", "D", "W", "L", "W"];
        else if (name.includes("norveç")) initialForm = ["W", "W", "L", "W", "W"];
        else if (name.includes("cezayir")) initialForm = ["W", "W", "D", "L", "W"];
        else if (name.includes("avusturya")) initialForm = ["W", "L", "W", "W", "D"];
        else if (name.includes("suudi arabistan")) initialForm = ["L", "W", "D", "L", "W"];
        else if (name.includes("bosna-hersek") || name.includes("bosna")) initialForm = ["L", "L", "D", "L", "W"];
        else if (name.includes("çekya")) initialForm = ["W", "D", "L", "W", "D"];
        else if (name.includes("isveç")) initialForm = ["W", "W", "D", "W", "L"];
        else if (name.includes("tunus")) initialForm = ["D", "L", "W", "D", "L"];
        else if (name.includes("mısır")) initialForm = ["W", "W", "D", "W", "D"];
        else if (name.includes("iran")) initialForm = ["W", "W", "D", "W", "W"];
        else if (name.includes("yeni zelanda")) initialForm = ["L", "D", "W", "L", "W"];
        else if (name.includes("irak")) initialForm = ["W", "D", "W", "L", "W"];
        else if (name.includes("ürdün")) initialForm = ["W", "D", "L", "W", "D"];
        else if (name.includes("gana")) initialForm = ["D", "W", "L", "W", "L"];
        else if (name.includes("panama")) initialForm = ["W", "L", "W", "D", "L"];
        else if (name.includes("özbekistan")) initialForm = ["W", "W", "D", "W", "L"];
        else if (name.includes("kolombiya")) initialForm = ["W", "W", "L", "W", "W"];
        else if (name.includes("haiti")) initialForm = ["L", "W", "L", "W", "D"];
        else if (name.includes("curaçao") || name.includes("curacao")) initialForm = ["L", "L", "W", "L", "D"];
        else if (name.includes("yeşil burun")) initialForm = ["L", "W", "L", "D", "W"];
        else if (name.includes("güney afrika")) initialForm = ["D", "W", "L", "W", "D"];
        else if (name.includes("katar")) initialForm = ["W", "L", "W", "L", "D"];
        else if (name.includes("demokratik kongo") || name.includes("kongo")) initialForm = ["D", "W", "L", "W", "D"];
        else {
            const genericForms = [
                ["W", "D", "W", "L", "W"],
                ["W", "W", "D", "W", "W"],
                ["D", "W", "L", "W", "D"],
                ["L", "W", "D", "L", "W"],
                ["W", "L", "W", "W", "L"]
            ];
            const code = teamName.charCodeAt(0) || 0;
            initialForm = genericForms[code % genericForms.length];
        }

        // Dynamically append finished World Cup matches results
        if (allMatches && allMatches.length > 0) {
            const finishedMatches = allMatches
                .filter(m => m.status === 'FINISHED' && (m.homeTeam.toLowerCase().trim() === name || m.awayTeam.toLowerCase().trim() === name))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            finishedMatches.forEach(m => {
                const isHome = m.homeTeam.toLowerCase().trim() === name;
                const homeScore = parseInt(m.homeScore) || 0;
                const awayScore = parseInt(m.awayScore) || 0;
                
                if (homeScore === awayScore) {
                    initialForm.push("D");
                } else if (isHome) {
                    initialForm.push(homeScore > awayScore ? "W" : "L");
                } else {
                    initialForm.push(awayScore > homeScore ? "W" : "L");
                }
            });
        }
        
        // Return only the last 5 results (most recent)
        return initialForm.slice(-5);
    };
    
    details.homeForm = getTeamForm(homeTeam);
    details.awayForm = getTeamForm(awayTeam);
    
    const hRating = parseInt(details.homeStar.rating) || 80;
    const aRating = parseInt(details.awayStar.rating) || 80;
    
    const totalRating = hRating + aRating;
    const hCode = homeTeam.charCodeAt(0) || 0;
    const drawProb = 20 + (hCode % 10);
    const remaining = 100 - drawProb;
    details.homeWinProb = Math.round((hRating / totalRating) * remaining);
    details.awayWinProb = remaining - details.homeWinProb;
    details.drawProb = drawProb;
    
    return details;
};

export class FixtureCard {
    constructor(containerId, appState) {
        this.container = document.getElementById('fixtures-list'); // Overwrites to use the vertical list container
        this.appState = appState; // Reference to global app state
        this.modal = document.getElementById('match-detail-modal');
        this.activeTab = 'predictions'; // predictions, opinion, admin
        this.activeMatchId = null;
        // Live polling disabled as per user request
        // this.startLivePolling();
    }

    startLivePolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        
        this.pollingInterval = setInterval(async () => {
            if (!this.appState || !this.appState.activeUser) return;
            
            // Only poll if there is an active match window
            if (!this.hasActiveMatchWindow(this.appState.matches)) {
                return;
            }
            
            console.log("Live score polling: Active match window open, syncing scores...");
            try {
                const updatedMatches = await syncLiveScoresFromSportDb();
                if (updatedMatches && updatedMatches.length > 0) {
                    this.appState.matches = updatedMatches;
                    
                    // Re-render dashboard list if on the matches screen
                    if (this.appState.activeScreen === 'matches') {
                        await this.render();
                    }
                    
                    // Re-render open modal if the active match id is set
                    if (this.activeMatchId) {
                        const activeMatch = updatedMatches.find(m => m.id === this.activeMatchId);
                        if (activeMatch) {
                            const index = updatedMatches.findIndex(m => m.id === this.activeMatchId);
                            await this.refreshOpenMatchDetail(activeMatch, index);
                        }
                    }
                }
            } catch (err) {
                console.error("Live score polling failed:", err);
            }
        }, 60000); // Poll every 60 seconds
    }

    hasActiveMatchWindow(matches) {
        if (!matches) return false;
        const now = Date.now();
        return matches.some(m => {
            if (m.isFinalized || m.status === 'FINISHED') return false;
            if (m.status === 'LIVE') return true;
            const startTime = new Date(m.date).getTime();
            // Start checking from 5 minutes before kickoff, until 2.5 hours after kickoff
            return (now >= startTime - 5 * 60 * 1000) && (now <= startTime + 2.5 * 60 * 60 * 1000);
        });
    }

    async refreshOpenMatchDetail(match, index) {
        if (this.activeMatchId !== match.id) return;
        const preds = await getPredictions(this.appState.activeUser.id, match.id);
        const pred = preds.length > 0 ? preds[0] : null;
        
        // Temporarily set isBackAction to true to bypass pushState when refreshing
        this.isBackAction = true;
        try {
            await this.openMatchDetail(match, index, pred);
        } finally {
            this.isBackAction = false;
        }
    }

    async render() {
        this.container.innerHTML = '';
        const matches = this.appState.matches;

        // Fetch user predictions in a single batch query to solve loading latency
        const userPreds = await getPredictions(this.appState.activeUser.id);
        const userPredsMap = new Map(userPreds.map(p => [p.matchId, p]));

        // ✅ Only show non-finished matches on the main page
        const visibleMatches = matches.filter(m => m.status !== 'FINISHED');

        if (!visibleMatches || visibleMatches.length === 0) {
            this.container.innerHTML = `
                <div class="w-full flex flex-col items-center justify-center p-8 text-center glassmorphism rounded-[2rem] border border-white/10 shadow-2xl mt-6 relative overflow-hidden">
                    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-cyan/20 blur-[50px] pointer-events-none"></div>
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red via-brand-gold to-brand-blue flex items-center justify-center text-black mb-5 shadow-neon-gold animate-bounce">
                        <i data-lucide="calendar-x" class="w-7 h-7"></i>
                    </div>
                    <h3 class="text-lg font-outfit font-black text-white tracking-tight uppercase mb-2">Aktif Maç Yok</h3>
                    <p class="text-xs text-slate-400 max-w-[280px] leading-relaxed mb-6 font-medium">
                        Biten maçları Fikstür sekmesinden görebilirsiniz.
                    </p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // === TOURNAMENT PREDICTIONS HERO BANNER ===
        const heroSection = document.createElement('div');
        heroSection.className = 'w-full flex flex-col mb-6';

        const heroHeader = document.createElement('div');
        heroHeader.className = 'flex justify-between items-center mb-3 w-full';
        heroHeader.innerHTML = `
            <h3 class="text-xs font-outfit font-black tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase">
                <i data-lucide="award" class="w-4 h-4 text-brand-gold animate-bounce"></i> Turnuva Kahini
            </h3>
            <button id="btn-rules-page" class="text-[9px] font-black text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-1 rounded-full uppercase tracking-wider hover:bg-brand-cyan/20 transition-all flex items-center gap-1 cursor-pointer">
                <i data-lucide="info" class="w-3.5 h-3.5"></i> Puan & Kurallar
            </button>
        `;

        const btnRules = heroHeader.querySelector('#btn-rules-page');
        if (btnRules) {
            btnRules.addEventListener('click', (e) => {
                e.stopPropagation();
                this.appState.navigateToScreen('rules');
            });
        }

        const bannerCard = document.createElement('div');
        bannerCard.className = 'w-full flex flex-col p-5 bg-gradient-to-tr from-brand-card via-slate-900/90 to-brand-gold/10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:border-brand-gold/40 group';
        bannerCard.id = 'hero-tournament-prediction-banner';
        
        bannerCard.innerHTML = `
            <div class="absolute -top-16 -right-16 w-32 h-32 bg-brand-gold/15 blur-[30px] rounded-full pointer-events-none transition-all duration-500 group-hover:bg-brand-gold/25"></div>
            <div class="absolute -bottom-16 -left-16 w-32 h-32 bg-brand-cyan/10 blur-[30px] rounded-full pointer-events-none"></div>

            <div class="flex items-center gap-4 relative z-10">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-gold via-yellow-500 to-amber-600 flex items-center justify-center text-black shadow-neon-gold transition-transform duration-500 group-hover:rotate-12">
                    <i data-lucide="trophy" class="w-6 h-6"></i>
                </div>
                <div class="flex-1">
                    <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest block mb-0.5">YENİ ÖZELLİK 🌟</span>
                    <h4 class="text-sm font-outfit font-black text-white tracking-tight uppercase leading-tight">Grupları & Elemeleri Tahmin Et</h4>
                    <p class="text-[10px] text-slate-400 mt-1 leading-snug">Grup sıralamalarını belirle, eleme ağacını çiz ve Dünya Kupası Şampiyonunu seçip puanları topla!</p>
                </div>
            </div>

            <div class="flex justify-between items-center mt-4 pt-3 border-t border-white/5 relative z-10">
                <span class="text-[8px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Turnuva Eşleşmeleri Canlı
                </span>
                <span class="text-[9px] font-black text-white group-hover:text-brand-gold flex items-center gap-1 transition-colors">
                    Tahminleri Başlat <i data-lucide="chevron-right" class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"></i>
                </span>
            </div>
        `;

        bannerCard.addEventListener('click', () => {
            this.appState.navigateToScreen('tournament');
        });

        heroSection.appendChild(heroHeader);
        heroSection.appendChild(bannerCard);
        this.container.appendChild(heroSection);

        // === ALL MATCHES grouped by day, sorted by date ===
        const otherMatches = [...visibleMatches]
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const listSection = document.createElement('div');
        listSection.className = 'w-full flex flex-col gap-5';

        const listHeaderContainer = document.createElement('div');
        listHeaderContainer.className = 'flex justify-between items-center w-full mb-1';
        
        const listHeader = document.createElement('h3');
        listHeader.className = 'text-xs font-outfit font-black tracking-widest text-slate-800 dark:text-slate-200 uppercase';
        listHeader.textContent = 'Tahmin Bekleyen Maçlar';
        listHeaderContainer.appendChild(listHeader);

        const hasActiveMatches = this.hasActiveMatchWindow(matches);
        if (false && hasActiveMatches) { // Hide refresh button per user request
            const refreshBtn = document.createElement('button');
            refreshBtn.id = 'user-refresh-live-scores-btn';
            refreshBtn.className = 'text-[9px] font-black text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-full uppercase tracking-wider hover:bg-brand-green/20 transition-all flex items-center gap-1 cursor-pointer';
            refreshBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-3 h-3"></i> Skorları Güncelle 🔄';
            refreshBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '⌛ Güncelleniyor...';
                try {
                    const cache = await getLiveScoresCache();
                    const now = Date.now();
                    // 2 minutes = 120,000 ms limit
                    if (cache && cache.lastUpdated && (now - cache.lastUpdated < 120000)) {
                        const remainingSecs = Math.ceil((120000 - (now - cache.lastUpdated)) / 1000);
                        alert(`Skorlar zaten güncel! Tekrar güncellemek için ${remainingSecs} saniye bekleyin.`);
                        refreshBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-3 h-3"></i> Skorları Güncelle 🔄';
                        refreshBtn.disabled = false;
                        return;
                    }

                    const updatedMatches = await syncLiveScoresFromSportDb(true);
                    if (updatedMatches) {
                        this.appState.matches = updatedMatches;
                        await this.render();
                        alert('Canlı skorlar başarıyla güncellendi!');
                    }
                } catch (err) {
                    console.error("Manual refresh failed:", err);
                    alert("Skorlar güncellenemedi: " + err.message);
                    refreshBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-3 h-3"></i> Skorları Güncelle 🔄';
                    refreshBtn.disabled = false;
                }
            });
            listHeaderContainer.appendChild(refreshBtn);
        }
        
        listSection.appendChild(listHeaderContainer);

        // Group by calendar day
        const matchesByDay = new Map();
        otherMatches.forEach(m => {
            const mDate = new Date(m.date);
            const dayStart = new Date(mDate.getFullYear(), mDate.getMonth(), mDate.getDate());
            const key = dayStart.getTime();
            if (!matchesByDay.has(key)) {
                matchesByDay.set(key, { dayStart, date: mDate, matches: [] });
            }
            matchesByDay.get(key).matches.push(m);
        });

        for (const [, { dayStart, date, matches: dayMatches }] of matchesByDay) {
            const daysAway = Math.round((dayStart - todayStart) / (1000 * 60 * 60 * 24));

            const daySection = document.createElement('div');
            daySection.className = 'flex flex-col gap-2.5';

            // Day label with countdown badge
            const dayLabel = document.createElement('div');
            dayLabel.className = 'flex items-center gap-2 pl-1 mb-1';
            const dateFormatted = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
            let badge = '';
            if (daysAway === 0) badge = '<span class="text-[8px] font-black bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Bugün</span>';
            else if (daysAway === 1) badge = '<span class="text-[8px] font-black bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Yarın</span>';
            else badge = `<span class="text-[8px] font-black bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-500 border border-slate-300 dark:border-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest">${daysAway} Gün Sonra</span>`;
            dayLabel.innerHTML = `<span class="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">${dateFormatted}</span> ${badge}`;
            daySection.appendChild(dayLabel);

            for (const match of dayMatches) {
                const matchIndex = matches.findIndex(m => m.id === match.id);
                const pred = userPredsMap.get(match.id) || null;
                const cardEl = this.createHeroCardElement(match, matchIndex, pred);
                daySection.appendChild(cardEl);
            }

            listSection.appendChild(daySection);
        }

        this.container.appendChild(listSection);

        // Render completed matches at the bottom if any exist (e.g. the test match after completion)
        const finishedMatches = matches.filter(m => m.status === 'FINISHED');
        if (finishedMatches.length > 0) {
            const finishedSection = document.createElement('div');
            finishedSection.className = 'w-full flex flex-col gap-3 mt-6 border-t border-white/5 pt-4';
            finishedSection.innerHTML = `
                <h3 class="text-xs font-outfit font-black tracking-widest text-slate-800 dark:text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                    <i data-lucide="check-circle" class="w-4 h-4 text-brand-green"></i> Tamamlanan Maçlar (Test)
                </h3>
                <div class="flex flex-col gap-1.5" id="finished-matches-list"></div>
            `;
            const finishedList = finishedSection.querySelector('#finished-matches-list');
            finishedMatches.forEach(m => {
                const matchIndex = matches.findIndex(match => match.id === m.id);
                const card = this.createFinishedMatchCard(m, matchIndex);
                finishedList.appendChild(card);
            });
            this.container.appendChild(finishedSection);
        }

        if (window.lucide) window.lucide.createIcons();
    }

    createMediumCard(match, index, daysAway) {
        const getTeamColor = (n) => {
            const name = n.toLowerCase();
            if (name.includes('meksika')) return '#006847';
            if (name.includes('güney afrika')) return '#007a4d';
            if (name.includes('güney kore')) return '#c60c30';
            if (name.includes('çekya')) return '#11457e';
            if (name.includes('kanada')) return '#d80621';
            if (name.includes('bosna')) return '#002f6c';
            if (name.includes('katar')) return '#8a1538';
            if (name.includes('isviçre')) return '#d52b1e';
            if (name.includes('brezilya')) return '#009739';
            if (name.includes('fas')) return '#c1272d';
            if (name.includes('haiti')) return '#00209f';
            if (name.includes('iskoçya')) return '#005eb8';
            if (name.includes('abd')) return '#0a3161';
            if (name.includes('paraguay')) return '#0038a8';
            if (name.includes('avustralya')) return '#002b7f';
            if (name.includes('türkiye')) return '#e30a17';
            if (name.includes('almanya')) return '#222222';
            if (name.includes('hollanda')) return '#ff4f00';
            if (name.includes('arjantin')) return '#75aadb';
            if (name.includes('ingiltere')) return '#ce1126';
            if (name.includes('ispanya')) return '#aa151b';
            if (name.includes('portekiz')) return '#046a38';
            if (name.includes('fransa')) return '#00209f';
            if (name.includes('belçika')) return '#ef3340';
            if (name.includes('uruguay')) return '#43a1d5';
            return '#1e293b';
        };

        const homeColor = getTeamColor(match.homeTeam);
        const awayColor = getTeamColor(match.awayTeam);
        const mDate = new Date(match.date);
        const timeStr = mDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = mDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

        const card = document.createElement('div');
        card.className = 'medium-match-card w-full rounded-2xl p-4 relative overflow-hidden mb-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] border border-slate-200/50 dark:border-white/10';
        card.dataset.matchId = match.id;
        card.dataset.matchIndex = index;

        card.innerHTML = `
            <!-- Soft flag aura glows -->
            <div class="absolute left-3 -top-3 w-20 h-20 rounded-full blur-[25px] opacity-[0.08] dark:opacity-[0.2] pointer-events-none" style="background: radial-gradient(circle, ${homeColor} 0%, transparent 70%);"></div>
            <div class="absolute right-3 -bottom-3 w-20 h-20 rounded-full blur-[25px] opacity-[0.08] dark:opacity-[0.2] pointer-events-none" style="background: radial-gradient(circle, ${awayColor} 0%, transparent 70%);"></div>

            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;position:relative;z-index:10;">
                <!-- Home team -->
                <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
                    <img src="${match.homeFlag}" alt="${match.homeTeam}" style="width:28px;height:20px;object-fit:cover;border-radius:4px;border:1px solid rgba(255,255,255,0.2);flex-shrink:0;">
                    <span class="text-slate-800 dark:text-white" style="font-size:12px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${match.homeTeam}</span>
                </div>

                <!-- Center: time + group -->
                <div style="display:flex;flex-direction:column;align-items:center;min-width:80px;text-align:center;padding:0 8px;">
                    <span class="text-slate-800 dark:text-white" style="font-size:11px;font-weight:900;letter-spacing:0.05em;">${timeStr}</span>
                    <span class="text-slate-500 dark:text-white/60" style="font-size:9px;margin-top:2px;">${dateStr}</span>
                    ${match.group ? `<span class="text-slate-700 dark:text-white/80 bg-slate-900/5 dark:bg-white/15" style="font-size:8px;font-weight:900;border-radius:20px;padding:1px 8px;margin-top:3px;text-transform:uppercase;letter-spacing:0.1em;">${match.group.length === 1 ? 'Grup ' + match.group : match.group}</span>` : ''}
                </div>

                <!-- Away team -->
                <div style="display:flex;align-items:center;gap:8px;flex:1;justify-content:flex-end;min-width:0;">
                    <span class="text-slate-800 dark:text-white" style="font-size:12px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;">${match.awayTeam}</span>
                    <img src="${match.awayFlag}" alt="${match.awayTeam}" style="width:28px;height:20px;object-fit:cover;border-radius:4px;border:1px solid rgba(255,255,255,0.2);flex-shrink:0;">
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.appState.activeMatchIndex = index;
            this.openMatchDetail(match, index);
        });

        return card;
    }

    createCompactCard(match, index) {
        const mDate = new Date(match.date);
        const timeStr = mDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = mDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

        const card = document.createElement('div');
        card.className = 'w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-900/40 hover:border-white/10 mb-1';
        card.dataset.matchId = match.id;
        card.dataset.matchIndex = index;

        card.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
                <img src="${match.homeFlag}" alt="${match.homeTeam}" style="width:18px;height:13px;object-fit:cover;border-radius:2px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;">
                <span style="font-size:11px;font-weight:700;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${match.homeTeam}</span>
            </div>

            <div style="display:flex;flex-direction:column;align-items:center;min-width:75px;text-align:center;padding:0 6px;">
                <span style="font-size:10px;font-weight:900;color:#94a3b8;">${timeStr}</span>
                <span style="font-size:8px;color:#64748b;margin-top:1px;">${dateStr}</span>
                ${match.group ? `<span style="font-size:7px;font-weight:800;color:#38bdf8;text-transform:uppercase;letter-spacing:0.08em;">${match.group.length === 1 ? match.group + ' GR.' : match.group}</span>` : ''}
            </div>

            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;justify-content:flex-end;">
                <span style="font-size:11px;font-weight:700;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;">${match.awayTeam}</span>
                <img src="${match.awayFlag}" alt="${match.awayTeam}" style="width:18px;height:13px;object-fit:cover;border-radius:2px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;">
            </div>
        `;

        card.addEventListener('click', () => {
            this.appState.activeMatchIndex = index;
            this.openMatchDetail(match, index);
        });

        return card;
    }

    createFinishedMatchCard(match, index) {
        const card = document.createElement('div');
        card.className = 'w-full bg-slate-950/20 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-900/30 mb-2';
        card.dataset.matchId = match.id;
        card.dataset.matchIndex = index;

        card.innerHTML = `
            <div class="flex items-center gap-2.5 flex-1 min-w-0">
                <img src="${match.homeFlag}" alt="${match.homeTeam}" class="w-6 h-4 object-cover rounded border border-white/10 flex-shrink-0">
                <span class="text-xs font-bold text-slate-300 truncate">${match.homeTeam}</span>
            </div>

            <div class="flex flex-col items-center justify-center px-4 min-w-[70px] text-center">
                <div class="flex items-center gap-1.5 font-outfit font-black text-brand-green text-sm">
                    <span>${match.homeScore}</span>
                    <span class="text-slate-600 font-bold">:</span>
                    <span>${match.awayScore}</span>
                </div>
                <span class="text-[8px] font-black text-slate-500 uppercase tracking-wider mt-1 bg-white/5 px-2 py-0.5 rounded-full">BİTTİ 🏁</span>
            </div>

            <div class="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                <span class="text-xs font-bold text-slate-300 truncate text-right">${match.awayTeam}</span>
                <img src="${match.awayFlag}" alt="${match.awayTeam}" class="w-6 h-4 object-cover rounded border border-white/10 flex-shrink-0">
            </div>
        `;

        card.addEventListener('click', () => {
            this.appState.activeMatchIndex = index;
            this.openMatchDetail(match, index);
        });

        return card;
    }


    createHeroCardElement(match, index, pred = null) {
        const appliedJoker = pred ? pred.appliedJoker : null;

        // Define joker glowing class
        let jokerGlowClass = '';
        if (appliedJoker) {
            if (appliedJoker === 'ciftesans') jokerGlowClass = 'joker-glow-ciftesans';
            else if (appliedJoker === 'doublepuan') jokerGlowClass = 'joker-glow-doublepuan';
            else if (appliedJoker === 'allin') jokerGlowClass = 'joker-glow-allin';
            else if (appliedJoker === 'spy') jokerGlowClass = 'joker-glow-spy';
            else if (appliedJoker === 'doksanarti') jokerGlowClass = 'joker-glow-doksanarti';
            else if (appliedJoker === 'sabotaj') jokerGlowClass = 'joker-glow-sabotaj';
        }

        const getTeamColor = (teamName) => {
            const name = teamName.toLowerCase().trim();
            if (name.includes("meksika") || name.includes("mexico")) return "#006847";
            if (name.includes("güney afrika") || name.includes("south africa")) return "#007a4d";
            if (name.includes("güney kore") || name.includes("south korea")) return "#c60c30";
            if (name.includes("çekya") || name.includes("czechia")) return "#11457e";
            if (name.includes("kanada") || name.includes("canada")) return "#d80621";
            if (name.includes("bosna") || name.includes("bosnia")) return "#002f6c";
            if (name.includes("katar") || name.includes("qatar")) return "#8a1538";
            if (name.includes("isviçre") || name.includes("switzerland")) return "#d52b1e";
            if (name.includes("brezilya") || name.includes("brazil")) return "#009739";
            if (name.includes("fas") || name.includes("morocco")) return "#c1272d";
            if (name.includes("haiti")) return "#00209f";
            if (name.includes("iskoçya") || name.includes("scotland")) return "#005eb8";
            if (name.includes("abd") || name.includes("usa")) return "#0a3161";
            if (name.includes("paraguay")) return "#0038a8";
            if (name.includes("avustralya") || name.includes("australia")) return "#002b7f";
            if (name.includes("fransa") || name.includes("france")) return "#00209f";
            if (name.includes("hırvatistan") || name.includes("croatia")) return "#c61026";
            if (name.includes("almanya") || name.includes("germany")) return "#222222";
            if (name.includes("arjantin") || name.includes("argentina")) return "#75aadb";
            if (name.includes("ingiltere") || name.includes("england")) return "#ce1126";
            if (name.includes("türkiye") || name.includes("turkey")) return "#e30a17";
            if (name.includes("ispanya") || name.includes("spain")) return "#aa151b";
            if (name.includes("italya") || name.includes("italy")) return "#008c45";
            if (name.includes("portekiz") || name.includes("portugal")) return "#046a38";
            if (name.includes("hollanda") || name.includes("netherlands")) return "#ff4f00";
            if (name.includes("uruguay")) return "#43a1d5";
            if (name.includes("mısır") || name.includes("egypt")) return "#ce1126";
            if (name.includes("suudi arabistan") || name.includes("saudi")) return "#006a4e";
            if (name.includes("yeni zelanda") || name.includes("new zealand")) return "#000000";
            if (name.includes("senegal")) return "#00853f";
            if (name.includes("irak") || name.includes("iraq")) return "#007a3d";
            if (name.includes("norveç") || name.includes("norway")) return "#ba0c2f";
            if (name.includes("cezayir") || name.includes("algeria")) return "#006233";
            if (name.includes("avusturya") || name.includes("austria")) return "#ed2939";
            if (name.includes("ürdün") || name.includes("jordan")) return "#ce1126";
            if (name.includes("kongo") || name.includes("dr congo")) return "#007fff";
            if (name.includes("gana") || name.includes("ghana")) return "#006b3f";
            if (name.includes("panama")) return "#c8102e";
            return "#1e293b";
        };
        const homeColor = getTeamColor(match.homeTeam);
        const awayColor = getTeamColor(match.awayTeam);

        const row = document.createElement('div');
        row.className = `hero-match-card w-full rounded-[2rem] p-6 text-white relative overflow-hidden mb-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] z-10 border border-white/10 ${jokerGlowClass}`;
        row.style.background = `linear-gradient(135deg, ${homeColor}b5 0%, ${awayColor}b5 100%)`;
        row.dataset.matchId = match.id;
        row.dataset.index = index;

        const isFinished = match.status === 'FINISHED';
        const isLive = match.status === 'LIVE';
        const matchTime = new Date(match.date).getTime();
        const lockTime = matchTime - 15 * 60 * 1000;
        const isClosed = (Date.now() >= lockTime) && !match.adminUnlocked;

        // Format Date
        const matchDate = new Date(match.date);
        const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateShort = matchDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });

        // Waving flag background — enabled for all matches
        const useWavingFlags = true;

        const backgroundOverlay = useWavingFlags ? `
            <!-- Waving Home Flag Background (Left) -->
            <img src="${match.homeFlag}" alt="" class="hero-flag-bg">
            <!-- Waving Away Flag Background (Right) -->
            <img src="${match.awayFlag}" alt="" class="hero-flag-bg-away">
            <!-- Shimmer light sweep -->
            <div class="hero-flag-shimmer"></div>
        ` : `
            <!-- Soft flag aura glows (default) -->
            <div class="absolute left-6 -top-6 w-36 h-36 rounded-full blur-[48px] opacity-[0.14] dark:opacity-[0.28] pointer-events-none" style="background: radial-gradient(circle, ${homeColor} 0%, transparent 70%);"></div>
            <div class="absolute right-6 -bottom-6 w-36 h-36 rounded-full blur-[48px] opacity-[0.14] dark:opacity-[0.28] pointer-events-none" style="background: radial-gradient(circle, ${awayColor} 0%, transparent 70%);"></div>
        `;

        row.innerHTML = `
            ${backgroundOverlay}

            <!-- Stadium info in a clean capsule -->
            <div class="flex flex-col items-center justify-center mb-3.5 text-center relative z-10">
                <span class="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-outfit font-black uppercase tracking-widest text-white/95 border border-white/10 mb-1 shadow-sm">
                    ${match.group ? '🏆 GRUP ' + match.group : '🌍 FİFA 2026'}
                </span>
                <span class="text-[9px] text-white/75 font-semibold tracking-wider uppercase">Grup Aşaması</span>
            </div>

            <!-- Match Details -->
            <div class="flex items-center justify-between w-full my-3 relative z-10" style="gap:0;">
                <!-- Home Team -->
                <div class="flex flex-col items-center flex-1 text-center min-w-0">
                    <div class="w-14 h-14 rounded-full bg-white/10 border border-white/25 p-1.5 shadow-lg flex items-center justify-center relative overflow-hidden shrink-0">
                        <img src="${match.homeFlag}" alt="${match.homeTeam}" class="w-11 h-11 object-contain rounded-full bg-slate-950/20 p-0.5 shadow-inner">
                    </div>
                    <span class="text-[13px] font-outfit font-black text-white mt-2.5 truncate max-w-full px-1">${match.homeTeam}</span>
                    <span class="text-[9px] text-white/70 font-semibold tracking-wide uppercase">HOME</span>
                </div>

                <!-- Center Score / VS block -->
                <div class="flex flex-col items-center justify-center shrink-0" style="min-width:80px;">
                    ${isFinished || isLive ? `
                        <span class="text-3xl font-outfit font-black text-white tracking-wider">${match.homeScore} : ${match.awayScore}</span>
                        <span class="text-[9px] font-black text-red-300 bg-red-500/30 px-3 py-0.5 rounded-full mt-2 tracking-widest flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                            ${isLive ? `CANLI ${match.elapsedTime ? `(${match.elapsedTime})` : ''}` : 'BİTTİ'}
                        </span>
                    ` : `
                        <span class="text-3xl font-outfit font-black text-white tracking-wider">VS</span>
                        <span class="text-[9px] font-black text-white/90 bg-white/15 border border-white/10 px-3 py-0.5 rounded-full mt-2 tracking-widest">${timeStr}</span>
                        <span class="text-[8px] text-white/55 font-semibold mt-1 tracking-wide">${dateShort}</span>
                    `}
                </div>

                <!-- Away Team -->
                <div class="flex flex-col items-center flex-1 text-center min-w-0">
                    <div class="w-14 h-14 rounded-full bg-white/10 border border-white/25 p-1.5 shadow-lg flex items-center justify-center relative overflow-hidden shrink-0">
                        <img src="${match.awayFlag}" alt="${match.awayTeam}" class="w-11 h-11 object-contain rounded-full bg-slate-950/20 p-0.5 shadow-inner">
                    </div>
                    <span class="text-[13px] font-outfit font-black text-white mt-2.5 truncate max-w-full px-1">${match.awayTeam}</span>
                    <span class="text-[9px] text-white/70 font-semibold tracking-wide uppercase">AWAY</span>
                </div>
            </div>
            
            <!-- Hero Card Prediction Status Summary Badge -->
            <div class="w-full bg-white/15 backdrop-blur-md p-3.5 rounded-[1.25rem] border border-white/15 flex flex-col items-center justify-center gap-1.5 text-center mt-4 shadow-inner relative z-10">
                <div class="flex items-center justify-center gap-1.5">
                    <span class="text-[9px] font-bold text-white/85 uppercase tracking-widest leading-none">TAHMİNİNİZ:</span>
                    ${appliedJoker ? `
                        <span class="bg-brand-gold text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                            ⭐ ${this.getJokerName(appliedJoker).split(' ')[0]}
                        </span>
                    ` : ''}
                </div>
                <span class="text-xs font-outfit font-black text-white leading-none tracking-wide uppercase">
                    ${pred ? (pred.appliedJoker === 'ciftesans' && pred.homeScorePredAlt !== undefined ? `${pred.homeScorePred}-${pred.awayScorePred} veya ${pred.homeScorePredAlt}-${pred.awayScorePredAlt}` : `${pred.homeScorePred} - ${pred.awayScorePred}`) : (isClosed ? 'TAHMİN SÜRESİ DOLDU 🔐' : 'TAHMİN ETMEK İÇİN TIKLAYIN ⚔️')}
                </span>
            </div>
        `;

        row.addEventListener('click', () => {
            this.openMatchDetail(match, index, pred);
        });

        return row;
    }

    createFixtureRowElement(match, index, pred = null, sabotageActive = false) {
        const appliedJoker = pred ? pred.appliedJoker : null;

        // Define joker glowing class
        let jokerGlowClass = '';
        if (appliedJoker) {
            if (appliedJoker === 'ciftesans') jokerGlowClass = 'joker-glow-ciftesans';
            else if (appliedJoker === 'doublepuan') jokerGlowClass = 'joker-glow-doublepuan';
            else if (appliedJoker === 'allin') jokerGlowClass = 'joker-glow-allin';
            else if (appliedJoker === 'spy') jokerGlowClass = 'joker-glow-spy';
            else if (appliedJoker === 'doksanarti') jokerGlowClass = 'joker-glow-doksanarti';
            else if (appliedJoker === 'sabotaj') jokerGlowClass = 'joker-glow-sabotaj';
        }

        const row = document.createElement('div');
        row.className = `fixture-list-row w-full bg-brand-dark/45 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:border-white/15 hover:bg-white/[0.02] cursor-pointer mb-3 relative overflow-hidden z-10 ${jokerGlowClass}`;
        row.dataset.matchId = match.id;
        row.dataset.index = index;

        const isFinished = match.status === 'FINISHED';
        const isLive = match.status === 'LIVE';
        const matchTime = new Date(match.date).getTime();
        const lockTime = matchTime - 15 * 60 * 1000;
        const isClosed = (Date.now() >= lockTime) && !match.adminUnlocked;

        // Format Date
        const matchDate = new Date(match.date);
        const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        // Flag glow helper map
        const getTeamGlowColor = (teamName) => {
            const name = teamName.toLowerCase();
            if (name.includes('brezilya') || name.includes('brazil')) return 'rgba(34, 197, 94, 0.4)'; // green
            if (name.includes('hırvatistan') || name.includes('croatia')) return 'rgba(239, 68, 68, 0.4)'; // red
            if (name.includes('arjantin') || name.includes('argentina')) return 'rgba(14, 165, 233, 0.45)'; // sky blue
            if (name.includes('fransa') || name.includes('france')) return 'rgba(37, 99, 235, 0.45)'; // blue
            if (name.includes('almanya') || name.includes('germany')) return 'rgba(234, 179, 8, 0.35)'; // gold/red
            if (name.includes('japonya') || name.includes('japan')) return 'rgba(244, 63, 94, 0.45)'; // rose red
            if (name.includes('portekiz') || name.includes('portugal')) return 'rgba(34, 197, 94, 0.4)'; // green
            if (name.includes('uruguay') || name.includes('uruguay')) return 'rgba(6, 182, 212, 0.45)'; // cyan
            return 'rgba(255, 255, 255, 0.15)';
        };

        const homeGlow = getTeamGlowColor(match.homeTeam);
        const awayGlow = getTeamGlowColor(match.awayTeam);

        row.innerHTML = `
            <!-- Soft flag aura glow behind the flag circle -->
            <div class="absolute left-4 w-12 h-12 rounded-full blur-xl opacity-[0.25] pointer-events-none" style="background: radial-gradient(circle, ${homeGlow} 0%, transparent 70%);"></div>
            <div class="absolute right-4 w-12 h-12 rounded-full blur-xl opacity-[0.25] pointer-events-none" style="background: radial-gradient(circle, ${awayGlow} 0%, transparent 70%);"></div>

            <!-- Home Team -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-full bg-slate-900 border border-white/10 p-1 flex items-center justify-center relative overflow-hidden z-10 shrink-0">
                    <img src="${match.homeFlag}" alt="${match.homeTeam}" class="w-6 h-6 object-contain rounded-full bg-slate-950/40 p-0.5">
                </div>
                <span class="text-xs font-outfit font-black text-slate-200 truncate z-10">${match.homeTeam}</span>
            </div>

            <!-- Center Time / Score -->
            <div class="flex flex-col items-center justify-center min-w-[70px] z-10">
                ${isFinished || isLive ? `
                    <span class="text-sm font-outfit font-black text-brand-cyan">${match.homeScore} : ${match.awayScore}</span>
                    ${isLive ? `<span class="text-[7px] text-red-400 font-extrabold animate-pulse tracking-widest mt-0.5">CANLI ${match.elapsedTime ? `(${match.elapsedTime})` : ''}</span>` : ''}
                ` : `
                    <span class="text-xs font-outfit font-bold text-slate-400">${timeStr}</span>
                `}
            </div>

            <!-- Away Team -->
            <div class="flex items-center gap-3 flex-1 min-w-0 justify-end">
                <span class="text-xs font-outfit font-black text-slate-200 truncate text-right z-10">${match.awayTeam}</span>
                <div class="w-8 h-8 rounded-full bg-slate-900 border border-white/10 p-1 flex items-center justify-center relative overflow-hidden z-10 shrink-0">
                    <img src="${match.awayFlag}" alt="${match.awayTeam}" class="w-6 h-6 object-contain rounded-full bg-slate-950/40 p-0.5">
                </div>
            </div>
            
            <!-- User Prediction indicators -->
            <div class="flex items-center gap-1.5 ml-2.5 z-10 pl-2.5 border-l border-white/5">
                ${pred ? `
                    <div class="w-4.5 h-4.5 rounded-full bg-brand-cyan/20 border border-brand-cyan/25 flex items-center justify-center" title="Tahmin Edildi: ${pred.homeScorePred}-${pred.awayScorePred}">
                        <i data-lucide="check" class="w-2.5 h-2.5 text-brand-cyan"></i>
                    </div>
                ` : `
                    <div class="w-4.5 h-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" title="${isClosed ? 'Tahmin Süresi Doldu' : 'Tahmin Yapılmadı'}">
                        <i data-lucide="${isClosed ? 'lock' : 'plus'}" class="w-2 h-2 text-slate-500"></i>
                    </div>
                `}
            </div>
        `;

        row.addEventListener('click', () => {
            this.openMatchDetail(match, index, pred);
        });

        return row;
    }

    async openMatchDetail(match, index, pred = null, isRefresh = false) {
        // Update index so that Joker Wallet applies to this active match index
        this.appState.activeMatchIndex = index;
        const isMatchOver = match.status === 'FINISHED' || match.status === 'LIVE';
        if (!isRefresh) {
            this.activeTab = isMatchOver ? 'report' : 'predictions'; // Finished → Report, Unplayed → Predictions
        }

        if (!this.isBackAction && !isRefresh) {
            window.history.pushState({
                screen: this.appState.activeScreen,
                modal: 'match-detail',
                matchId: match.id,
                matchIndex: index
            }, '');
        }

        // Fetch prediction details if not provided
        if (!pred) {
            const preds = await getPredictions(this.appState.activeUser.id, match.id);
            pred = preds.length > 0 ? preds[0] : null;
        }

        // Fetch all predictions for public opinion bar calculation
        const allPreds = await getPredictions(null, match.id);
        const opinion = this.calculatePublicOpinion(allPreds);

        // Score prediction details
        const homeScore = pred ? pred.homeScorePred : 0;
        const awayScore = pred ? pred.awayScorePred : 0;
        
        // Alt prediction for Double Chance
        const homeScoreAlt = pred && pred.homeScorePredAlt !== undefined ? pred.homeScorePredAlt : 0;
        const awayScoreAlt = pred && pred.awayScorePredAlt !== undefined ? pred.awayScorePredAlt : 0;
        
        const isLocked = pred ? pred.isLocked : false;
        const appliedJoker = pred ? pred.appliedJoker : null;
        
        // Define joker glowing class
        let jokerGlowClass = '';
        if (appliedJoker) {
            if (appliedJoker === 'ciftesans') jokerGlowClass = 'joker-glow-ciftesans';
            else if (appliedJoker === 'doublepuan') jokerGlowClass = 'joker-glow-doublepuan';
            else if (appliedJoker === 'allin') jokerGlowClass = 'joker-glow-allin';
            else if (appliedJoker === 'spy') jokerGlowClass = 'joker-glow-spy';
            else if (appliedJoker === 'doksanarti') jokerGlowClass = 'joker-glow-doksanarti';
            else if (appliedJoker === 'sabotaj') jokerGlowClass = 'joker-glow-sabotaj';
        }

        const isFinished = match.status === 'FINISHED';
        const isLive = match.status === 'LIVE';
        const matchTime = new Date(match.date).getTime();
        const lockTime = matchTime - 15 * 60 * 1000;
        const isTimeLocked = (Date.now() >= lockTime) && !match.adminUnlocked;
        const isInputDisabled = isLocked || isFinished || isTimeLocked;

        // Check if sabotaged
        const sabotageActive = allPreds.some(p => p.appliedJoker === 'sabotaj' && p.targetUserId === this.appState.activeUser.id);
        const sabotageOverlay = sabotageActive ? '<div class="absolute inset-0 sabotaged-overlay pointer-events-none z-10"></div>' : '';

        // Open detailed drawer page
        this.modal.innerHTML = `
            ${sabotageOverlay}
            <div class="flex flex-col w-full h-full relative z-20 pb-6">
                
                <!-- TOP HEADER BAR -->
                <div class="flex justify-between items-center px-4 py-3 bg-brand-dark border-b border-white/5 shrink-0">
                    <button id="close-detail-btn" class="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all py-1.5 px-3 rounded-xl hover:bg-white/5 cursor-pointer">
                        <i data-lucide="chevron-left" class="w-4 h-4"></i> Geri
                    </button>
                    
                    <span class="text-xs font-outfit font-black text-brand-gold uppercase tracking-widest bg-brand-gold/10 border border-brand-gold/25 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-neon-gold">
                        🏆 World Cup Predictions
                    </span>
                </div>

                <!-- JOKER STATUS BANNER -->
                ${appliedJoker ? `
                    <div id="joker-cancel-banner" class="w-full cursor-pointer bg-gradient-to-r ${this.getJokerGradient(appliedJoker)} text-black text-center py-2.5 text-xs font-outfit font-black uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5 shadow-lg relative z-20 shadow-[0_0_15px_rgba(255,255,255,0.15)] shrink-0" title="Jokeri iptal etmek için tıklayın">
                        <span>⚡ ${this.getJokerName(appliedJoker).toUpperCase()} AKTİF (İPTAL ETMEK İÇİN TIKLA) ⚡</span>
                    </div>
                ` : ''}

                <!-- STADIUM HEADER BANNER -->
                <div class="skorio-header-bg py-6 px-4 flex flex-col items-center justify-center text-center shrink-0">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-black/45 border border-white/5 px-2.5 py-0.5 rounded-full mb-3">
                        🏆 World Cup 2026 • Group Stage
                    </span>

                    <div class="flex items-center justify-between w-full max-w-sm gap-2">
                        <!-- Home Team -->
                        <div class="flex flex-col items-center flex-1 text-center min-w-0">
                            <div class="w-14 h-14 rounded-full bg-slate-900/80 border border-white/10 p-2 shadow-lg flex items-center justify-center relative overflow-hidden group shrink-0">
                                <img src="${match.homeFlag}" alt="${match.homeTeam}" class="w-10 h-10 object-contain rounded-sm transition-transform duration-300 group-hover:scale-110">
                            </div>
                            <span class="text-xs font-outfit font-black text-slate-200 mt-2 truncate max-w-full px-1">${match.homeTeam}</span>
                        </div>

                        <!-- Score / VS -->
                        <div class="flex flex-col items-center justify-center shrink-0" style="min-width:80px;">
                            ${isFinished || isLive ? `
                                <div class="flex items-center justify-center gap-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 shadow-inner">
                                    <span class="text-lg font-outfit font-black text-brand-cyan ${isLive ? 'pulse-live' : ''}">${match.homeScore}</span>
                                    <span class="text-slate-500 font-bold text-xs">:</span>
                                    <span class="text-lg font-outfit font-black text-brand-cyan ${isLive ? 'pulse-live' : ''}">${match.awayScore}</span>
                                </div>
                                <span class="text-[10px] text-red-400 font-black uppercase mt-1.5 tracking-widest animate-pulse">${isLive ? `Canlı Maç ${match.elapsedTime ? `(${match.elapsedTime})` : ''}` : 'Maç Sonucu'}</span>
                            ` : `
                                <span class="text-xs font-outfit font-black text-slate-400 tracking-wider bg-black/50 px-3 py-1 rounded-lg border border-white/5">VS</span>
                                <span class="text-xs font-outfit font-bold text-slate-200 mt-2 tracking-wide whitespace-nowrap">${this.formatDate(match.date)}</span>
                            `}
                        </div>

                        <!-- Away Team -->
                        <div class="flex flex-col items-center flex-1 text-center min-w-0">
                            <div class="w-14 h-14 rounded-full bg-slate-900/80 border border-white/10 p-2 shadow-lg flex items-center justify-center relative overflow-hidden group shrink-0">
                                <img src="${match.awayFlag}" alt="${match.awayTeam}" class="w-10 h-10 object-contain rounded-sm transition-transform duration-300 group-hover:scale-110">
                            </div>
                            <span class="text-xs font-outfit font-black text-slate-200 mt-2 truncate max-w-full px-1">${match.awayTeam}</span>
                        </div>
                    </div>

                    <!-- COUNTDOWN TIMER (only for upcoming matches) -->
                    ${!isFinished && !isLive ? `
                        <div id="match-countdown-timer" class="mt-4 px-4 py-1.5 rounded-full border border-white/10 bg-black/50 text-slate-300 font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-inner transition-all duration-300">
                            <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400" id="match-countdown-icon"></i>
                            <span id="match-countdown-span">Geri sayım yükleniyor...</span>
                        </div>
                    ` : ''}

                    <!-- SUB-TABS NAVIGATION -->
                    <div class="flex items-center justify-between w-full max-w-sm mt-6 bg-black/45 border border-white/5 rounded-xl p-1 text-[9px] font-bold uppercase gap-0.5">
                        <button class="detail-tab-btn flex-1 py-1.5 rounded-lg text-center transition-all ${this.activeTab === 'predictions' ? 'bg-brand-green text-black font-extrabold' : 'text-slate-400'}" data-tab="predictions">Tahmin</button>
                        <button class="detail-tab-btn flex-1 py-1.5 rounded-lg text-center transition-all ${this.activeTab === 'opinion' ? 'bg-brand-green text-black font-extrabold' : 'text-slate-400'}" data-tab="opinion">Kamuoyu</button>
                        <button class="detail-tab-btn flex-1 py-1.5 rounded-lg text-center transition-all ${this.activeTab === 'admin' ? 'bg-brand-green text-black font-extrabold' : 'text-slate-400'}" data-tab="admin">Yorum</button>
                        ${isFinished || isLive ? `
                            <button class="detail-tab-btn flex-1 py-1.5 rounded-lg text-center transition-all ${this.activeTab === 'report' ? 'bg-brand-green text-black font-extrabold' : 'text-slate-400'}" data-tab="report">İstatistikler</button>
                            <button class="detail-tab-btn flex-1 py-1.5 rounded-lg text-center transition-all ${this.activeTab === 'ratings' ? 'bg-brand-green text-black font-extrabold' : 'text-slate-400'}" data-tab="ratings">Zaman Tüneli</button>
                        ` : ''}
                    </div>
                </div>

                <!-- DYNAMIC TAB CONTENT -->
                <div id="detail-tab-content" class="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
                    <!-- Loaded dynamically based on selected tab -->
                </div>

            </div>
        `;

        // Slide modal in by adding active class
        this.modal.classList.add('active');

        // Setup countdown interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        if (!isFinished && !isLive) {
            const updateCountdown = () => {
                const timerEl = document.getElementById('match-countdown-timer');
                const spanEl = document.getElementById('match-countdown-span');
                const iconEl = document.getElementById('match-countdown-icon');
                if (!timerEl || !spanEl) {
                    clearInterval(this.countdownInterval);
                    return;
                }

                const now = Date.now();
                const diff = lockTime - now;

                if (diff <= 0) {
                    timerEl.className = "mt-4 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-950/20 text-red-500 font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-inner";
                    spanEl.textContent = "TAHMİNLER KAPANDI 🔐";
                    if (iconEl) {
                        iconEl.setAttribute('data-lucide', 'lock');
                        iconEl.className = 'w-3.5 h-3.5 text-red-500';
                    }
                    
                    // Enforce lock in UI dynamically
                    const leftSlider = document.getElementById('score-slider-left');
                    if (leftSlider && !leftSlider.disabled) {
                        // Re-render tab content to reflect newly locked state
                        this.renderTabContent(match, pred, opinion, index, isLocked, isFinished, appliedJoker, homeScore, awayScore, homeScoreAlt, awayScoreAlt);
                    }
                    clearInterval(this.countdownInterval);
                    if (window.lucide) window.lucide.createIcons();
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                let displayStr = '';
                if (days > 0) displayStr += `${days}g `;
                if (days > 0 || hours > 0) displayStr += `${hours}s `;
                displayStr += `${minutes}dk ${seconds}sn`;

                spanEl.textContent = `KAPANIŞA: ${displayStr}`;

                // Dynamic colors based on time remaining
                if (diff <= 60 * 60 * 1000) { // under 1 hour
                    timerEl.className = "mt-4 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-inner transition-all duration-300 text-red-500 border-red-500/30 bg-red-950/20 shadow-neon-red animate-pulse";
                    if (iconEl) iconEl.className = "w-3.5 h-3.5 text-red-500";
                } else if (diff <= 24 * 60 * 60 * 1000) { // under 24 hours
                    timerEl.className = "mt-4 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-inner transition-all duration-300 text-brand-gold border-brand-gold/30 bg-brand-gold/5";
                    if (iconEl) iconEl.className = "w-3.5 h-3.5 text-brand-gold";
                } else {
                    timerEl.className = "mt-4 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-inner transition-all duration-300 text-slate-300 border-white/10 bg-black/50";
                    if (iconEl) iconEl.className = "w-3.5 h-3.5 text-slate-400";
                }
            };
            
            updateCountdown();
            this.countdownInterval = setInterval(updateCountdown, 1000);
        }

        // Bind overlay controls
        document.getElementById('close-detail-btn').addEventListener('click', () => {
            window.history.back();
        });

        // Bind Joker Cancel Banner
        const cancelBanner = document.getElementById('joker-cancel-banner');
        if (cancelBanner) {
            cancelBanner.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (isLocked) {
                    alert("Kilitlenmiş tahminlere uygulanan jokerleri iptal edemezsiniz! Önce kilidi açınız.");
                    return;
                }
                if (confirm("Bu maça uyguladığınız jokeri iptal etmek istediğinize emin misiniz?")) {
                    const updatedPred = {
                        ...pred,
                        appliedJoker: null
                    };
                    if (updatedPred.homeScorePredAlt !== undefined) delete updatedPred.homeScorePredAlt;
                    if (updatedPred.awayScorePredAlt !== undefined) delete updatedPred.awayScorePredAlt;
                    if (updatedPred.targetUserId !== undefined) delete updatedPred.targetUserId;
                    
                    await savePrediction(updatedPred);
                    alert("Joker başarıyla iptal edildi ve cüzdanınıza geri yüklendi!");
                    
                    // Refresh modal in place
                    this.openMatchDetail(match, index, null, true);
                    this.appState.refreshDashboard();
                }
            });
        }

        // Initialize and render default tab
        this.renderTabContent(match, pred, opinion, index, isLocked, isFinished, appliedJoker, homeScore, awayScore, homeScoreAlt, awayScoreAlt);
        
        // Tab buttons click triggers
        this.modal.querySelectorAll('.detail-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                
                // Toggle active style on tab headers
                this.modal.querySelectorAll('.detail-tab-btn').forEach(b => {
                    b.classList.remove('bg-brand-green', 'text-black', 'font-extrabold');
                    b.classList.add('text-slate-400');
                });
                btn.classList.add('bg-brand-green', 'text-black', 'font-extrabold');
                btn.classList.remove('text-slate-400');

                this.renderTabContent(match, pred, opinion, index, isLocked, isFinished, appliedJoker, homeScore, awayScore, homeScoreAlt, awayScoreAlt);
            });
        });
    }

    async renderTabContent(match, pred, opinion, index, isLocked, isFinished, appliedJoker, homeScore, awayScore, homeScoreAlt, awayScoreAlt) {
        const contentContainer = document.getElementById('detail-tab-content');
        if (!contentContainer) return;

        contentContainer.innerHTML = '';

        const matchTime = new Date(match.date).getTime();
        const lockTime = matchTime - 15 * 60 * 1000;
        const isTimeLocked = (Date.now() >= lockTime) && !match.adminUnlocked;
        const isInputDisabled = isLocked || isFinished || isTimeLocked;

        if (this.activeTab === 'predictions') {
            // Predictor Inputs (Flag Buttons + Soccer Ball Range Sliders)
            contentContainer.innerHTML = `
                <!-- 1. KIM KAZANIR - GLOWING FLAG BUTTONS -->
                <div class="flex flex-col gap-2 bg-slate-950/40 border border-white/5 rounded-3xl p-4">
                    <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest text-center mb-1">KİM KAZANIR TAHMİNİ</span>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Home Flag Button -->
                        <button id="flag-btn-home" class="flex flex-col items-center justify-center transition-all duration-300 relative bg-transparent border-none outline-none p-2" type="button" ${isInputDisabled ? 'disabled' : ''} style="--flag-glow-color: rgba(6, 182, 212, 0.75);">
                            <div class="w-24 h-16 rounded overflow-hidden relative z-10 transition-transform duration-300 waving-flag">
                                <img src="${match.homeFlag}" alt="${match.homeTeam}" class="w-full h-full object-cover">
                            </div>
                            <span class="text-xs font-outfit font-black text-white mt-3.5 relative z-10 tracking-wider">${match.homeTeam.toUpperCase()}</span>
                        </button>

                        <!-- Away Flag Button -->
                        <button id="flag-btn-away" class="flex flex-col items-center justify-center transition-all duration-300 relative bg-transparent border-none outline-none p-2" type="button" ${isInputDisabled ? 'disabled' : ''} style="--flag-glow-color: rgba(236, 72, 153, 0.75);">
                            <div class="w-24 h-16 rounded overflow-hidden relative z-10 transition-transform duration-300 waving-flag">
                                <img src="${match.awayFlag}" alt="${match.awayTeam}" class="w-full h-full object-cover">
                            </div>
                            <span class="text-xs font-outfit font-black text-white mt-3.5 relative z-10 tracking-wider">${match.awayTeam.toUpperCase()}</span>
                        </button>
                    </div>
                </div>

                <!-- 2. SKOR TAHMİNİ - SOCCER BALL SLIDERS -->
                <div class="flex flex-col gap-3 bg-slate-950/40 border border-white/5 rounded-3xl p-5">
                    <span class="text-[9px] font-black text-brand-cyan uppercase tracking-widest text-center mb-1">SKOR TAHMİNİ (KAYDIRIN ⚽)</span>
                    
                    <!-- Neon score display -->
                    <div class="flex items-center justify-center gap-3.5 my-1">
                        <div class="flex-1 text-right min-w-[70px] max-w-[100px] truncate">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${match.homeTeam}</span>
                        </div>
                        
                        <div class="bg-black/60 border border-brand-cyan/25 px-4.5 py-1.5 rounded-2xl flex items-center justify-center shadow-lg relative min-w-[85px]">
                            <span id="slider-home-score-display" class="text-xl font-outfit font-black text-white leading-none">0</span>
                            <span class="text-slate-600 font-bold mx-2 text-sm leading-none">:</span>
                            <span id="slider-away-score-display" class="text-xl font-outfit font-black text-white leading-none">0</span>
                        </div>

                        <div class="flex-1 text-left min-w-[70px] max-w-[100px] truncate">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${match.awayTeam}</span>
                        </div>
                    </div>

                    <!-- Double Slider Container -->
                    <div class="slider-container mt-2">
                        <!-- Background track -->
                        <div class="score-slider-track" style="--home-color: #06b6d4; --away-color: #ec4899;"></div>
                        
                        <!-- Left Slider (Home score, RTL) -->
                        <input type="range" id="score-slider-left" min="0" max="6" value="${homeScore}" class="score-slider slider-left" dir="rtl" ${isInputDisabled ? 'disabled' : ''}>
                        
                        <!-- Right Slider (Away score, LTR) -->
                        <input type="range" id="score-slider-right" min="0" max="6" value="${awayScore}" class="score-slider slider-right" dir="ltr" ${isInputDisabled ? 'disabled' : ''}>
                    </div>
                    
                    <div class="flex justify-between items-center px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        <span>← Sol Bayrağa Çek (${match.homeTeam} Gol)</span>
                        <span>(${match.awayTeam} Gol) Sağ Bayrağa Çek →</span>
                    </div>

                    <!-- Double Chance Alternative Score Input Panel (Only if Joker Double Chance is active!) -->
                    ${appliedJoker === 'ciftesans' ? `
                        <div class="w-full border-t border-white/5 pt-3.5 mt-2 flex flex-col items-center gap-2">
                            <span class="text-[9px] font-black text-brand-cyan tracking-wider uppercase">Çifte Şans Alternatif Skoru (2. Skor)</span>
                            <div class="flex items-center gap-4 justify-center">
                                <div class="flex items-center gap-1.5">
                                    <button class="stepper-minus-home-alt w-7 h-7 rounded bg-brand-cyan/15 hover:bg-brand-cyan/25 flex items-center justify-center font-bold text-brand-cyan text-xs" ${isInputDisabled ? 'disabled' : ''}>-</button>
                                    <span id="detail-home-score-alt" class="text-sm font-outfit font-extrabold text-brand-cyan w-4 text-center">${homeScoreAlt}</span>
                                    <button class="stepper-plus-home-alt w-7 h-7 rounded bg-brand-cyan/15 hover:bg-brand-cyan/25 flex items-center justify-center font-bold text-brand-cyan text-xs" ${isInputDisabled ? 'disabled' : ''}>+</button>
                                </div>
                                <span class="text-[10px] text-slate-500 font-bold">veya</span>
                                <div class="flex items-center gap-1.5">
                                    <button class="stepper-minus-away-alt w-7 h-7 rounded bg-brand-cyan/15 hover:bg-brand-cyan/25 flex items-center justify-center font-bold text-brand-cyan text-xs" ${isInputDisabled ? 'disabled' : ''}>-</button>
                                    <span id="detail-away-score-alt" class="text-sm font-outfit font-extrabold text-brand-cyan w-4 text-center">${awayScoreAlt}</span>
                                    <button class="stepper-plus-away-alt w-7 h-7 rounded bg-brand-cyan/15 hover:bg-brand-cyan/25 flex items-center justify-center font-bold text-brand-cyan text-xs" ${isInputDisabled ? 'disabled' : ''}>+</button>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Ready quick scores selection -->
                    ${!isInputDisabled ? `
                        <div class="flex items-center justify-between w-full mt-2.5 gap-1.5">
                            ${['0-0', '1-1', '2-1', '1-0', '2-0', '3-1'].map(s => `
                                <button class="quick-score-btn flex-1 py-1.5 rounded bg-white/5 hover:bg-brand-green/20 hover:text-brand-green text-[9px] font-bold text-slate-400 border border-white/5 transition-all" data-score="${s}" type="button">${s}</button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Lock Button ("Meydana Oku") -->
                <div class="mt-2">
                    <button id="detail-lock-btn" class="w-full py-3 rounded-xl font-outfit font-black tracking-widest text-xs uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 duration-200 border ${
                        (isFinished || isTimeLocked) ? 'bg-slate-900 border-white/5 text-slate-500 cursor-not-allowed' : 
                        (isLocked ? 'bg-brand-green/15 border-brand-green/30 text-brand-green shadow-neon-green hover:bg-brand-green/25' : 
                        'bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green/90 hover:to-brand-blue/90 text-white shadow-neon-cyan border-none')
                    }" ${(isFinished || isTimeLocked) ? 'disabled' : ''}>
                        <i data-lucide="${(isFinished || isTimeLocked) ? 'ban' : (isLocked ? 'lock' : 'sword')}" class="w-4 h-4 ${!isLocked && !(isFinished || isTimeLocked) ? 'animate-bounce' : ''}"></i>
                        ${(isFinished || isTimeLocked) ? 'Tahmin Süresi Doldu' : (isLocked ? 'Tahmin Kilitlendi 🔐 (Düzenle)' : 'MEYDANA OKU ⚔️')}
                    </button>
                    <p class="text-[8px] text-slate-500 text-center italic mt-1.5 leading-tight">
                        ${(isFinished || isTimeLocked) ? '* Bu maçın tahmin süresi dolmuştur.' : '* Seçiminizi tamamladıktan sonra kilitlemek için MEYDANA OKU ⚔️ butonuna basınız. Maç başlamadan 15 dakika önce otomatik kilitlenir.'}
                    </p>
                </div>
            `;

            // Active score tracker inside detailed overlay tab scope
            let activeHome = homeScore;
            let activeAway = awayScore;
            let activeHomeAlt = homeScoreAlt;
            let activeAwayAlt = awayScoreAlt;
            let activeLocked = isLocked;
            
            // Dummy sideAnswers to satisfy database structure/recalculation safely
            const sideAnswers = {
                htResult: "draw",
                firstScorer: "Diğer",
                redCard: false,
                cornersOverUnder: "under"
            };

            const updateVisuals = () => {
                const homeDisplay = document.getElementById('slider-home-score-display');
                const awayDisplay = document.getElementById('slider-away-score-display');
                const homeAltEl = document.getElementById('detail-home-score-alt');
                const awayAltEl = document.getElementById('detail-away-score-alt');
                
                const leftSlider = document.getElementById('score-slider-left');
                const rightSlider = document.getElementById('score-slider-right');
                
                const flagHome = document.getElementById('flag-btn-home');
                const flagAway = document.getElementById('flag-btn-away');
                
                // Update displays
                if (homeDisplay) homeDisplay.textContent = activeHome;
                if (awayDisplay) awayDisplay.textContent = activeAway;
                if (homeAltEl) homeAltEl.textContent = activeHomeAlt;
                if (awayAltEl) awayAltEl.textContent = activeAwayAlt;
                
                // Sync sliders if needed
                if (leftSlider && parseInt(leftSlider.value) !== activeHome) {
                    leftSlider.value = activeHome;
                }
                if (rightSlider && parseInt(rightSlider.value) !== activeAway) {
                    rightSlider.value = activeAway;
                }
                
                // Sync Glowing/Waving Flags
                if (flagHome && flagAway) {
                    if (activeHome > activeAway) {
                        flagHome.className = flagHome.className.replace('flag-btn-dimmed', '').replace('flag-btn-active', '').trim() + ' flag-btn-active';
                        flagAway.className = flagAway.className.replace('flag-btn-active', '').replace('flag-btn-dimmed', '').trim() + ' flag-btn-dimmed';
                    } else if (activeHome < activeAway) {
                        flagAway.className = flagAway.className.replace('flag-btn-dimmed', '').replace('flag-btn-active', '').trim() + ' flag-btn-active';
                        flagHome.className = flagHome.className.replace('flag-btn-active', '').replace('flag-btn-dimmed', '').trim() + ' flag-btn-dimmed';
                    } else {
                        // Draw: Both flags glow and wave!
                        flagHome.className = flagHome.className.replace('flag-btn-dimmed', '').replace('flag-btn-active', '').trim() + ' flag-btn-active';
                        flagAway.className = flagAway.className.replace('flag-btn-dimmed', '').replace('flag-btn-active', '').trim() + ' flag-btn-active';
                    }
                }
            };

            // Bind Sliders input events
            const leftSlider = document.getElementById('score-slider-left');
            const rightSlider = document.getElementById('score-slider-right');
            
            if (leftSlider) {
                leftSlider.addEventListener('input', (e) => {
                    activeHome = parseInt(e.target.value) || 0;
                    updateVisuals();
                });
            }
            if (rightSlider) {
                rightSlider.addEventListener('input', (e) => {
                    activeAway = parseInt(e.target.value) || 0;
                    updateVisuals();
                });
            }

            // Bind Glowing Flag Buttons
            const flagHome = document.getElementById('flag-btn-home');
            const flagAway = document.getElementById('flag-btn-away');
            
            if (flagHome) {
                flagHome.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isInputDisabled) return;
                    
                    // If already Home win, toggle to Draw (0-0)
                    if (activeHome > activeAway) {
                        activeHome = 0;
                        activeAway = 0;
                    } else {
                        // Set to 1-0 win
                        activeHome = 1;
                        activeAway = 0;
                    }
                    updateVisuals();
                });
            }

            if (flagAway) {
                flagAway.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isInputDisabled) return;
                    
                    // If already Away win, toggle to Draw (0-0)
                    if (activeAway > activeHome) {
                        activeHome = 0;
                        activeAway = 0;
                    } else {
                        // Set to 0-1 win
                        activeHome = 0;
                        activeAway = 1;
                    }
                    updateVisuals();
                });
            }

            // Bind Steppers Click handlers for Double Chance alternative score only
            const addAltStepper = (btnClass, increment, isHome) => {
                const btn = contentContainer.querySelector(btnClass);
                if (!btn) return;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isInputDisabled) return;
                    if (isHome) {
                        activeHomeAlt = Math.max(0, activeHomeAlt + increment);
                    } else {
                        activeAwayAlt = Math.max(0, activeAwayAlt + increment);
                    }
                    updateVisuals();
                });
            };

            addAltStepper('.stepper-plus-home-alt', 1, true);
            addAltStepper('.stepper-minus-home-alt', -1, true);
            addAltStepper('.stepper-plus-away-alt', 1, false);
            addAltStepper('.stepper-minus-away-alt', -1, false);

            // Bind Quick Picks score buttons
            contentContainer.querySelectorAll('.quick-score-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isInputDisabled) return;
                    const [h, a] = btn.dataset.score.split('-').map(Number);
                    activeHome = h;
                    activeAway = a;
                    updateVisuals();
                });
            });

            // Initialize visuals immediately
            updateVisuals();

            // Bind Lock Button Click
            const lockBtn = document.getElementById('detail-lock-btn');
            lockBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (match.status === 'FINISHED' || isTimeLocked) return;

                activeLocked = !activeLocked;

                const predObject = {
                    userId: this.appState.activeUser.id,
                    matchId: match.id,
                    homeScorePred: activeHome,
                    awayScorePred: activeAway,
                    sideAnswers: { ...sideAnswers },
                    appliedJoker: appliedJoker,
                    isLocked: activeLocked
                };

                if (appliedJoker === 'ciftesans') {
                    predObject.homeScorePredAlt = activeHomeAlt;
                    predObject.awayScorePredAlt = activeAwayAlt;
                }

                // Preserve targetUserId for sabotage joker
                if (pred && pred.targetUserId) {
                    predObject.targetUserId = pred.targetUserId;
                }

                await savePrediction(predObject);

                if (activeLocked) {
                    this.triggerConfetti(lockBtn);
                }

                // Refresh dashboard and modal in place instead of going back
                setTimeout(() => {
                    this.openMatchDetail(match, index, null, true);
                    this.appState.refreshDashboard();
                }, activeLocked ? 1000 : 0);
            });
        } 
        
        else if (this.activeTab === 'opinion') {
            // Fetch all predictions for this match and all users
            const allMatchPreds = await getPredictions(null, match.id);
            const users = await getUsers();
            
            // Build the list of predictions by other users
            let usersPredsHtml = '';
            
            // Filter predictions by other users
            const otherPreds = allMatchPreds.filter(p => p.userId !== this.appState.activeUser.id);
            
            otherPreds.forEach(p => {
                const user = users.find(u => u.id === p.userId);
                if (!user) return;
                
                const initials = user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
                
                let badgeText = "Tahminci ⚽";
                let badgeClass = "user-badge-member";
                if (user.badge === "kahin") {
                    badgeText = "Kâhin 🏆";
                    badgeClass = "user-badge-kahin animate-pulse";
                } else if (user.badge === "aglayan") {
                    badgeText = "Ağlayan 😢";
                    badgeClass = "user-badge-aglayan";
                }
                
                let predText = `${p.homeScorePred} - ${p.awayScorePred}`;
                let jokerLabel = '';
                if (p.appliedJoker) {
                    if (p.appliedJoker === 'ciftesans') {
                        predText = `${p.homeScorePred}-${p.awayScorePred} veya ${p.homeScorePredAlt}-${p.awayScorePredAlt}`;
                        jokerLabel = `<span class="text-[8px] font-black text-slate-900 bg-brand-cyan px-2 py-0.5 rounded-full uppercase tracking-wider">🎲 Çifte Şans</span>`;
                    } else if (p.appliedJoker === 'doublepuan') {
                        jokerLabel = `<span class="text-[8px] font-black text-black bg-brand-gold px-2 py-0.5 rounded-full uppercase tracking-wider">⚡ Double Puan</span>`;
                    } else if (p.appliedJoker === 'allin') {
                        jokerLabel = `<span class="text-[8px] font-black text-white bg-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">☠️ Hep ya da Hiç</span>`;
                    } else if (p.appliedJoker === 'doksanarti') {
                        jokerLabel = `<span class="text-[8px] font-black text-white bg-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-wider">⏰ 90+ Gol</span>`;
                    }
                }
                
                usersPredsHtml += `
                    <div class="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                        <div class="flex items-center gap-3">
                            <!-- User Avatar -->
                            <div class="w-8 h-8 rounded-xl ${user.avatar || 'bg-gradient-to-tr from-cyan-500 to-blue-500'} flex items-center justify-center text-white font-outfit font-black text-xs border border-white/10 shadow-md">
                                ${initials}
                            </div>
                            <!-- User Info -->
                            <div class="flex flex-col text-left">
                                <span class="text-[11px] font-outfit font-black text-slate-200 uppercase tracking-tight">${user.name}</span>
                                <span class="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.25 rounded border mt-0.5 ${badgeClass} w-max scale-90 origin-left">
                                    ${badgeText}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Prediction -->
                        <div class="flex flex-col items-end gap-1">
                            <span class="text-xs font-outfit font-black text-brand-green tracking-widest">${predText}</span>
                            ${jokerLabel}
                        </div>
                    </div>
                `;
            });
            
            if (!usersPredsHtml) {
                usersPredsHtml = `<div class="text-center py-6 text-[10px] text-slate-500 italic uppercase font-black tracking-widest">Diğer kullanıcılardan tahmin bulunmamaktadır.</div>`;
            }

            // Render Opinion Bar Chart and beautiful list
            contentContainer.innerHTML = `
                <div class="flex flex-col gap-4 bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-center">
                    <span class="text-[9px] font-black text-brand-green uppercase tracking-widest">Kamuoyu Görüş Dağılımı</span>
                    
                    <div class="flex flex-col gap-3 w-full bg-black/45 p-4 rounded-xl border border-white/5 mt-1 text-left">
                        <div class="flex justify-between items-center text-[10px] font-bold">
                            <span class="text-brand-cyan">${match.homeTeam} (${opinion.home}%)</span>
                            <span class="text-slate-500">Beraberlik (${opinion.draw}%)</span>
                            <span class="text-brand-neonPink">${match.awayTeam} (${opinion.away}%)</span>
                        </div>
                        <div class="w-full h-2.5 rounded-full flex overflow-hidden bg-slate-950 border border-white/5 shadow-inner">
                            <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style="width: ${opinion.home}%"></div>
                            <div class="h-full bg-slate-600 transition-all duration-500" style="width: ${opinion.draw}%"></div>
                            <div class="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500" style="width: ${opinion.away}%"></div>
                        </div>
                    </div>
                    
                    <!-- USER PREDICTIONS LIST -->
                    <div class="flex flex-col gap-2 text-left mt-2">
                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">Diğer Kahinlerin Tahminleri</span>
                        <div class="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                            ${usersPredsHtml}
                        </div>
                    </div>
                </div>
            `;
        } 
        
        else if (this.activeTab === 'admin') {
            const helper = getMatchDetailsHelper(match.homeTeam, match.awayTeam, match.group, this.appState.matches);
            
            const getFormBadges = (formArray) => {
                return formArray.map(f => {
                    let colorClass = "bg-slate-700 text-slate-300";
                    if (f === "W") colorClass = "bg-green-500/20 text-brand-green border border-green-500/30";
                    else if (f === "L") colorClass = "bg-red-500/20 text-brand-red border border-red-500/30";
                    else if (f === "D") colorClass = "bg-slate-500/20 text-slate-400 border border-slate-500/30";
                    return `<span class="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${colorClass}">${f}</span>`;
                }).join('');
            };

            contentContainer.innerHTML = `
                <div class="flex flex-col gap-4">
                    
                    <!-- 1. STADIUM & LOCATION CARD -->
                    <div class="bg-slate-950/50 border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
                            <i data-lucide="map-pin" class="w-5 h-5"></i>
                        </div>
                        <div class="flex flex-col text-left">
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">STADYUM & ŞEHİR</span>
                            <span class="text-xs font-outfit font-black text-slate-200 mt-1 leading-snug">${helper.stadium}</span>
                        </div>
                    </div>

                    <!-- 2. FORM & WIN PROBABILITY -->
                    <div class="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3.5">
                        <span class="text-[9px] font-black text-brand-cyan uppercase tracking-widest text-left">Takım Formları & Kazanma İhtimali</span>
                        
                        <!-- Form Guide -->
                        <div class="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <div class="flex flex-col gap-1.5 items-start">
                                <span class="text-[8px] uppercase tracking-wider">${match.homeTeam} Form:</span>
                                <div class="flex gap-1">${getFormBadges(helper.homeForm)}</div>
                            </div>
                            <div class="flex flex-col gap-1.5 items-end">
                                <span class="text-[8px] uppercase tracking-wider">${match.awayTeam} Form:</span>
                                <div class="flex gap-1">${getFormBadges(helper.awayForm)}</div>
                            </div>
                        </div>
                        
                        <!-- H2H Probability Bar -->
                        <div class="flex flex-col gap-1.5 mt-1">
                            <div class="flex justify-between items-center text-[9px] font-black">
                                <span class="text-brand-cyan">%${helper.homeWinProb} Ev Sahibi</span>
                                <span class="text-slate-500">%${helper.drawProb} Beraberlik</span>
                                <span class="text-brand-neonPink">%${helper.awayWinProb} Deplasman</span>
                            </div>
                            <div class="w-full h-2.5 rounded-full flex overflow-hidden bg-slate-950 border border-white/5 shadow-inner">
                                <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style="width: ${helper.homeWinProb}%"></div>
                                <div class="h-full bg-slate-700 transition-all" style="width: ${helper.drawProb}%"></div>
                                <div class="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all" style="width: ${helper.awayWinProb}%"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. STAR PLAYERS DUEL -->
                    <div class="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                        <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest text-left">Gözler Üzerinde: Yıldızlar Düellosu ⚔️</span>
                        
                        <div class="grid grid-cols-2 gap-3 mt-1">
                            <!-- Home Star -->
                            <div class="bg-black/35 border border-white/5 p-3 rounded-xl flex items-center gap-2.5 relative overflow-hidden">
                                <div class="absolute -top-6 -right-6 w-12 h-12 bg-brand-cyan/5 blur-[10px] rounded-full"></div>
                                <div class="w-9 h-9 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex flex-col items-center justify-center shrink-0">
                                    <span class="text-[7px] font-bold text-brand-cyan uppercase leading-none">${helper.homeStar.pos}</span>
                                    <span class="text-xs font-outfit font-black text-brand-cyan mt-0.5 leading-none">${helper.homeStar.rating}</span>
                                </div>
                                <div class="flex flex-col text-left truncate">
                                    <span class="text-[10px] font-outfit font-black text-slate-200 truncate uppercase leading-tight">${helper.homeStar.name}</span>
                                    <span class="text-[8px] text-slate-400 truncate mt-0.5 leading-none">${helper.homeStar.club}</span>
                                </div>
                            </div>

                            <!-- Away Star -->
                            <div class="bg-black/35 border border-white/5 p-3 rounded-xl flex items-center gap-2.5 relative overflow-hidden">
                                <div class="absolute -top-6 -right-6 w-12 h-12 bg-brand-neonPink/5 blur-[10px] rounded-full"></div>
                                <div class="w-9 h-9 rounded-lg bg-brand-neonPink/10 border border-brand-neonPink/20 flex flex-col items-center justify-center shrink-0">
                                    <span class="text-[7px] font-bold text-brand-neonPink uppercase leading-none">${helper.awayStar.pos}</span>
                                    <span class="text-xs font-outfit font-black text-brand-neonPink mt-0.5 leading-none">${helper.awayStar.rating}</span>
                                </div>
                                <div class="flex flex-col text-left truncate">
                                    <span class="text-[10px] font-outfit font-black text-slate-200 truncate uppercase leading-tight">${helper.awayStar.name}</span>
                                    <span class="text-[8px] text-slate-400 truncate mt-0.5 leading-none">${helper.awayStar.club}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. OFFICIAL ANALYSIS COMMENTARY -->
                    <div class="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                        <span class="text-[9px] font-black text-brand-green uppercase tracking-widest text-left">Resmi Analiz & Taktik Detayları</span>
                        
                        <div class="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-4 flex gap-3 text-left">
                            <span class="text-2xl shrink-0">🎙️</span>
                            <div>
                                <h4 class="text-[8px] font-outfit font-black text-brand-green uppercase tracking-widest leading-none">Yorumcu Değerlendirmesi</h4>
                                <p class="text-xs text-slate-300 leading-relaxed mt-2.5 font-medium">${match.analysis || 'Bu karşılaşma için resmi değerlendirme henüz yayınlanmadı.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'report') {
            // ====== MATCH REPORT TAB - STATISTICS ONLY ======
            const stats = match.statistics || [];

            // === STATISTICS SECTION ===
            let statsHtml = '';
            if (stats && stats.length > 0) {
                const statNameMap = {
                    'expected goals (xg)': 'Beklenen Gol (xG)',
                    'xg on target (xgot)': 'Kaleyi Bulan Beklenen Gol (xGOT)',
                    'ball possession': 'Topla Oynama',
                    'possession': 'Topla Oynama',
                    'total shots': 'Toplam Şut',
                    'shots on target': 'Kaleyi Bulan Şut',
                    'shots off target': 'Kale Dışı Şut',
                    'blocked shots': 'Engellenen Şut',
                    'shots inside the box': 'Ceza Sahası İçi Şutlar',
                    'shots outside the box': 'Ceza Sahası Dışı Şutlar',
                    'hit woodwork': 'Direkten Dönen Top',
                    'hit the woodwork': 'Direkten Dönen Top',
                    'big chances': 'Net Gol Fırsatı',
                    'big chances missed': 'Kaçan Net Fırsat',
                    'corners': 'Köşe Vuruşları (Korner)',
                    'corner kicks': 'Köşe Vuruşları (Korner)',
                    'passes': 'Paslar',
                    'total passes': 'Toplam Pas',
                    'accurate passes': 'İsabetli Pas',
                    'long balls': 'Uzun Toplar',
                    'long passes': 'Uzun Paslar',
                    'crosses': 'Ortalar',
                    'passes in final third': '3. Bölgede Paslar',
                    'accurate through passes': 'İsabetli Ara Paslar',
                    'tackles': 'Müdahale',
                    'interceptions': 'Top Kapma',
                    'clearances': 'Uzaklaştırma',
                    'fouls': 'Faul',
                    'offsides': 'Ofsayt',
                    'yellow cards': 'Sarı Kart',
                    'red cards': 'Kırmızı Kart',
                    'free kicks': 'Serbest Vuruş',
                    'goal kicks': 'Kale Vuruşu',
                    'throw-ins': 'Taç Atışı',
                    'throw ins': 'Taç Atışı',
                    'counter attacks': 'Kontra Ataklar',
                    'saves': 'Kurtarışlar',
                    'goalkeeper saves': 'Kaleci Kurtarışları',
                    'expected assists (xa)': 'Beklenen Asist (xA)',
                    'duels won': 'Kazanılan İkili Mücadeleler',
                    'errors leading to shot': 'Şutla Sonuçlanan Hatalar',
                    'errors leading to goal': 'Golle Sonuçlanan Hatalar',
                    'xgot faced': 'Karşılaşılan xGOT',
                    'goals prevented': 'Önlenen Goller',
                    'touches in opposition box': 'Rakip Ceza Sahasında Topla Buluşma'
                };

                const fullMatchGroup = stats.find(g => g.period === 'Match') || stats[0];
                if (fullMatchGroup) {
                    const items = fullMatchGroup.statisticsItems || [];
                    const seenStats = new Set();
                    items.forEach(item => {
                        const cleanName = item.name.toLowerCase().trim();
                        if (seenStats.has(cleanName)) return; // Deduplicate!
                        seenStats.add(cleanName);

                        const label = statNameMap[cleanName] || item.name;
                        const homeVal = item.homeValue !== undefined ? item.homeValue : parseInt(item.home) || 0;
                        const awayVal = item.awayValue !== undefined ? item.awayValue : parseInt(item.away) || 0;
                        const maxVal = Math.max(homeVal, awayVal, 1);
                        const homePct = (homeVal / maxVal) * 100;
                        const awayPct = (awayVal / maxVal) * 100;
                        const homeWin = homeVal > awayVal;
                        const awayWin = awayVal > homeVal;

                        statsHtml += `
                            <div class="stat-row-item flex flex-col gap-2 py-3 border-b border-white/[0.03] last:border-b-0">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-outfit font-black ${homeWin ? 'text-brand-cyan' : 'text-slate-400'} tabular-nums min-w-[40px]">${item.home || homeVal}</span>
                                    <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center flex-1">${label}</span>
                                    <span class="text-sm font-outfit font-black ${awayWin ? 'text-brand-neonPink' : 'text-slate-400'} tabular-nums min-w-[40px] text-right">${item.away || awayVal}</span>
                                </div>
                                <div class="flex items-center gap-1.5 h-3.5">
                                    <div class="flex-1 flex justify-end">
                                        <div class="h-full rounded-l-full neon-bar-animate ${homeWin ? 'neon-bar-home-win' : 'neon-bar-neutral'}" style="width: ${homePct}%; min-width: 6px;"></div>
                                    </div>
                                    <div class="w-0.5 h-5 rounded-full bg-slate-500/30"></div>
                                    <div class="flex-1">
                                        <div class="h-full rounded-r-full neon-bar-animate ${awayWin ? 'neon-bar-away-win' : 'neon-bar-neutral'}" style="width: ${awayPct}%; min-width: 6px;"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
            } else {
                statsHtml = '<div class="text-center py-6 text-[10px] text-slate-500 italic uppercase font-black tracking-widest">Bu maç için istatistik verisi bulunmamaktadır.</div>';
            }

            contentContainer.innerHTML = `
                <!-- MATCH STATISTICS -->
                <div class="flex flex-col bg-slate-950/60 border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[9px] font-black text-brand-cyan uppercase tracking-widest flex items-center gap-1.5">
                            <i data-lucide="bar-chart-3" class="w-3.5 h-3.5"></i> Maç İstatistikleri
                        </span>
                    </div>
                    <div class="flex justify-between items-center pb-3 mb-2 border-b border-white/[0.06]">
                        <div class="flex items-center gap-2.5">
                            <img src="${match.homeFlag}" class="w-6 h-4 object-cover rounded shadow-md border border-white/10" alt="">
                            <span class="text-[11px] font-outfit font-black text-slate-200 uppercase tracking-wide">${match.homeTeam}</span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <span class="text-[11px] font-outfit font-black text-slate-200 uppercase tracking-wide">${match.awayTeam}</span>
                            <img src="${match.awayFlag}" class="w-6 h-4 object-cover rounded shadow-md border border-white/10" alt="">
                        </div>
                    </div>
                    ${statsHtml}
                </div>
            `;
        } else if (this.activeTab === 'ratings') {
            // ====== MATCH TIMELINE TAB (ZAMAN TÜNELİ) ======
            const incidents = match.incidents || [];

            // === TIMELINE SECTION ===
            let timelineHtml = '';
            if (incidents && incidents.length > 0) {
                const sortedIncidents = [...incidents].sort((a, b) => (a.time || 0) - (b.time || 0));

                sortedIncidents.forEach(inc => {
                    const minute = inc.time || 0;
                    const isHome = inc.isHome !== undefined ? inc.isHome : true;

                    if (inc.incidentType === 'period') {
                        timelineHtml += `
                            <div class="flex items-center gap-3 py-4 my-1">
                                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
                                <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-800/80 px-4 py-1.5 rounded-full border border-white/10 shadow-sm">${inc.text || `${minute}'`}</span>
                                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
                            </div>
                        `;
                        return;
                    }

                    let icon = '';
                    let eventColor = '';
                    let eventLabel = '';
                    let playerName = '';
                    let detail = '';
                    let nodeBorder = 'border-slate-600/60';
                    let nodeGlow = '';

                    if (inc.incidentType === 'goal') {
                        icon = '⚽';
                        eventColor = 'text-brand-green';
                        eventLabel = `${inc.homeScore} - ${inc.awayScore}`;
                        playerName = inc.player?.name || 'Bilinmeyen';
                        detail = translateCommentaryToTurkish(inc.description || '');
                        nodeBorder = 'border-brand-green/60';
                        nodeGlow = 'shadow-[0_0_14px_rgba(34,197,94,0.4)]';
                    } else if (inc.incidentType === 'card') {
                        if (inc.incidentClass === 'red') {
                            icon = '🟥';
                            eventColor = 'text-red-500';
                            nodeBorder = 'border-red-500/60';
                            nodeGlow = 'shadow-[0_0_14px_rgba(239,68,68,0.4)]';
                        } else if (inc.incidentClass === 'yellowRed') {
                            icon = '🟨🟥';
                            eventColor = 'text-orange-500';
                            nodeBorder = 'border-orange-500/60';
                            nodeGlow = 'shadow-[0_0_12px_rgba(249,115,22,0.3)]';
                        } else {
                            icon = '🟨';
                            eventColor = 'text-yellow-400';
                            nodeBorder = 'border-yellow-400/50';
                            nodeGlow = 'shadow-[0_0_10px_rgba(250,204,21,0.25)]';
                        }
                        playerName = inc.player?.name || 'Bilinmeyen';
                        detail = inc.reason || '';
                    } else if (inc.incidentType === 'substitution') {
                        icon = '🔄';
                        eventColor = 'text-brand-cyan';
                        playerName = inc.playerIn?.name || 'Bilinmeyen';
                        detail = `⬅ ${inc.playerOut?.name || ''}`;
                        nodeBorder = 'border-cyan-500/40';
                    } else {
                        return; // Skip unknown types
                    }

                    const alignHome = isHome;

                    // Build event content block
                    const eventContent = `
                        <div class="flex flex-col ${alignHome ? 'items-end text-right' : 'items-start text-left'}">
                            <div class="flex items-center gap-1.5 ${alignHome ? 'flex-row-reverse' : ''}">
                                <span class="text-[11px] font-outfit font-black text-white leading-tight">${playerName}</span>
                                <span class="text-[9px] font-black ${eventColor} bg-slate-800/80 px-1.5 py-0.5 rounded-md border border-white/5">${minute}'</span>
                            </div>
                            ${detail ? `<span class="text-[9px] text-slate-400 leading-tight mt-0.5">${detail}</span>` : ''}
                            ${eventLabel ? `<span class="text-[10px] font-outfit font-black ${eventColor} mt-0.5">${eventLabel}</span>` : ''}
                        </div>
                    `;

                    timelineHtml += `
                        <div class="flex items-stretch gap-0" style="min-height: 60px;">
                            <!-- Left Side (Home events) -->
                            <div class="flex-1 flex ${alignHome ? 'justify-end' : ''} items-center pr-3">
                                ${alignHome ? eventContent : ''}
                            </div>

                            <!-- Center Timeline Spine -->
                            <div class="flex flex-col items-center" style="width: 40px;">
                                <div class="w-0.5 flex-1 bg-gradient-to-b from-slate-700/40 to-slate-700/70 rounded-full"></div>
                                <div class="w-10 h-10 rounded-full bg-slate-900/90 border-2 ${nodeBorder} ${nodeGlow} flex items-center justify-center text-base shrink-0 backdrop-blur-sm">
                                    ${icon}
                                </div>
                                <div class="w-0.5 flex-1 bg-gradient-to-b from-slate-700/70 to-slate-700/40 rounded-full"></div>
                            </div>

                            <!-- Right Side (Away events) -->
                            <div class="flex-1 flex ${!alignHome ? 'justify-start' : ''} items-center pl-3">
                                ${!alignHome ? eventContent : ''}
                            </div>
                        </div>
                    `;
                });
            } else {
                timelineHtml = '<div class="text-center py-6 text-[10px] text-slate-500 italic uppercase font-black tracking-widest">Bu maç için zaman çizelgesi verisi bulunmamaktadır.</div>';
            }

            contentContainer.innerHTML = `
                <!-- MATCH TIMELINE -->
                <div class="flex flex-col gap-0 bg-slate-950/60 border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-[9px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-1.5">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i> Maç Zaman Tüneli
                        </span>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-1.5">
                                <img src="${match.homeFlag}" class="w-4 h-3 object-cover rounded border border-white/10" alt="">
                                <span class="text-[8px] text-slate-400 font-bold uppercase">Sol</span>
                            </div>
                            <div class="w-px h-3 bg-slate-600/40"></div>
                            <div class="flex items-center gap-1.5">
                                <span class="text-[8px] text-slate-400 font-bold uppercase">Sağ</span>
                                <img src="${match.awayFlag}" class="w-4 h-3 object-cover rounded border border-white/10" alt="">
                            </div>
                        </div>
                    </div>
                    ${timelineHtml}
                </div>
            `;
        }

        // Trigger lucide inside modal
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Helper functions for UI strings
    getJokerName(joker) {
        const names = {
            ciftesans: "Çifte Şans 🎲",
            doublepuan: "2x Kat Puan ⚡",
            allin: "Hep ya da Hiç ☠️",
            spy: "Casus 🕵️",
            doksanarti: "Doksan Artı ⏰",
            sabotaj: "Kilit/Sabotaj 🔒"
        };
        return names[joker] || joker;
    }

    getJokerGradient(joker) {
        const gradients = {
            ciftesans: "from-cyan-400 to-blue-500",
            doublepuan: "from-purple-400 to-indigo-500",
            allin: "from-yellow-400 to-amber-600",
            spy: "from-pink-400 to-rose-500",
            doksanarti: "from-green-400 to-emerald-500",
            sabotaj: "from-red-400 to-rose-600"
        };
        return gradients[joker] || "from-slate-400 to-slate-500";
    }

    getScorerOptions(match) {
        return ["Mbappé", "Vinícius Jr.", "Haaland", "Bellingham", "Kane", "Messi", "Musiala", "Neymar", "Ronaldo", "Lamine Yamal", "Wirtz", "Salah", "Diğer"];
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    calculatePublicOpinion(preds) {
        if (preds.length === 0) return { home: 33, draw: 34, away: 33 };
        
        let homeCount = 0;
        let drawCount = 0;
        let awayCount = 0;

        preds.forEach(p => {
            const h = p.homeScorePred;
            const a = p.awayScorePred;
            if (h > a) homeCount++;
            else if (h === a) drawCount++;
            else awayCount++;
        });

        const total = preds.length;
        return {
            home: Math.round((homeCount / total) * 100),
            draw: Math.round((drawCount / total) * 100),
            away: Math.round((awayCount / total) * 100)
        };
    }

    triggerConfetti(element) {
        const colors = ['#06b6d4', '#a855f7', '#ec4899', '#22c55e', '#eab308'];
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
            confetti.style.setProperty('--confetti-duration', (0.6 + Math.random() * 0.8) + 's');
            
            confetti.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 60) + 'px';
            confetti.style.top = (rect.top + (Math.random() - 0.5) * 20) + 'px';
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 1500);
        }
    }
}


