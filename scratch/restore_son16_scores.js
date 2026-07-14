import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { CONFIG } from '../config.js';

const app = initializeApp(CONFIG.FIREBASE_CONFIG);
const db = getFirestore(app);

const SON16_MATCH_SCORES = {
    "match-wc89": { homeScore: 0, awayScore: 3 }, // Kanada vs Fas
    "match-wc90": { homeScore: 0, awayScore: 1 }, // Paraguay vs Fransa
    "match-wc91": { homeScore: 1, awayScore: 2 }, // Brezilya vs Norveç
    "match-wc92": { homeScore: 2, awayScore: 3 }, // Meksika vs İngiltere
    "match-wc93": { homeScore: 0, awayScore: 1 }, // Portekiz vs İspanya
    "match-wc94": { homeScore: 1, awayScore: 4 }, // ABD vs Belçika
    "match-wc95": { homeScore: 3, awayScore: 2 }  // Arjantin vs Mısır
};

async function main() {
    console.log("=== RESTORING ROUND OF 16 MATCH SCORES ===");
    for (const [matchId, details] of Object.entries(SON16_MATCH_SCORES)) {
        console.log(`Updating ${matchId} to ${details.homeScore} - ${details.awayScore}...`);
        const docRef = doc(db, "matches", matchId);
        await updateDoc(docRef, {
            homeScore: details.homeScore,
            awayScore: details.awayScore,
            status: "FINISHED",
            isFinalized: true
        });
    }
    console.log("All 7 completed Round of 16 matches updated successfully!");
    process.exit(0);
}

main().catch(console.error);
