// App Configuration for Ultimate World Cup Tahmin Platformu

export const CONFIG = {
    // Demo Mode toggle: When true, uses localStorage as a rich mock database.
    // When false, tries to connect to real Firebase Firestore.
    IS_DEMO_MODE: false,
    API_FOOTBALL_KEY: "", // API-Football Key for automatically fetching ratings (RapidAPI)
    SPORTDB_API_KEY: "cHQZm8aayC8IxAYZoFLLAYkV58xUiED928pp1fif", // SportDB.dev API Key for live scores and stats

    // Firebase Settings (Set IS_DEMO_MODE to false once you put your real config)
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyA5GKU4IRyShj59x46ZoqdgYt3ATF5pRiM",
        authDomain: "world-cup-prediction-b1064.firebaseapp.com",
        projectId: "world-cup-prediction-b1064",
        storageBucket: "world-cup-prediction-b1064.firebasestorage.app",
        messagingSenderId: "588963871664",
        appId: "1:588963871664:web:2596d990b102bdb0993475",
        measurementId: "G-QMX9S10Y6T"
    },



    // Admin authorization passcode SHA-256 hash (lorderen2026 salted with wcp_2026_salt)
    ADMIN_PASSCODE_HASH: "38dcb41b9d988bafea18477f5a364613e7b48b4dce86141d15267855d38c26e7",

    // Default users in the local mock/default database (Emptied for production World Cup slate)
    DEFAULT_USERS: [],

    // Scoring Rules Configuration
    SCORING: {
        EXACT_SCORE: 10,       // Tam Skor
        DIFF_AND_OUTCOME: 5,   // Fark ve Sonuç Doğru
        OUTCOME_ONLY: 3,       // Sadece Sonuç Doğru
        SIDE_QUESTION: 0       // Her bir yan soru (Pasif)
    }
};
