export async function handler(event, context) {
    const eventId = event.queryStringParameters.eventId;
    if (!eventId) {
        return {
            statusCode: 400,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ error: "Missing eventId parameter" })
        };
    }

    try {
        // Fetch event details (score, status, etc.)
        const eventRes = await fetch(`https://www.sofascore.com/api/v1/event/${eventId}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.sofascore.com/",
                "Origin": "https://www.sofascore.com"
            }
        });
        
        if (!eventRes.ok) {
            throw new Error(`SofaScore event details fetch failed with status ${eventRes.status}`);
        }

        const eventData = await eventRes.json();
        const status = eventData.event?.status?.type; // e.g. "finished"
        const homeScore = eventData.event?.homeScore?.display;
        const awayScore = eventData.event?.awayScore?.display;

        // Fetch lineups (ratings)
        const lineupsRes = await fetch(`https://www.sofascore.com/api/v1/event/${eventId}/lineups`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.sofascore.com/",
                "Origin": "https://www.sofascore.com"
            }
        });

        let players = [];
        if (lineupsRes.ok) {
            const lineupsData = await lineupsRes.json();
            
            // Helper to parse lineups
            const parseTeamLineup = (lineup, teamSide) => {
                if (!lineup) return;
                // Starters
                if (lineup.players) {
                    lineup.players.forEach(p => {
                        const name = p.player?.name;
                        const rating = p.statistics?.rating;
                        if (name) {
                            players.push({
                                name,
                                rating: rating ? parseFloat(rating) : null,
                                team: teamSide
                            });
                        }
                    });
                }
                // Substitutes
                if (lineup.substitutes) {
                    lineup.substitutes.forEach(p => {
                        const name = p.player?.name;
                        const rating = p.statistics?.rating;
                        if (name) {
                            players.push({
                                name,
                                rating: rating ? parseFloat(rating) : null,
                                team: teamSide
                            });
                        }
                    });
                }
            };

            parseTeamLineup(lineupsData.home, 'home');
            parseTeamLineup(lineupsData.away, 'away');
        }

        // Fetch team statistics
        let statistics = null;
        try {
            const statsRes = await fetch(`https://www.sofascore.com/api/v1/event/${eventId}/statistics`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://www.sofascore.com/",
                    "Origin": "https://www.sofascore.com"
                }
            });
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const allPeriodStats = statsData.statistics?.find(s => s.period === 'ALL');
                if (allPeriodStats) {
                    statistics = allPeriodStats.groups || [];
                }
            }
        } catch (e) {
            console.error("Failed to fetch SofaScore statistics:", e);
        }

        // Fetch match events (timeline)
        let incidents = [];
        try {
            const incidentsRes = await fetch(`https://www.sofascore.com/api/v1/event/${eventId}/incidents`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://www.sofascore.com/",
                    "Origin": "https://www.sofascore.com"
                }
            });
            if (incidentsRes.ok) {
                const incidentsData = await incidentsRes.json();
                incidents = incidentsData.incidents || [];
            }
        } catch (e) {
            console.error("Failed to fetch SofaScore incidents:", e);
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                status: status === 'finished' ? 'FINISHED' : 'SCHEDULED',
                homeScore: homeScore !== undefined ? parseInt(homeScore) : null,
                awayScore: awayScore !== undefined ? parseInt(awayScore) : null,
                players,
                statistics,
                incidents
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ error: err.message })
        };
    }
}
