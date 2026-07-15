import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { CONFIG } from '../config.js';
import { getPlayers, getMatches, updateMatchDetails, recalculateAllUsersPoints } from '../firebase-db.js';

const app = initializeApp(CONFIG.FIREBASE_CONFIG);
const db = getFirestore(app);

const RAW_RATINGS_TEXT = `
1. Maç: Fransa vs. İspanya
Fransa (Sol Takım)
16 M. Maignan: 5.9
3 L. Digne: 5.6
17 W. Saliba: 6.1
4 D. Upamecano: 6.5
5 J. Koundé: 6.3
14 A. Rabiot: 6.5
8 A. Tchouaméni: 6.8
12 B. Barcola: 6.4
11 M. Olise: 6.4
7 O. Dembélé: 6.8
10 K. Mbappé: 6.3
Yedekler:
26 Maxence Lacroix: 6.5
6 Manu Koné: 6.1
20 Désiré Doué: 7.0
19 Theo Hernández: 6.5

İspanya (Sağ Takım)
23 U. Simón: 7.0
12 P. Porro: 8.1
22 P. Cubarsi: 7.4
14 A. Laporte: 7.2
24 M. Cucurella: 7.1
19 L. Yamal: 6.5
16 Rodri: 7.5
8 F. Ruiz: 6.9
21 M. Oyarzabal: 7.0
10 D. Olmo: 6.8
15 A. Baena: 6.7
Yedekler:
7 Ferran Torres: 6.5
6 Mikel Merino: 6.9
20 Pedri: 6.5
5 Marcos Llorente: 6.7

--------------------------------------------------

2. Maç: İngiltere vs. Arjantin
İngiltere (Sol Takım)
1 J. Pickford: 6.3
25 D. Spence: 6.7
6 Marc Guéhi: 6.4
5 J. Stones: 6.6
24 R. James: 6.8
8 E. Anderson: 7.2
4 D. Rice: 7.1
18 A. Gordon: 7.0
10 J. Bellingham: 6.6
17 M. Rogers: 7.1
9 H. Kane: 6.5
Yedekler:
2 Ezri Konsa: 6.0
3 Nico O'Reilly: 6.2
15 Dan Burn: 5.9
11 Marcus Rashford: 6.0
22 Ivan Toney: 6.0

Arjantin (Sağ Takım)
23 E. Martinez: 6.7
26 N. Molina: 6.1
13 C. Romero: 7.0
6 L. Martinez: 6.4
3 N. Tagliafico: 6.3
24 E. Fernández: 7.7
5 L. Paredes: 7.3
20 A. Mac Allister: 6.1
17 G. Simeone: 6.1
10 L. Messi: 8.0
9 J. Álvarez: 6.7
Yedekler:
15 Nicolás González: 6.7
19 Nicolás Otamendi: 6.9
4 Gonzalo Montiel: 6.4
7 Rodrigo De Paul: 7.1
22 Lautaro Martínez: 7.3
`;

function cleanString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/-/g, ' ')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ç/g, 'c')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeTeam(name) {
    if (!name) return "";
    const n = name.toLowerCase().trim();
    if (n.includes("spain") || n === "ispanya") return "İspanya";
    if (n.includes("france") || n === "fransa") return "Fransa";
    if (n.includes("argentina") || n === "arjantin") return "Arjantin";
    if (n.includes("england") || n === "ingiltere") return "İngiltere";
    return name;
}

