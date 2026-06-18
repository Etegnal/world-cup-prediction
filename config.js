// App Configuration for Ultimate World Cup Tahmin Platformu

export const CONFIG = {
    // Demo Mode toggle: When true, uses localStorage as a rich mock database.
    // When false, tries to connect to real Firebase Firestore.
    IS_DEMO_MODE: false,
    API_FOOTBALL_KEY: "", // API-Football Key for automatically fetching ratings (RapidAPI)
    SPORTDB_API_KEY: "cHQZm8aayC8IxAYZoFLLAYkV58xUiED928pp1fif", // SportDB.dev API Key for live scores and stats

    // Firebase Settings (Set IS_DEMO_MODE to false once you put your real config)
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyCkzzutHM63lY3TWH4q0-nooDPR5YTaXwI",
        authDomain: "world-cup-2-c3c9e.firebaseapp.com",
        projectId: "world-cup-2-c3c9e",
        storageBucket: "world-cup-2-c3c9e.firebasestorage.app",
        messagingSenderId: "408225149428",
        appId: "1:408225149428:web:d5584f6858337695c489a1",
        measurementId: "G-0BQ7JXX3MY"
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
