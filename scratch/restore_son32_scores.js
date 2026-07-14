import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { CONFIG } from '../config.js';
import { execSync } from 'child_process';

const app = initializeApp(CONFIG.FIREBASE_CONFIG);
const db = getFirestore(app);

const SON32_MATCH_SCORES = {
    "match-wc73": { homeScore: 0, awayScore: 1 }, // Güney Afrika vs Kanada
    "match-wc74": { homeScore: 2, awayScore: 1 }, // Brezilya vs Japonya
    "match-wc75": { homeScore: 1, awayScore: 1, penaltyWinner: "Paraguay", penaltyHomeScore: 4, penaltyAwayScore: 5 }, // Almanya vs Paraguay
    "match-wc76": { homeScore: 1, awayScore: 1, penaltyWinner: "Fas", penaltyHomeScore: 4, penaltyAwayScore: 5 }, // Hollanda vs Fas
    "match-wc77": { homeScore: 1, awayScore: 2 }, // Fildişi Sahili vs Norveç
    "match-wc78": { homeScore: 3, awayScore: 0 }, // Fransa vs İsveç
    "match-wc79": { homeScore: 2, awayScore: 0 }, // Meksika vs Ekvador
    "match-wc80": { homeScore: 2, awayScore: 1 }, // İngiltere vs Demokratik Kongo
    "match-wc81": { homeScore: 3, awayScore: 2 }, // Belçika vs Senegal
    "match-wc82": { homeScore: 2, awayScore: 0 }, // ABD vs Bosna-Hersek
    "match-wc83": { homeScore: 3, awayScore: 0 }, // İspanya vs Avusturya
    "match-wc84": { homeScore: 2, awayScore: 1 }, // Portekiz vs Hırvatistan
    "match-wc85": { homeScore: 2, awayScore: 0 }, // İsviçre vs Cezayir
    "match-wc86": { homeScore: 1, awayScore: 1, penaltyWinner: "Mısır", penaltyHomeScore: 4, penaltyAwayScore: 5 }, // Avustralya vs Mısır
    "match-wc87": { homeScore: 3, awayScore: 2 }, // Arjantin vs Yeşil Burun Adaları
    "match-wc88": { 
        homeScore: 1, 
        awayScore: 0, 
        sideQuestions: { htResult: "home", firstScorer: "Diğer", redCard: false, cornersOverUnder: "under" }
    } // Kolombiya vs Gana
};

async function main() {
    console.log("=== RESTORING SON 32 MATCH SCORES ===");
    for (const [matchId, details] of Object.entries(SON32_MATCH_SCORES)) {
        console.log(`Updating ${matchId}...`);
        const docRef = doc(db, "matches", matchId);
        const updatePayload = {
            homeScore: details.homeScore,
            awayScore: details.awayScore,
            status: "FINISHED",
            isFinalized: true
        };
        
        if (details.penaltyWinner) {
            updatePayload.penaltyWinner = details.penaltyWinner;
            updatePayload.penaltyHomeScore = details.penaltyHomeScore;
            updatePayload.penaltyAwayScore = details.penaltyAwayScore;
        }
        if (details.sideQuestions) {
            updatePayload.sideQuestions = details.sideQuestions;
        }
        
        await updateDoc(docRef, updatePayload);
    }
    console.log("All 16 completed Son 32 matches updated successfully!");

    console.log("\n=== RESTORING ROUND OF 16 MATCHUPS ===");
    execSync("node scratch/update_son16_matches.js", { stdio: 'inherit' });
    execSync("node scratch/restore_son16_scores.js", { stdio: 'inherit' });

    console.log("\n=== IMPORTING SON 32 FANTASY RATINGS ===");
    execSync("node scratch/parse_round32_ratings.js --run", { stdio: 'inherit' });

    console.log("\nRestore successfully finished!");
    process.exit(0);
}

main().catch(console.error);