const OVERRIDES = {
    "Fransa": {
        "M. Maignan": "Mike Maignan",
        "L. Digne": "Lucas Digne",
        "W. Saliba": "William Saliba",
        "A. Rabiot": "Adrien Rabiot",
        "D. Doue": "Désiré Doué",
        "M. Olise": "Michael Olise",
        "K. Mbappe": "Kylian Mbappé",
        "D. Upamecano": "Dayot Upamecano",
        "M. Kone": "Manu Koné",
        "O. Dembele": "Ousmane Dembélé",
        "J. Kounde": "Jules Koundé",
        "Bradley Barcola": "Bradley Barcola",
        "B. Barcola": "Bradley Barcola"
    },
    "İspanya": {
        "U. Simon": "Unai Simón",
        "U. Simón": "Unai Simón",
        "M. Cucurella": "Marc Cucurella",
        "A. Baena": "Álex Baena",
        "F. Ruiz": "Fabián Ruiz",
        "A. Laporte": "Aymeric Laporte",
        "P. Cubarsi": "Pau Cubarsí",
        "Rodri": "Rodri",
        "D. Olmo": "Dani Olmo",
        "M. Oyarzabal": "Mikel Oyarzabal",
        "L. Yamal": "Lamine Yamal",
        "P. Porro": "Pedro Porro",
        "Pedri": "Pedri",
        "Ferran Torres": "Ferran Torres",
        "Mikel Merino": "Mikel Merino",
        "Marcos Llorente": "Marcos Llorente"
    },
    "İngiltere": {
        "J. Pickford": "Jordan Pickford",
        "E. Konsa": "Ezri Konsa",
        "D. Rice": "Declan Rice",
        "J. Stones": "John Stones",
        "H. Kane": "Harry Kane",
        "J. Bellingham": "Jude Bellingham",
        "Marc Guéhi": "Marc Guéhi",
        "E. Anderson": "Elliot Anderson",
        "A. Gordon": "Anthony Gordon",
        "N. O'Reilly": "Nico O'Reilly",
        "Reece James": "Reece James",
        "R. James": "Reece James",
        "Djed Spence": "Djed Spence",
        "D. Spence": "Djed Spence",
        "M. Rogers": "Morgan Rogers",
        "Marcus Rogers": "Morgan Rogers"
    },
    "Arjantin": {
        "E. Martinez": "Emiliano Martínez",
        "N. Tagliafico": "Nicolás Tagliafico",
        "A. Mac Allister": "Alexis Mac Allister",
        "J. Alvarez": "Julián Álvarez",
        "J. Álvarez": "Julián Álvarez",
        "L. Martinez": "Lisandro Martínez",
        "L. Martínez": "Lisandro Martínez",
        "L. Paredes": "Leandro Paredes",
        "E. Fernandez": "Enzo Fernández",
        "E. Fernández": "Enzo Fernández",
        "L. Messi": "Lionel Messi",
        "C. Romero": "Cristian Romero",
        "R. De Paul": "Rodrigo De Paul",
        "N. Molina": "Nahuel Molina",
        "Nicolas Gonzalez": "Nicolás González",
        "Nicolás González": "Nicolás González",
        "Gonzalo Montiel": "Gonzalo Montiel",
        "Lautaro Martinez": "Lautaro Martínez",
        "Lautaro Martínez": "Lautaro Martínez",
        "G. Simeone": "Giuliano Simeone",
        "Giuliano Simeone": "Giuliano Simeone"
    }
};

