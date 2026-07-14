const memStorage = {
    "GK_PRICES_MIGRATED_PROD_V4": "true",
    "DEF_PRICES_MIGRATED_PROD_V8": "true",
    "ORT_PRICES_MIGRATED_PROD_V1": "true",
    "FOR_PRICES_MIGRATED_PROD_V1": "true",
    "TEST_MATCH_DELETED_PROD_V2": "true"
};
global.window = {
    crypto: globalThis.crypto
};
global.localStorage = {
    getItem: (key) => memStorage[key] || null,
    setItem: (key, val) => { memStorage[key] = val; },
    removeItem: (key) => { delete memStorage[key]; }
};

import { execSync } from 'child_process';
import { recalculateAllUsersPoints } from '../firebase-db.js';

async function main() {
    console.log("=== MASTER RESTORE INITIATED ===");

    try {
        console.log("\n1. Restoring 47 group match scores and cards...");
        execSync("node scratch/restore_all_matches.js", { stdio: 'inherit' });

        console.log("\n2. Restoring 1st week player ratings...");
        execSync("node scratch/run_first_week_ratings.js", { stdio: 'inherit' });

        console.log("\n3. Restoring 2nd week player ratings...");
        execSync("node scratch/run_second_week_ratings.js", { stdio: 'inherit' });

        console.log("\n4. Restoring 3rd week player ratings...");
        execSync("node scratch/run_third_week_ratings.js --run", { stdio: 'inherit' });

        console.log("\n5. Restoring Round of 32 match details, scores, penalty shootouts, and matchups...");
        execSync("node scratch/update_knockout_matches.js", { stdio: 'inherit' });
        execSync("node scratch/restore_son32_scores.js", { stdio: 'inherit' });

        console.log("\n6. Restoring Round of 16 match details, ratings, and QF matchups...");
        execSync("node scratch/parse_round16_ratings.js --run", { stdio: 'inherit' });

        console.log("\n7. Restoring Quarter-Final match details, ratings, and SF matchups...");
        execSync("node scratch/parse_qf_ratings.js --run", { stdio: 'inherit' });

        console.log("\n8. Final calculation of all user points...");
        await recalculateAllUsersPoints();
        console.log("Master Restore completed successfully! All data is fully recovered.");
        process.exit(0);
    } catch (error) {
        console.error("Master Restore failed at some step:", error);
        process.exit(1);
    }
}
main();