function matchPlayer(parsedName, dbPlayersOnTeam) {
    const parsedClean = cleanString(parsedName);
    const parsedWords = parsedClean.split(' ').filter(Boolean);
    
    const candidatesWithScore = [];

    for (const player of dbPlayersOnTeam) {
        const dbClean = cleanString(player.name);
        const dbWords = dbClean.split(' ').filter(Boolean);
        
        let score = 0;
        
        if (parsedClean === dbClean) {
            score = 100;
        } else {
            let allMatch = true;
            let matchedIndices = new Set();
            
            for (const pw of parsedWords) {
                let foundWordMatch = false;
                if (pw.length === 1) {
                    for (let i = 0; i < dbWords.length; i++) {
                        if (!matchedIndices.has(i) && dbWords[i].startsWith(pw)) {
                            matchedIndices.add(i);
                            foundWordMatch = true;
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < dbWords.length; i++) {
                        if (!matchedIndices.has(i) && dbWords[i] === pw) {
                            matchedIndices.add(i);
                            foundWordMatch = true;
                            break;
                        }
                    }
                }
                if (!foundWordMatch) {
                    allMatch = false;
                    break;
                }
            }
            
            if (allMatch) {
                score = 50 + (parsedWords.length / Math.max(parsedWords.length, dbWords.length)) * 40;
            } else {
                let matches = 0;
                let matchedIndicesPartial = new Set();
                for (const pw of parsedWords) {
                    if (pw.length === 1) {
                        for (let i = 0; i < dbWords.length; i++) {
                            if (!matchedIndicesPartial.has(i) && dbWords[i].startsWith(pw)) {
                                matchedIndicesPartial.add(i);
                                matches++;
                                break;
                            }
                        }
                    } else {
                        for (let i = 0; i < dbWords.length; i++) {
                            if (!matchedIndicesPartial.has(i) && dbWords[i] === pw) {
                                matchedIndicesPartial.add(i);
                                matches++;
                                break;
                            }
                        }
                    }
                }
                score = (matches / Math.max(parsedWords.length, dbWords.length)) * 50;
            }
        }

        if (score > 0) {
            candidatesWithScore.push({ player, score });
        }
    }

    candidatesWithScore.sort((a, b) => b.score - a.score);
    return candidatesWithScore;
}

async function main() {
    const isDryRun = process.argv.includes('--run') ? false : true;
    console.log(`=== RUN MODE: ${isDryRun ? 'DRY-RUN' : 'LIVE'} ===`);
    
    const players = await getPlayers();
    const matches = await getMatches();
    
    const playersByTeam = {};
    players.forEach(p => {
        const tNorm = normalizeTeam(p.team);
        if (!playersByTeam[tNorm]) playersByTeam[tNorm] = [];
        playersByTeam[tNorm].push(p);
    });

    const matchBlocks = RAW_RATINGS_TEXT.split(/--------------------------------------------------/);
    
    let totalMatched = 0;
    let totalUnmatched = 0;
    let totalMatchesProcessed = 0;

    for (const block of matchBlocks) {
        if (!block.trim()) continue;
        
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        
        let headerLine = "";
        let headerIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^\d+\.\s*Maç:/)) {
                headerLine = lines[i];
                headerIndex = i;
                break;
            }
        }
        
        if (headerIndex === -1) {
            console.warn("Could not find match header in block:", block.substring(0, 100));
            continue;
        }
        
        const headerMatch = headerLine.match(/^\s*(\d+)\.\s*Maç:\s*(.*?)\s*vs\.?\s*(.*?)(?:\s*\(.*?\))?$/i);
        if (!headerMatch) {
            console.warn("Match header regex failed on:", headerLine);
            continue;
        }
        
        const matchNum = headerMatch[1];
        const rawTeam1 = headerMatch[2];
        const rawTeam2 = headerMatch[3];
        
        const team1Norm = normalizeTeam(rawTeam1);
        const team2Norm = normalizeTeam(rawTeam2);
        
        const dbMatch = matches.find(m => {
            const mHomeNorm = normalizeTeam(m.homeTeam);
            const mAwayNorm = normalizeTeam(m.awayTeam);
            return (mHomeNorm === team1Norm && mAwayNorm === team2Norm) ||
                   (mHomeNorm === team2Norm && mAwayNorm === team1Norm);
        });
        
        if (!dbMatch) {
            console.error(`ERROR: Could not find match in DB for ${rawTeam1} (norm: ${team1Norm}) vs ${rawTeam2} (norm: ${team2Norm})`);
            continue;
        }
        
        console.log(`\nMatch ${matchNum}: DB ID: ${dbMatch.id} | ${dbMatch.homeTeam} vs ${dbMatch.awayTeam}`);
        
        let activeTeam = null;
        const parsedRatings = [];
        
        for (let i = headerIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes("Sol Takım")) {
                activeTeam = team1Norm;
                continue;
            } else if (line.includes("Sağ Takım")) {
                activeTeam = team2Norm;
                continue;
            }
            
            if (line.toLowerCase().startsWith("yedekler")) {
                continue;
            }
            
            const playerMatchResult = line.match(/^\s*(\d+)\s*(?:\(c\)\s+)?(.*?)\s*:\s*(.*)$/);
            if (playerMatchResult) {
                const num = playerMatchResult[1];
                const pName = playerMatchResult[2].trim();
                const pRatingStr = playerMatchResult[3].trim();
                
                if (pRatingStr.includes("Puanı yok") || pRatingStr.includes("--")) {
                    continue;
                }
                
                const rating = parseFloat(pRatingStr);
                if (isNaN(rating)) {
                    console.warn(`WARNING: Invalid rating value: "${pRatingStr}" on line: "${line}"`);
                    continue;
                }
                
                parsedRatings.push({
                    jerseyNumber: num,
                    name: pName,
                    rating,
                    team: activeTeam
                });
            }
        }
        
        const matchRatingsMap = {};
        let success = true;
        
        for (const pr of parsedRatings) {
            const dbPlayers = playersByTeam[pr.team] || [];
            
            let nameToMatch = pr.name;
            if (OVERRIDES[pr.team] && OVERRIDES[pr.team][pr.name]) {
                nameToMatch = OVERRIDES[pr.team][pr.name];
            }
            
            if (nameToMatch === "SKIP") {
                console.log(`  [SKIPPED] Skipping player "${pr.name}" on team "${pr.team}" (not in DB/fantasy league)`);
                continue;
            }
            
            const matchesForPlayer = matchPlayer(nameToMatch, dbPlayers);
            
            if (matchesForPlayer.length === 0 || matchesForPlayer[0].score < 40) {
                console.error(`  [UNMATCHED] No candidate for parsed player "${pr.name}" (matching as "${nameToMatch}") on team "${pr.team}"`);
                totalUnmatched++;
                success = false;
                continue;
            }
            
            const bestCand = matchesForPlayer[0].player;
            matchRatingsMap[bestCand.id] = pr.rating;
            totalMatched++;
        }
        
        if (success) {
            console.log(`  Successfully matched all ${Object.keys(matchRatingsMap).length} rated players.`);
            if (!isDryRun) {
                console.log(`  Saving ratings to DB for ${dbMatch.id}...`);
                await updateMatchDetails(dbMatch.id, { playerRatings: matchRatingsMap, status: "FINISHED" });
            }
        } else {
            console.error(`  Match ${matchNum} had some unmatched players.`);
        }
        totalMatchesProcessed++;
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Matches Processed: ${totalMatchesProcessed}`);
    console.log(`Total Matched Players: ${totalMatched}`);
    console.log(`Total Unmatched Players: ${totalUnmatched}`);
    
    if (!isDryRun && totalUnmatched === 0) {
        console.log("\n=== UPDATING SEMI-FINAL MATCH DETAILS & SCORES ===");
        
        // match-wc101: Fransa vs İspanya (Score: 0 - 2)
        console.log("Finalizing match-wc101: Fransa vs İspanya (0 - 2)...");
        await updateMatchDetails("match-wc101", {
            homeScore: 0,
            awayScore: 2,
            status: "FINISHED",
            isFinalized: true
        });

        // match-wc102: İngiltere vs Arjantin (Score: 1 - 2)
        console.log("Finalizing match-wc102: İngiltere vs Arjantin (1 - 2)...");
        await updateMatchDetails("match-wc102", {
            homeScore: 1,
            awayScore: 2,
            status: "FINISHED",
            isFinalized: true
        });

        console.log("\n=== POPULATING THIRD PLACE & FINAL MATCHUPS ===");
        
        // match-wc103: Fransa vs İngiltere (Third Place)
        console.log("Updating match-wc103: Fransa vs İngiltere...");
        await updateMatchDetails("match-wc103", {
            homeTeam: "Fransa",
            awayTeam: "İngiltere",
            homeFlag: "https://flagcdn.com/fr.svg",
            awayFlag: "https://flagcdn.com/gb-eng.svg",
            status: "SCHEDULED",
            isFinalized: false
        });

        // match-wc104: İspanya vs Arjantin (Final)
        console.log("Updating match-wc104: İspanya vs Arjantin...");
        await updateMatchDetails("match-wc104", {
            homeTeam: "İspanya",
            awayTeam: "Arjantin",
            homeFlag: "https://flagcdn.com/es.svg",
            awayFlag: "https://flagcdn.com/ar.svg",
            status: "SCHEDULED",
            isFinalized: false
        });

        console.log(`\nRecalculating all user points...`);
        await recalculateAllUsersPoints();
        console.log(`Recalculation complete!`);
    }
    
    process.exit(totalUnmatched === 0 ? 0 : 1);
}

main().catch(console.error);
