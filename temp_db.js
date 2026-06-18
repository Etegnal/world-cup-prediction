// Firebase Firestore & Local Mock Database Interface for Ultimate World Cup Tahmin Platformu
import { CONFIG } from './config.js';
import scrapedPlayers from './scratch/scraped_players.json' with { type: 'json' };
import { TEAMS_DATA } from './components/teamsData.js';

// // 0. Password hashing helper (SHA-256 + Salt)
export async function hashPassword(password) {
    if (!password) return "";
    const saltedPassword = password + "wcp_2026_salt";
    const msgUint8 = new TextEncoder().encode(saltedPassword);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// // State for Mock Database in localStorage
const MOCK_DB_KEY = "WORLD_CUP_PREDICTION_DB_PROD_V11";

const INITIAL_MOCK_DATA = {
    users: [
        {
            id: "mock-ahmet",
            name: "Ahmet Can",
            password: "2faa3a4f3fa7d26f3e65328e91147a7ae8eb8514cd4d5ff2d1dbb5823f36987d",
            avatar: "bg-gradient-to-tr from-yellow-500 to-amber-600",
            points: 48,
            predictionPoints: 48,
            fantasyPoints: 0,
            jokers: { ciftesans: 1, doublepuan: 1, allin: 1, spy: 1, doksanarti: 1, sabotaj: 1 },
            badge: "kahin"
        },
        {
            id: "mock-elif",
            name: "Elif Su",
            password: "2faa3a4f3fa7d26f3e65328e91147a7ae8eb8514cd4d5ff2d1dbb5823f36987d",
            avatar: "bg-gradient-to-tr from-purple-500 to-indigo-600",
            points: 32,
            predictionPoints: 32,
            fantasyPoints: 0,
            jokers: { ciftesans: 1, doublepuan: 1, allin: 1, spy: 1, doksanarti: 1, sabotaj: 1 },
            badge: null
        },
        {
            id: "mock-mehmet",
            name: "Mehmet Yıldız",
            password: "2faa3a4f3fa7d26f3e65328e91147a7ae8eb8514cd4d5ff2d1dbb5823f36987d",
            avatar: "bg-gradient-to-tr from-cyan-500 to-blue-600",
            points: 15,
            predictionPoints: 15,
            fantasyPoints: 0,
            jokers: { ciftesans: 1, doublepuan: 1, allin: 1, spy: 1, doksanarti: 1, sabotaj: 1 },
            badge: null
        },
        {
            id: "mock-can",
            name: "Can Korkmaz",
            password: "2faa3a4f3fa7d26f3e65328e91147a7ae8eb8514cd4d5ff2d1dbb5823f36987d",
            avatar: "bg-gradient-to-tr from-red-500 to-rose-700",
            points: 5,
            predictionPoints: 5,
            fantasyPoints: 0,
            jokers: { ciftesans: 1, doublepuan: 1, allin: 1, spy: 1, doksanarti: 1, sabotaj: 1 },
            badge: "aglayan"
        }
    ],
    predictions: [],
    groupPredictions: {},
    bracketPredictions: {},
    matches: [
        {
            id: "match-wc1",
            homeTeam: "Meksika",
            awayTeam: "Güney Afrika",
            group: "A",
            date: "2026-06-11T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "11 Haziran 22:00 • Estadio Azteca'da tarihi açılış maçı! Meksika ev sahibi avantajıyla Santiago Giménez ve Edson Álvarez önderliğinde tempolu başlamak istiyor. Güney Afrika ise son dönemde Lyle Foster liderliğinde kontra ataklarda etkili olan sürpriz bir ekip.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/mx.svg",
            awayFlag: "https://flagcdn.com/za.svg"
        },
        {
            id: "match-wc2",
            homeTeam: "Güney Kore",
            awayTeam: "Çekya",
            group: "A",
            date: "2026-06-12T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "12 Haziran 05:00 • Hızlı hücumlarıyla bilinen Güney Kore'de gözler Son Heung-min ve Lee Kang-in üzerinde olacak. Çekya ise Patrik Schick ve Souček önderliğinde disiplinli takım savunması ve duran toplardaki fizik avantajıyla gol arayacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/kr.svg",
            awayFlag: "https://flagcdn.com/cz.svg"
        },
        {
            id: "match-wc3",
            homeTeam: "Kanada",
            awayTeam: "Bosna-Hersek",
            group: "B",
            date: "2026-06-12T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "12 Haziran 22:00 • Ev sahibi Kanada, Alphonso Davies ve Jonathan David'in hızıyla gruptan çıkmanın peşinde. Bosna-Hersek ise tecrübeli golcüsü Edin Džeko ve orta sahadaki Krunić gibi isimlerle direnç göstermeyi hedefliyor.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/ca.svg",
            awayFlag: "https://flagcdn.com/ba.svg"
        },
        {
            id: "match-wc4",
            homeTeam: "Katar",
            awayTeam: "İsviçre",
            group: "B",
            date: "2026-06-13T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "13 Haziran 22:00 • Tecrübeli kadrosuyla İsviçre, Granit Xhaka ve Embolo önderliğinde oyunu domine etmek isteyecektir. Katar ise Akram Afif'in bireysel hızı ve organize kontratakları ile rakibini cezalandırmaya çalışacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/qa.svg",
            awayFlag: "https://flagcdn.com/ch.svg"
        },
        {
            id: "match-wc5",
            homeTeam: "Brezilya",
            awayTeam: "Fas",
            group: "C",
            date: "2026-06-14T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "14 Haziran 01:00 • Turnuvanın en büyük favorilerinden Brezilya, Vinícius Jr., Rodrygo ve Neymar önderliğinde sahne alıyor. Son yarı finalist Fas ise Hakimi, Amrabat ve En-Nesyri ile yine bir sürpriz arayışında.",
            sideQuestions: {"htResult":"home","firstScorer":"Vińícius Jr.","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/br.svg",
            awayFlag: "https://flagcdn.com/ma.svg"
        },
        {
            id: "match-wc6",
            homeTeam: "Haiti",
            awayTeam: "İskoçya",
            group: "C",
            date: "2026-06-14T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "14 Haziran 04:00 • Haiti fiziksel gücü ve Frantzdy Pierrot liderliğindeki süratli hücumlarıyla tehlike yaratabilir. İskoçya ise McTominay ve Robertson önderliğinde Britanya futbolunun sertliğini ve yüksek temposunu sahaya yansıtmak istiyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/ht.svg",
            awayFlag: "https://flagcdn.com/gb-sct.svg"
        },
        {
            id: "match-wc7",
            homeTeam: "ABD",
            awayTeam: "Paraguay",
            group: "D",
            date: "2026-06-13T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "13 Haziran 04:00 • Ev sahibi ABD, Christian Pulisic, Timothy Weah ve McKennie önderliğinde taraftarı önünde 3 puana odaklı. Paraguay ise Almirón'un hızı ve sert savunma disipliniyle grupta avantaj elde etmek istiyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Pulisic","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/us.svg",
            awayFlag: "https://flagcdn.com/py.svg"
        },
        {
            id: "match-wc8",
            homeTeam: "Avustralya",
            awayTeam: "Türkiye",
            group: "D",
            date: "2026-06-14T07:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "14 Haziran 07:00 • Bizim Çocuklar sahada! A Millilerimiz Hakan Çalhanoğlu, Arda Güler ve Kenan Yıldız gibi dünya çapındaki yıldızlarıyla turnuvaya muhteşem bir başlangıç hedefliyor. Avustralya ise fiziksel gücü ve yüksek mücadeleci yapısıyla tanınıyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Arda Güler","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/au.svg",
            awayFlag: "https://flagcdn.com/tr.svg"
        },
        {
            id: "match-wc9",
            homeTeam: "Almanya",
            awayTeam: "Curaçao",
            group: "E",
            date: "2026-06-14T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "14 Haziran 20:00 • Almanya, evinde Wirtz ve Musiala gibi genç sihirbazları ile hücum şovu yapmak istiyor. Curaçao ise grupta prestij ve sürpriz puan kovalayacak, gözler tecrübeli Leandro Bacuna'da.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/de.svg",
            awayFlag: "https://flagcdn.com/cw.svg"
        },
        {
            id: "match-wc10",
            homeTeam: "Hollanda",
            awayTeam: "Japonya",
            group: "F",
            date: "2026-06-14T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "14 Haziran 23:00 • Turnuvanın en kaliteli eşleşmelerinden biri! Hollanda Simons, Gakpo ve Van Dijk ile sahaya çıkarken; Japonya Mitoma, Kubo ve Endo gibi üst düzey yıldızlarıyla hızlı pas oyununu sergileyecektir.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/nl.svg",
            awayFlag: "https://flagcdn.com/jp.svg"
        },
        {
            id: "match-wc11",
            homeTeam: "Fildişi Sahili",
            awayTeam: "Ekvador",
            group: "E",
            date: "2026-06-15T02:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "15 Haziran 02:00 • Fildişi Sahili Kessié ve Haller liderliğindeki fiziksel üstünlüğü ve atletik gücüyle favori. Ekvador ise Caicedo ve Enner Valencia ile Güney Amerika'nın sert ve kompakt futbolunu sahaya yansıtacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/ci.svg",
            awayFlag: "https://flagcdn.com/ec.svg"
        },
        {
            id: "match-wc12",
            homeTeam: "İsveç",
            awayTeam: "Tunus",
            group: "F",
            date: "2026-06-15T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "15 Haziran 05:00 • İsveç, Avrupa'nın en formda golcüsü Viktor Gyökeres ve Alexander Isak ikilisiyle rakip savunmaları yıpratmak isteyecektir. Tunus ise Laidouni liderliğinde katı bir savunma kurgusuyla puan arıyor.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/se.svg",
            awayFlag: "https://flagcdn.com/tn.svg"
        },
        {
            id: "match-wc13",
            homeTeam: "İspanya",
            awayTeam: "Yeşil Burun Adaları",
            group: "H",
            date: "2026-06-15T19:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "15 Haziran 19:00 • Son Avrupa Şampiyonu İspanya, Lamine Yamal ve Nico Williams'ın kanatlardaki dinamizmiyle sahnede. Yeşil Burun Adaları ise Garry Rodrigues gibi süratli kanatlarıyla kontra arayacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/es.svg",
            awayFlag: "https://flagcdn.com/cv.svg"
        },
        {
            id: "match-wc14",
            homeTeam: "Belçika",
            awayTeam: "Mısır",
            group: "G",
            date: "2026-06-15T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "15 Haziran 22:00 • Belçika, De Bruyne ve Doku'nun yaratıcılığı ile hücum yollarında etkili olmaya çalışacak. Mısır ise dünya yıldızı Mohamed Salah liderliğinde her an gol bulabilecek bir kontra tehlikesine sahip.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/be.svg",
            awayFlag: "https://flagcdn.com/eg.svg"
        },
        {
            id: "match-wc15",
            homeTeam: "Suudi Arabistan",
            awayTeam: "Uruguay",
            group: "H",
            date: "2026-06-16T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "16 Haziran 01:00 • Suudi Arabistan, Salem Al-Dawsari önderliğinde Asya disipliniyle sahada. Uruguay ise Valverde ve Darwin Núñez önderliğindeki geçiş hücumları ve dinamik kadrosuyla favori konumunda.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/sa.svg",
            awayFlag: "https://flagcdn.com/uy.svg"
        },
        {
            id: "match-wc16",
            homeTeam: "İran",
            awayTeam: "Yeni Zelanda",
            group: "G",
            date: "2026-06-16T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "16 Haziran 04:00 • İran, tecrübeli golcüleri Mehdi Taremi ve Sardar Azmoun ile gol yollarında çok etkili. Yeni Zelanda ise Chris Wood'un kule fiziği üzerinden ceza sahası içi hava toplarıyla tehlike üretmeye çalışacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/ir.svg",
            awayFlag: "https://flagcdn.com/nz.svg"
        },
        {
            id: "match-wc17",
            homeTeam: "Fransa",
            awayTeam: "Senegal",
            group: "I",
            date: "2026-06-16T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "16 Haziran 22:00 • Fransa, süperstar Kylian Mbappé ve Griezmann önderliğinde şampiyonluk yolundaki ilk maçında. Senegal ise Sadio Mané ve Nicolas Jackson liderliğinde gruptan çıkma iddiasını göstermek istiyor.",
            sideQuestions: {"htResult":"home","firstScorer":"Mbappé","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/fr.svg",
            awayFlag: "https://flagcdn.com/sn.svg"
        },
        {
            id: "match-wc18",
            homeTeam: "Irak",
            awayTeam: "Norveç",
            group: "I",
            date: "2026-06-17T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "17 Haziran 01:00 • Norveç, dünyanın en ölümcül forveti Erling Haaland ve şef Martin Ødegaard ikilisiyle hücumda büyük bir tehdit oluşturuyor. Irak ise Aymen Hussein liderliğindeki fiziksel ve inatçı oyunuyla puan kovalayacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/iq.svg",
            awayFlag: "https://flagcdn.com/no.svg"
        },
        {
            id: "match-wc19",
            homeTeam: "Arjantin",
            awayTeam: "Cezayir",
            group: "J",
            date: "2026-06-17T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "17 Haziran 04:00 • Son Dünya Şampiyonu Arjantin, efsane Lionel Messi ve Lautaro Martínez liderliğinde unvanını korumak için sahada. Cezayir ise Mahrez ve Bennacer gibi klas ayaklarıyla dev rakibine sürpriz yapma niyetinde.",
            sideQuestions: {"htResult":"home","firstScorer":"Messi","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/ar.svg",
            awayFlag: "https://flagcdn.com/dz.svg"
        },
        {
            id: "match-wc20",
            homeTeam: "Avusturya",
            awayTeam: "Ürdün",
            group: "J",
            date: "2026-06-17T07:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "17 Haziran 07:00 • Avusturya, Sabitzer ve Laimer liderliğinde yüksek pres gücü ve dinamik orta sahasıyla maçı domine etmek isteyecektir. Ürdün ise son Asya Kupası finalisti olarak Mousa Al-Tamari önderliğinde direnecektir.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/at.svg",
            awayFlag: "https://flagcdn.com/jo.svg"
        },
        {
            id: "match-wc21",
            homeTeam: "Portekiz",
            awayTeam: "Demokratik Kongo",
            group: "K",
            date: "2026-06-17T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "17 Haziran 20:00 • Portekiz, Cristiano Ronaldo'nun son Dünya Kupası serüveninde Rafael Leão ve Bruno Fernandes ile gol arıyor. Demokratik Kongo ise Wissa ve Mbemba ile fiziksel güce dayalı bir oyun sergileyecek.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/pt.svg",
            awayFlag: "https://flagcdn.com/cd.svg"
        },
        {
            id: "match-wc22",
            homeTeam: "İngiltere",
            awayTeam: "Hırvatistan",
            group: "L",
            date: "2026-06-17T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "17 Haziran 23:00 • Dev randevu! İngiltere Jude Bellingham, Harry Kane ve Foden gibi süper yıldızlarıyla favori. Hırvatistan ise efsane şef Luka Modrić ve Mateo Kovačić önderliğinde tecrübesiyle oyunu tutmaya çalışacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/gb-eng.svg",
            awayFlag: "https://flagcdn.com/hr.svg"
        },
        {
            id: "match-wc23",
            homeTeam: "Gana",
            awayTeam: "Panama",
            group: "L",
            date: "2026-06-18T02:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "18 Haziran 02:00 • Gana, Mohammed Kudus ve Iñaki Williams'ın patlayıcı gücü ve hızıyla hücumda çok etkili. Panama ise Amerika Kıtası elemelerindeki dirençli ve sert yapısıyla sürpriz bir puan hedefinde.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/gh.svg",
            awayFlag: "https://flagcdn.com/pa.svg"
        },
        {
            id: "match-wc24",
            homeTeam: "Özbekistan",
            awayTeam: "Kolombiya",
            group: "K",
            date: "2026-06-18T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "18 Haziran 05:00 • Özbekistan, Eldor Shomurodov ve Abbosbek Fayzullaev önderliğinde yükselen Asya futbolunu temsil ediyor. Kolombiya ise Luis Díaz ve James Rodríguez'in liderliğinde Güney Amerika kalitesini sahaya yansıtacaktır.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/uz.svg",
            awayFlag: "https://flagcdn.com/co.svg"
        },
        {
            id: "match-wc25",
            homeTeam: "Çekya",
            awayTeam: "Güney Afrika",
            group: "A",
            date: "2026-06-18T19:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "18 Haziran 19:00 • Çekya gruptan çıkma yolunda Patrik Schick liderliğindeki hücum hattına güveniyor. Güney Afrika ise Percy Tau'nun yaratıcılığı ve takım disipliniyle puan savaşı verecek.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/cz.svg",
            awayFlag: "https://flagcdn.com/za.svg"
        },
        {
            id: "match-wc26",
            homeTeam: "İsviçre",
            awayTeam: "Bosna-Hersek",
            group: "B",
            date: "2026-06-18T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "18 Haziran 22:00 • İsviçre, Manuel Akanji liderliğindeki kaya gibi savunması ve Granit Xhaka şefliğindeki orta sahasıyla favori. Bosna-Hersek ise Džeko'nun bitiriciliği ile gol yollarında şans arayacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/ch.svg",
            awayFlag: "https://flagcdn.com/ba.svg"
        },
        {
            id: "match-wc27",
            homeTeam: "Kanada",
            awayTeam: "Katar",
            group: "B",
            date: "2026-06-19T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "19 Haziran 01:00 • Kanada evinde oynadığı bu kritik maçta Davies ve Tajon Buchanan'ın kanat bindirmeleriyle galibiyet arıyor. Katar ise Almoez Ali'nin bitiriciliğine güvenmek durumunda.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/ca.svg",
            awayFlag: "https://flagcdn.com/qa.svg"
        },
        {
            id: "match-wc28",
            homeTeam: "Meksika",
            awayTeam: "Güney Kore",
            group: "A",
            date: "2026-06-19T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "19 Haziran 04:00 • Aztek Stadyumu'nda müthiş kapışma! Meksika Santiago Giménez ile grupta liderliği hedeflerken, Güney Kore'de Son Heung-min'in klas ayakları her an oyunu çözebilir.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/mx.svg",
            awayFlag: "https://flagcdn.com/kr.svg"
        },
        {
            id: "match-wc29",
            homeTeam: "ABD",
            awayTeam: "Avustralya",
            group: "D",
            date: "2026-06-19T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "19 Haziran 22:00 • ABD, Balogun and Pulisic önderliğindeki hızlı hücum varyasyonlarıyla taraftarı önünde favori. Avustralya ise duran toplar ve fiziksel ikili mücadelelerdeki üstünlüğünü kullanmak isteyecektir.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/us.svg",
            awayFlag: "https://flagcdn.com/au.svg"
        },
        {
            id: "match-wc30",
            homeTeam: "İskoçya",
            awayTeam: "Fas",
            group: "C",
            date: "2026-06-20T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "20 Haziran 01:00 • İskoçya, John McGinn ve Scott McTominay önderliğinde orta saha savaşını kazanmak istiyor. Fas ise Ziyech ve Diaz'ın yaratıcı hücum hattıyla gruptan çıkmayı garantileme peşinde.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/gb-sct.svg",
            awayFlag: "https://flagcdn.com/ma.svg"
        },
        {
            id: "match-wc31",
            homeTeam: "Brezilya",
            awayTeam: "Haiti",
            group: "C",
            date: "2026-06-20T03:30:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "20 Haziran 03:30 • Sambacılar'da teknik direktör rotasyona gidebilir fakat hücumda Endrick ve Rodrygo gibi isimler şov yapmaya hazır. Haiti savunmada kahramanca bir direnç göstermeye çalışacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Vińícius Jr.","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/br.svg",
            awayFlag: "https://flagcdn.com/ht.svg"
        },
        {
            id: "match-wc32",
            homeTeam: "Türkiye",
            awayTeam: "Paraguay",
            group: "D",
            date: "2026-06-20T06:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "20 Haziran 06:00 • A Millilerimiz gruptan çıkmayı garantilemek için Paraguay karşısında! Arda Güler'in vizyonu, Barış Alper Yılmaz'ın yırtıcılığı ve Kenan Yıldız'ın şutlarıyla gol arayacağız. Paraguay ise Sanabria ile kontratak tehdidi oluşturuyor.",
            sideQuestions: {"htResult":"home","firstScorer":"Arda Güler","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/tr.svg",
            awayFlag: "https://flagcdn.com/py.svg"
        },
        {
            id: "match-wc33",
            homeTeam: "Hollanda",
            awayTeam: "İsveç",
            group: "F",
            date: "2026-06-20T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "20 Haziran 20:00 • Dev kapışma! Hollanda, Frenkie de Jong ve Virgil van Dijk liderliğinde oyunu kontrol etmek isterken; İsveç, Gyökeres ve Kulusevski ikilisiyle geçiş hücumlarında gol arayacaktır.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/nl.svg",
            awayFlag: "https://flagcdn.com/se.svg"
        },
        {
            id: "match-wc34",
            homeTeam: "Almanya",
            awayTeam: "Fildişi Sahili",
            group: "E",
            date: "2026-06-20T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "20 Haziran 23:00 • Almanya, Musiala ve Kai Havertz'in akıcı pas oyunuyla grupta liderlik mücadelesinde. Fildişi Sahili ise Adingra ve Haller liderliğindeki kontra gücüyle panzerleri zorlamaya çalışacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/de.svg",
            awayFlag: "https://flagcdn.com/ci.svg"
        },
        {
            id: "match-wc35",
            homeTeam: "Ekvador",
            awayTeam: "Curaçao",
            group: "E",
            date: "2026-06-21T03:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "21 Haziran 03:00 • E Grubu mücadelesinde Ekvador, Enner Valencia önderliğindeki gol ayaklarıyla galibiyet arıyor. Curaçao ise sert savunmasıyla sürpriz peşinde.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/ec.svg",
            awayFlag: "https://flagcdn.com/cw.svg"
        },
        {
            id: "match-wc36",
            homeTeam: "Tunus",
            awayTeam: "Japonya",
            group: "F",
            date: "2026-06-21T07:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "21 Haziran 07:00 • F Grubu maçı. Japonya, Mitoma ve Kubo gibi teknik ayaklarıyla hızlı pas oyununu sahaya yansıtmak isterken, Tunus ise sert savunmasıyla direnmeye çalışacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/tn.svg",
            awayFlag: "https://flagcdn.com/jp.svg"
        },
        {
            id: "match-wc37",
            homeTeam: "İspanya",
            awayTeam: "Suudi Arabistan",
            group: "H",
            date: "2026-06-21T19:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "21 Haziran 19:00 • H Grubu'nda favori İspanya, Lamine Yamal ve Pedri liderliğindeki yaratıcı orta sahasıyla hücum üstünlüğünü kurmak istiyor. Suudi Arabistan ise disiplinli savunmasıyla direnecek.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/es.svg",
            awayFlag: "https://flagcdn.com/sa.svg"
        },
        {
            id: "match-wc38",
            homeTeam: "Belçika",
            awayTeam: "İran",
            group: "G",
            date: "2026-06-21T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "21 Haziran 22:00 • G Grubu mücadelesinde Belçika, De Bruyne ve Lukaku gibi tecrübeli yıldızlarıyla 3 puanı hedefliyor. İran ise Taremi ve Azmoun liderliğindeki kontra ataklarıyla tehlikeli olmaya çalışacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/be.svg",
            awayFlag: "https://flagcdn.com/ir.svg"
        },
        {
            id: "match-wc39",
            homeTeam: "Uruguay",
            awayTeam: "Yeşil Burun Adaları",
            group: "H",
            date: "2026-06-22T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "22 Haziran 01:00 • H Grubu. Uruguay, Darwin Núñez ve Fede Valverde'nin yüksek enerjisi ve hırsıyla sahada üstünlük kurmak istiyor. Yeşil Burun Adaları ise takım savunmasıyla sürpriz puan arayacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/uy.svg",
            awayFlag: "https://flagcdn.com/cv.svg"
        },
        {
            id: "match-wc40",
            homeTeam: "Yeni Zelanda",
            awayTeam: "Mısır",
            group: "G",
            date: "2026-06-22T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "22 Haziran 04:00 • G Grubu'nda Mısır, süper yıldızı Muhammed Salah liderliğinde galibiyete yakın. Yeni Zelanda ise fiziksel gücü ve duran toplardaki boy avantajıyla etkili olmaya çalışacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/nz.svg",
            awayFlag: "https://flagcdn.com/eg.svg"
        },
        {
            id: "match-wc41",
            homeTeam: "Arjantin",
            awayTeam: "Avusturya",
            group: "J",
            date: "2026-06-22T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "22 Haziran 20:00 • J Grubu'nda Arjantin, dünya kupası son şampiyonu unvanıyla Lautaro Martínez ve Messi gibi liderleriyle sahada. Avusturya ise Rangnick yönetiminde yoğun pres oyunuyla Arjantin'i bozmak istiyor.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/ar.svg",
            awayFlag: "https://flagcdn.com/at.svg"
        },
        {
            id: "match-wc42",
            homeTeam: "Fransa",
            awayTeam: "Irak",
            group: "I",
            date: "2026-06-23T00:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "23 Haziran 00:00 • I Grubu. Turnuvanın en güçlü şampiyonluk adaylarından Fransa, Kylian Mbappé liderliğindeki zengin hücum hattıyla sahada. Irak ise disiplinli takım savunmasıyla tarihi bir puan mücadelesi verecek.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/fr.svg",
            awayFlag: "https://flagcdn.com/iq.svg"
        },
        {
            id: "match-wc43",
            homeTeam: "Norveç",
            awayTeam: "Senegal",
            group: "I",
            date: "2026-06-23T03:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "23 Haziran 03:00 • I Grubu'nda harika düello! Norveç'te Erling Haaland ve Martin Ødegaard iş birliği gol ararken, Senegal ise Sadio Mané ve Nicolas Jackson liderliğindeki dinamik ve güçlü yapısıyla cevap verecek.",
            sideQuestions: {"htResult":"draw","firstScorer":"Haaland","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/no.svg",
            awayFlag: "https://flagcdn.com/sn.svg"
        },
        {
            id: "match-wc44",
            homeTeam: "Ürdün",
            awayTeam: "Cezayir",
            group: "J",
            date: "2026-06-23T06:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "23 Haziran 06:00 • J Grubu mücadelesinde Cezayir, Mahrez ve Bennacer önderliğinde tecrübe avantajına sahip. Ürdün ise son dönemdeki çıkışını sürdürerek dirençli yapısıyla puan koparmaya çalışacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/jo.svg",
            awayFlag: "https://flagcdn.com/dz.svg"
        },
        {
            id: "match-wc45",
            homeTeam: "Portekiz",
            awayTeam: "Özbekistan",
            group: "K",
            date: "2026-06-23T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "23 Haziran 20:00 • K Grubu. Portekiz, Bruno Fernandes, Leão ve Ronaldo liderliğindeki elit kadrosuyla galibiyete yakın. Özbekistan ise Shomurodov liderliğinde takım halinde savunma yapıp hızlı çıkışlar kovalayacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/pt.svg",
            awayFlag: "https://flagcdn.com/uz.svg"
        },
        {
            id: "match-wc46",
            homeTeam: "İngiltere",
            awayTeam: "Gana",
            group: "L",
            date: "2026-06-23T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "23 Haziran 23:00 • L Grubu'nda tempolu maç! İngiltere, Bellingham ve Kane ile oyun kontrolünü elinde tutmak isterken; Gana ise Kudus ve Williams'ın müthiş hızıyla kontralarda gol arayacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/gb-eng.svg",
            awayFlag: "https://flagcdn.com/gh.svg"
        },
        {
            id: "match-wc47",
            homeTeam: "Panama",
            awayTeam: "Hırvatistan",
            group: "L",
            date: "2026-06-24T02:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "24 Haziran 02:00 • L Grubu. Hırvatistan, Luka Modrić liderliğindeki tecrübeli orta sahasıyla maçı kontrol etmek istiyor. Panama ise fiziksel sertliğiyle Hırvatları yıpratmaya çalışacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/pa.svg",
            awayFlag: "https://flagcdn.com/hr.svg"
        },
        {
            id: "match-wc48",
            homeTeam: "Kolombiya",
            awayTeam: "Demokratik Kongo",
            group: "K",
            date: "2026-06-24T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "24 Haziran 05:00 • K Grubu. Kolombiya, Luis Díaz ve James Rodríguez'in yaratıcılığıyla hırslı bir başlangıç istiyor. Demokratik Kongo ise Wissa liderliğindeki fiziksel ve atletik yapısıyla direnç gösterecek.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/co.svg",
            awayFlag: "https://flagcdn.com/cd.svg"
        },
        {
            id: "match-wc49",
            homeTeam: "İsviçre",
            awayTeam: "Kanada",
            group: "B",
            date: "2026-06-24T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "24 Haziran 22:00 • B Grubu'nda kritik liderlik mücadelesi! İsviçre, Xhaka ve Akanji ile savunma ve orta saha dengesini korurken; Kanada ise Alphonso Davies ve Jonathan David'in hızıyla gol arayacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/ch.svg",
            awayFlag: "https://flagcdn.com/ca.svg"
        },
        {
            id: "match-wc50",
            homeTeam: "Bosna-Hersek",
            awayTeam: "Katar",
            group: "B",
            date: "2026-06-24T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "24 Haziran 22:00 • B Grubu. Bosna-Hersek, golcüsü Edin Džeko ve orta sahadaki Krunić ile üstünlük kurma peşinde. Katar ise hızı ve uyumlu takım oyunuyla kontra arayacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/ba.svg",
            awayFlag: "https://flagcdn.com/qa.svg"
        },
        {
            id: "match-wc51",
            homeTeam: "Fas",
            awayTeam: "Haiti",
            group: "C",
            date: "2026-06-25T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "25 Haziran 01:00 • C Grubu. Son dünya kupasının yarı finalisti Fas, Hakimi, Ziyech ve Brahim Díaz ile maçı domine etmek istiyor. Haiti ise Pierrot önderliğindeki hızlı geçiş hücumlarıyla şans arayacak.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/ma.svg",
            awayFlag: "https://flagcdn.com/ht.svg"
        },
        {
            id: "match-wc52",
            homeTeam: "İskoçya",
            awayTeam: "Brezilya",
            group: "C",
            date: "2026-06-25T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "25 Haziran 01:00 • C Grubu dev maçı! Brezilya, Vinícius Jr., Rodrygo ve Paquetá gibi dünyaca ünlü yıldızlarıyla sambayı sahaya yansıtmak istiyor. İskoçya ise sert Britanya savunması ve duran toplarla direnecek.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/gb-sct.svg",
            awayFlag: "https://flagcdn.com/br.svg"
        },
        {
            id: "match-wc53",
            homeTeam: "Güney Afrika",
            awayTeam: "Güney Kore",
            group: "A",
            date: "2026-06-25T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "25 Haziran 04:00 • A Grubu mücadelesi. Son Heung-min önderliğindeki Güney Kore, dinamik hızıyla favori. Güney Afrika ise Lyle Foster liderliğinde kontra pozisyonlar bulmaya çalışacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/za.svg",
            awayFlag: "https://flagcdn.com/kr.svg"
        },
        {
            id: "match-wc54",
            homeTeam: "Çekya",
            awayTeam: "Meksika",
            group: "A",
            date: "2026-06-25T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "25 Haziran 04:00 • A Grubu'nda denk güçlerin maçı! Ev sahibi Meksika, Estadio Azteca atmosferinde galibiyete odaklanırken; Çekya ise Souček ve Schick ile disiplinli ve fiziksel futbolunu sahaya koyacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/cz.svg",
            awayFlag: "https://flagcdn.com/mx.svg"
        },
        {
            id: "match-wc55",
            homeTeam: "Curaçao",
            awayTeam: "Fildişi Sahili",
            group: "E",
            date: "2026-06-25T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "25 Haziran 23:00 • E Grubu. Fildişi Sahili, Haller ve Kessié önderliğinde fiziksel gücünü hissettirmek istiyor. Curaçao ise gruptaki son maçında prestij için mücadele edecek.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/cw.svg",
            awayFlag: "https://flagcdn.com/ci.svg"
        },
        {
            id: "match-wc56",
            homeTeam: "Ekvador",
            awayTeam: "Almanya",
            group: "E",
            date: "2026-06-25T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "25 Haziran 23:00 • E Grubu liderlik maçı! Almanya, Wirtz ve Musiala önderliğinde hücum üretkenliğini sürdürme hedefinde. Ekvador ise Caicedo liderliğindeki dirençli orta sahasıyla panzerleri durdurmaya çalışacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/ec.svg",
            awayFlag: "https://flagcdn.com/de.svg"
        },
        {
            id: "match-wc57",
            homeTeam: "Tunus",
            awayTeam: "Hollanda",
            group: "F",
            date: "2026-06-26T02:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "26 Haziran 02:00 • F Grubu. Hollanda, Xavi Simons, Depay ve Gakpo liderliğindeki yaratıcı ayaklarıyla gruptan çıkmayı garantileme peşinde. Tunus ise savunmada katı durarak direnç gösterecek.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/tn.svg",
            awayFlag: "https://flagcdn.com/nl.svg"
        },
        {
            id: "match-wc58",
            homeTeam: "Japonya",
            awayTeam: "İsveç",
            group: "F",
            date: "2026-06-26T02:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "26 Haziran 02:00 • F Grubu. İsveç, Isak ve Gyökeres liderliğindeki güçlü hücum hattıyla galibiyet peşinde. Japonya ise hareketli pas oyunu ve dinamizmiyle İsveç savunmasını aşmaya çalışacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/jp.svg",
            awayFlag: "https://flagcdn.com/se.svg"
        },
        {
            id: "match-wc59",
            homeTeam: "Türkiye",
            awayTeam: "ABD",
            group: "D",
            date: "2026-06-26T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "26 Haziran 05:00 • D Grubu'nda dev randevu! Bizim Çocuklar sahada! A Millilerimiz Hakan Çalhanoğlu, Arda Güler ve Kenan Yıldız liderliğindeki yaratıcı orta sahasıyla ev sahibi ABD'yi devirip liderlik peşinde. ABD ise Pulisic ve McKennie ile etkili olmaya çalışacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/tr.svg",
            awayFlag: "https://flagcdn.com/us.svg"
        },
        {
            id: "match-wc60",
            homeTeam: "Paraguay",
            awayTeam: "Avustralya",
            group: "D",
            date: "2026-06-26T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "26 Haziran 05:00 • D Grubu. Avustralya ve Paraguay gruptan çıkma mücadelesinde. Paraguay sert ve savaşçı yapısıyla maçı tutmaya çalışırken, Avustralya ise duran toplar ve kanat akınlarıyla etkili olmaya çalışacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/py.svg",
            awayFlag: "https://flagcdn.com/au.svg"
        },
        {
            id: "match-wc61",
            homeTeam: "Norveç",
            awayTeam: "Fransa",
            group: "I",
            date: "2026-06-26T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "26 Haziran 22:00 • I Grubu. Gruptaki dev mücadelede Norveç, Haaland ve Ødegaard ile gol ararken; Fransa ise zengin kadrosu Mbappé ve Griezmann ile maçı kazanarak gruptan lider çıkmak istiyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/no.svg",
            awayFlag: "https://flagcdn.com/fr.svg"
        },
        {
            id: "match-wc62",
            homeTeam: "Senegal",
            awayTeam: "Irak",
            group: "I",
            date: "2026-06-26T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "26 Haziran 22:00 • I Grubu son maçı. Senegal, Jackson ve Mané'nin hızıyla gruptaki son maçında 3 puan arıyor. Irak ise dirençli savunmasıyla turnuvaya iyi bir veda etme peşinde.",
            sideQuestions: {"htResult":"home","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/sn.svg",
            awayFlag: "https://flagcdn.com/iq.svg"
        },
        {
            id: "match-wc63",
            homeTeam: "Yeşil Burun Adaları",
            awayTeam: "Suudi Arabistan",
            group: "H",
            date: "2026-06-27T03:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "27 Haziran 03:00 • H Grubu. Yeşil Burun Adaları ve Suudi Arabistan, gruptan çıkma şansını son maça taşıdı. İki takımın da kontrollü bir oyun tercih etmesi bekleniyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/cv.svg",
            awayFlag: "https://flagcdn.com/sa.svg"
        },
        {
            id: "match-wc64",
            homeTeam: "Uruguay",
            awayTeam: "İspanya",
            group: "H",
            date: "2026-06-27T03:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "27 Haziran 03:00 • H Grubu'nda dev liderlik savaşı! Uruguay'ın sert savunması ve Núñez'in hırsı, İspanya'nın Pedri ve Yamal liderliğindeki pas oyunuyla çarpışıyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/uy.svg",
            awayFlag: "https://flagcdn.com/es.svg"
        },
        {
            id: "match-wc65",
            homeTeam: "Yeni Zelanda",
            awayTeam: "Belçika",
            group: "G",
            date: "2026-06-27T06:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "27 Haziran 06:00 • G Grubu. Belçika, gruptaki son maçında Kevin De Bruyne önderliğinde net bir galibiyet hedefliyor. Yeni Zelanda ise sürpriz arayacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/nz.svg",
            awayFlag: "https://flagcdn.com/be.svg"
        },
        {
            id: "match-wc66",
            homeTeam: "Mısır",
            awayTeam: "İran",
            group: "G",
            date: "2026-06-27T06:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "27 Haziran 06:00 • G Grubu son maçı. Mısır, Muhammed Salah'ın bireysel yaratıcılığına güvenirken, İran ise Taremi liderliğindeki tehlikeli kontra ataklarla gol arayacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Salah","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/eg.svg",
            awayFlag: "https://flagcdn.com/ir.svg"
        },
        {
            id: "match-wc67",
            homeTeam: "Panama",
            awayTeam: "İngiltere",
            group: "L",
            date: "2026-06-28T00:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "28 Haziran 00:00 • L Grubu. İngiltere, Harry Kane ve Bellingham gibi yıldızlarıyla rahat bir galibiyet alıp gruptan lider çıkmak istiyor. Panama ise katı savunma yapacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/pa.svg",
            awayFlag: "https://flagcdn.com/gb-eng.svg"
        },
                {
            id: "match-wc68",
            homeTeam: "Hırvatistan",
            awayTeam: "Gana",
            group: "L",
            date: "2026-06-28T00:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "28 Haziran 00:00 • L Grubu son maçı. Hırvatistan, Luka Modrić'in tecrübesiyle oyunu kontrol etmek isterken; Gana ise Kudus'ün dinamizmiyle galibiyet kovalayacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/hr.svg",
            awayFlag: "https://flagcdn.com/gh.svg"
        },
        {
            id: "match-wc69",
            homeTeam: "Kolombiya",
            awayTeam: "Portekiz",
            group: "K",
            date: "2026-06-28T02:30:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "28 Haziran 02:30 • K Grubu dev maçı! Kolombiya'da Luis Díaz ve James Rodríguez, Portekiz'in Bruno Fernandes ve Leão önderliğindeki harika kadrosuna karşı liderlik savaşı veriyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/co.svg",
            awayFlag: "https://flagcdn.com/pt.svg"
        },
        {
            id: "match-wc70",
            homeTeam: "Demokratik Kongo",
            awayTeam: "Özbekistan",
            group: "K",
            date: "2026-06-28T02:30:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "28 Haziran 02:30 • K Grubu. İki sürpriz takım gruptan çıkma mücadelesinde. Demokratik Kongo fizik gücünü kullanırken, Özbekistan ise Shomurodov ile tehlike yaratmak istiyor.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/cd.svg",
            awayFlag: "https://flagcdn.com/uz.svg"
        },
        {
            id: "match-wc71",
            homeTeam: "Cezayir",
            awayTeam: "Avusturya",
            group: "J",
            date: "2026-06-28T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "28 Haziran 05:00 • J Grubu. Avusturya, yoğun pres futboluyla Cezayir'i hataya zorlamak isterken; Cezayir ise Mahrez ve Bennacer önderliğindeki hızlı geçişlerle etkili olmaya çalışacak.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/dz.svg",
            awayFlag: "https://flagcdn.com/at.svg"
        },
        {
            id: "match-wc72",
            homeTeam: "Ürdün",
            awayTeam: "Arjantin",
            group: "J",
            date: "2026-06-28T05:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "28 Haziran 05:00 • J Grubu son maçı. Son şampiyon Arjantin, Messi ve Lautaro liderliğinde grubu 3 puanla kapatıp lider çıkmayı hedefliyor. Ürdün ise tarihi bir savunma yapacak.",
            sideQuestions: {"htResult":"away","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"over"},
            homeFlag: "https://flagcdn.com/jo.svg",
            awayFlag: "https://flagcdn.com/ar.svg"
        },
{
            id: "match-wc73",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-06-28T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc74",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-06-29T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc75",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-06-29T23:30:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc76",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-06-30T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc77",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-06-30T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc78",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-01T00:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc79",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-01T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc80",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-01T19:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc81",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-01T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc82",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-02T03:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc83",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-02T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc84",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-03T02:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc85",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-03T06:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc86",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-03T21:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc87",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-04T01:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc88",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 32",
            date: "2026-07-04T04:30:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 32 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc89",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-04T20:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc90",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-05T00:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc91",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-05T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc92",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-06T03:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc93",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-06T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc94",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-07T03:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc95",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-07T19:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc96",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Son 16",
            date: "2026-07-07T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Son 16 eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc97",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Çeyrek Final",
            date: "2026-07-09T23:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Çeyrek Final eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc98",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Çeyrek Final",
            date: "2026-07-10T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Çeyrek Final eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc99",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Çeyrek Final",
            date: "2026-07-12T00:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Çeyrek Final eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc100",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Çeyrek Final",
            date: "2026-07-12T04:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Çeyrek Final eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc101",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Yarı Final",
            date: "2026-07-14T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Yarı Final eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc102",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Yarı Final",
            date: "2026-07-15T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Yarı Final eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc103",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Üçüncülük",
            date: "2026-07-19T00:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            awayScore: 0,
            analysis: "Üçüncülük eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        },
        {
            id: "match-wc104",
            homeTeam: "Belirsiz",
            awayTeam: "Belirsiz",
            group: "Final",
            date: "2026-07-19T22:00:00",
            status: "SCHEDULED",
            homeScore: 0,
            analysis: "Final eleme karşılaşması. Üst tura yükselen takımlar netleştiğinde eşleşme güncellenecektir.",
            sideQuestions: {"htResult":"draw","firstScorer":"Diğer","redCard":false,"cornersOverUnder":"under"},
            homeFlag: "https://flagcdn.com/un.svg",
            awayFlag: "https://flagcdn.com/un.svg"
        }
    ],
    topScorers: [],
    topAssists: []
};

// Programmatically generate varied mock predictions for mock users to populate Public Opinion (Kamuoyu)
const mockUserIds = ["mock-ahmet", "mock-elif", "mock-mehmet", "mock-can"];
const mockPredictions = [];
INITIAL_MOCK_DATA.matches.forEach((m, idx) => {
    mockUserIds.forEach((uId, uIdx) => {
        // Create realistic and varied score predictions
        let homePred = (idx + uIdx * 2 + 1) % 3;
        let awayPred = (idx * uIdx + 2) % 3;
        let joker = null;
        if ((idx + uIdx) % 7 === 0) joker = "ciftesans";
        else if ((idx + uIdx) % 9 === 0) joker = "doublepuan";
        else if ((idx + uIdx) % 11 === 0) joker = "allin";
        
        const predObj = {
            id: `pred-${uId}-${m.id}`,
            userId: uId,
            matchId: m.id,
            homeScorePred: homePred,
            awayScorePred: awayPred,
            sideAnswers: { 
                htResult: homePred > awayPred ? "home" : (homePred === awayPred ? "draw" : "away"), 
                firstScorer: "Diğer", 
                redCard: false, 
                cornersOverUnder: "under" 
            },
            appliedJoker: joker,
            isLocked: true
        };
        if (joker === "ciftesans") {
            predObj.homeScorePredAlt = (homePred + 1) % 3;
            predObj.awayScorePredAlt = awayPred;
        }
        mockPredictions.push(predObj);
    });
});
INITIAL_MOCK_DATA.predictions = mockPredictions;

// Real Firebase variables
let db = null;
let fStore = null;



// Helper to seed matches to Firestore if they are empty
async function seedMatchesIfEmpty() {
    if (!db || !fStore) return;
    try {
        const matchesRef = fStore.collection(db, "matches");
        const snapshot = await fStore.getDocs(matchesRef);
        
        const existingIds = new Set();
        snapshot.forEach(doc => existingIds.add(doc.id));
        
        const missingMatches = INITIAL_MOCK_DATA.matches.filter(m => !existingIds.has(m.id));
        if (missingMatches.length > 0) {
            console.log(`Seeding ${missingMatches.length} missing matches to Firestore...`);
            const batch = fStore.writeBatch(db);
            missingMatches.forEach(m => {
                const matchDoc = fStore.doc(db, "matches", m.id);
                batch.set(matchDoc, m);
            });
            await batch.commit();
            console.log("Firestore missing matches seeded successfully!");
        }
    } catch (err) {
        console.error("Failed to seed Firestore matches:", err);
    }
}

// Helper to seed players to Firestore or Mock DB from scraped JSON if empty
async function seedPlayersIfEmpty() {
    const allPlayersToSeed = [];
    for (const [rawTeam, players] of Object.entries(scrapedPlayers)) {
        const teamNormalized = normalizeTeamName(rawTeam);
        players.forEach(p => {
            const hash = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rating = 66 + (hash % 26);
            const price = Math.round(((rating - 60) * 0.4 + 4) * 10) / 10;
            const playerDoc = {
                id: `p-${teamNormalized.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: p.name,
                team: teamNormalized,
                pos: p.pos || "DEF",
                club: p.club || "",
                rating: rating,
                price: price
            };
            allPlayersToSeed.push(playerDoc);
        });
    }

    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (!data.players || data.players.length === 0) {
            console.log("Seeding Mock DB players from scraped data...");
            data.players = allPlayersToSeed;
            saveMockData(data);
            console.log(`Mock DB players seeded successfully: ${data.players.length} players.`);
        }
    } else {
        if (!db || !fStore) return;
        try {
            const playersRef = fStore.collection(db, "players");
            const snapshot = await fStore.getDocs(playersRef);
            if (snapshot.empty) {
                console.log("Seeding Firestore players from scraped data...");
                const chunks = [];
                for (let i = 0; i < allPlayersToSeed.length; i += 500) {
                    chunks.push(allPlayersToSeed.slice(i, i + 500));
                }
                for (const chunk of chunks) {
                    const batch = fStore.writeBatch(db);
                    chunk.forEach(p => {
                        const docRef = fStore.doc(db, "players", p.id);
                        batch.set(docRef, p);
                    });
                    await batch.commit();
                }
                console.log(`Firestore players seeded successfully: ${allPlayersToSeed.length} players.`);
            }
        } catch (err) {
            console.error("Failed to seed Firestore players:", err);
        }
    }
}

// Initialize connection
async function initDb() {
    if (!CONFIG.IS_DEMO_MODE && (!db || !fStore)) {
        try {
            // Dynamically import Firebase libraries from CDN to run fully client-side
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { 
                getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, writeBatch 
            } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            
            const app = initializeApp(CONFIG.FIREBASE_CONFIG);
            db = getFirestore(app);
            fStore = { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, writeBatch };
            console.log("Firebase Firestore successfully initialized!");
            
            // Seed matches if database is blank
            await seedMatchesIfEmpty();
            await seedPlayersIfEmpty();
        } catch (e) {
            console.error("Firebase connection failed. Falling back to local Demo Mode...", e);
            CONFIG.IS_DEMO_MODE = true;
        }
    }
    
    // Seed Mock DB in localStorage if empty or contains old demo data (Ahmet/Elif)
    if (CONFIG.IS_DEMO_MODE) {
        const stored = localStorage.getItem(MOCK_DB_KEY);
        if (!stored || stored.includes("user-ahmet")) {
            console.log("Old demo data detected. Force resetting to a clean World Cup 2026 slate!");
            resetMockDb();
            localStorage.removeItem('ACTIVE_USER_ID');
        } else {
            // Auto-seed missing matches in existing Demo Mode database
            const data = JSON.parse(stored);
            const existingIds = new Set(data.matches.map(m => m.id));
            const missingMatches = INITIAL_MOCK_DATA.matches.filter(m => !existingIds.has(m.id));
            if (missingMatches.length > 0) {
                console.log(`Demo Mode: Auto-seeding ${missingMatches.length} missing matches to localStorage...`);
                data.matches.push(...missingMatches);
                saveMockData(data);
            }
        }
        await seedPlayersIfEmpty();
        console.log("Using Local Storage Mock Database!");
    }
}

// Helper to get all data from Mock DB
function getMockData() {
    return JSON.parse(localStorage.getItem(MOCK_DB_KEY));
}

// Helper to save all data to Mock DB
function saveMockData(data) {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(data));
}

// Reset Local Mock DB
export function resetMockDb() {
    saveMockData(INITIAL_MOCK_DATA);
    return INITIAL_MOCK_DATA;
}

// --- DATABASE API METHODS ---

// 1. Get Users List
export async function getUsers() {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        return getMockData().users;
    } else {
        try {
            const snapshot = await fStore.getDocs(fStore.collection(db, "users"));
            const users = [];
            snapshot.forEach(doc => {
                users.push(doc.data());
            });
            return users.sort((a, b) => b.points - a.points);
        } catch (err) {
            console.error("Failed to get users from Firestore:", err);
            return [];
        }
    }
}

// 1.5 Login User (Matching username and password with migration)
export async function loginUser(username, password) {
    await initDb();
    const hashedPassword = await hashPassword(password.trim());
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        let shouldSave = false;
        const user = data.users.find(u => {
            const matchesUsername = u.name.toLowerCase() === username.toLowerCase().trim();
            if (!matchesUsername) return false;
            
            const storedPw = u.password;
            const isHashed = storedPw && storedPw.length === 64 && /^[0-9a-f]{64}$/i.test(storedPw);
            if (isHashed) {
                return storedPw === hashedPassword;
            } else {
                // Plain text check and auto-migrate
                if (storedPw === password.trim()) {
                    u.password = hashedPassword;
                    shouldSave = true;
                    return true;
                }
                return false;
            }
        });
        if (shouldSave) {
            saveMockData(data);
        }
        return user || null;
    } else {
        try {
            const q = fStore.query(fStore.collection(db, "users"), fStore.where("name", "==", username.trim()));
            const snapshot = await fStore.getDocs(q);
            let foundUser = null;
            let docToMigrate = null;
            snapshot.forEach(doc => {
                const u = doc.data();
                const storedPw = u.password;
                const isHashed = storedPw && storedPw.length === 64 && /^[0-9a-f]{64}$/i.test(storedPw);
                if (isHashed) {
                    if (storedPw === hashedPassword) {
                        foundUser = u;
                    }
                } else {
                    if (storedPw === password.trim()) {
                        foundUser = u;
                        docToMigrate = doc.id;
                    }
                }
            });
            if (docToMigrate && foundUser) {
                // Auto-migrate to hash in Firestore
                const userDocRef = fStore.doc(db, "users", docToMigrate);
                await fStore.updateDoc(userDocRef, { password: hashedPassword });
                foundUser.password = hashedPassword;
            }
            return foundUser;
        } catch (err) {
            console.error("Failed to login user in Firestore:", err);
            return null;
        }
    }
}

// 1.6 Register User (Creating default jokers wallet and initial profile)
export async function registerUser(username, password) {
    await initDb();
    const hashedPassword = await hashPassword(password.trim());
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const exists = data.users.some(u => u.name.toLowerCase() === username.toLowerCase().trim());
        if (exists) {
            throw new Error("Bu kullanıcı adı zaten alınmış!");
        }

        const newUser = {
            id: 'user-' + Date.now(),
            name: username.trim(),
            password: hashedPassword,
            avatar: "bg-gradient-to-tr from-cyan-500 to-blue-500",
            points: 0,
            jokers: {
                ciftesans: 1,
                doublepuan: 1,
                allin: 1,
                spy: 1,
                doksanarti: 1,
                sabotaj: 1
            },
            badge: null
        };

        data.users.push(newUser);
        saveMockData(data);
        return newUser;
    } else {
        // Query to check if username exists
        const q = fStore.query(fStore.collection(db, "users"), fStore.where("name", "==", username.trim()));
        const snapshot = await fStore.getDocs(q);
        if (!snapshot.empty) {
            throw new Error("Bu kullanıcı adı zaten alınmış!");
        }

        const userId = 'user-' + Date.now();
        const newUser = {
            id: userId,
            name: username.trim(),
            password: hashedPassword,
            avatar: "bg-gradient-to-tr from-cyan-500 to-blue-500",
            points: 0,
            jokers: {
                ciftesans: 1,
                doublepuan: 1,
                allin: 1,
                spy: 1,
                doksanarti: 1,
                sabotaj: 1
            },
            badge: null
        };

        try {
            await fStore.setDoc(fStore.doc(db, "users", userId), newUser);
            return newUser;
        } catch (err) {
            console.error("Failed to register user in Firestore:", err);
            throw new Error("Kayıt oluşturulurken bir hata oluştu!");
        }
    }
}

// Team name translation and normalization helper
export function normalizeTeamName(name) {
    if (!name) return "";
    const n = name.toLowerCase().trim();
    if (n.includes("mexico") || n === "meksika") return "Meksika";
    if (n.includes("south africa") || n === "güney afrika") return "Güney Afrika";
    if (n.includes("south korea") || n === "güney kore") return "Güney Kore";
    if (n.includes("czech") || n.includes("çekya") || n.includes("cze")) return "Çekya";
    if (n.includes("canada") || n === "kanada") return "Kanada";
    if (n.includes("bosnia") || n === "bosna-hersek") return "Bosna-Hersek";
    if (n.includes("qatar") || n === "katar") return "Katar";
    if (n.includes("switzerland") || n === "isviçre") return "İsviçre";
    if (n.includes("brazil") || n === "brezilya") return "Brezilya";
    if (n.includes("morocco") || n === "fas") return "Fas";
    if (n === "haiti") return "Haiti";
    if (n.includes("scotland") || n === "iskoçya") return "İskoçya";
    if (n.includes("usa") || n.includes("united states") || n === "abd") return "ABD";
    if (n === "paraguay") return "Paraguay";
    if (n.includes("australia") || n === "avustralya") return "Avustralya";
    if (n.includes("turkey") || n === "türkiye") return "Türkiye";
    if (n.includes("germany") || n === "almanya") return "Almanya";
    if (n.includes("curacao") || n.includes("curaçao")) return "Curaçao";
    if (n.includes("ivory coast") || n.includes("fildişi")) return "Fildişi Sahili";
    if (n.includes("ecuador") || n === "ekvador") return "Ekvador";
    if (n.includes("netherlands") || n === "hollanda") return "Hollanda";
    if (n.includes("japan") || n === "japonya") return "Japonya";
    if (n.includes("sweden") || n === "isveç") return "İsveç";
    if (n.includes("tunisia") || n === "tunus") return "Tunus";
    if (n.includes("belgium") || n === "belçika") return "Belçika";
    if (n.includes("egypt") || n === "mısır") return "Mısır";
    if (n.includes("iran")) return "İran";
    if (n.includes("new zealand") || n === "yeni zelanda") return "Yeni Zelanda";
    if (n.includes("spain") || n === "ispanya") return "İspanya";
    if (n.includes("cape verde") || n.includes("yeşil burun")) return "Yeşil Burun Adaları";
    if (n.includes("saudi arabia") || n === "suudi arabistan") return "Suudi Arabistan";
    if (n === "uruguay") return "Uruguay";
    if (n.includes("france") || n === "fransa") return "Fransa";
    if (n.includes("senegal")) return "Senegal";
    if (n.includes("iraq") || n === "irak") return "Irak";
    if (n.includes("norway") || n === "norveç") return "Norveç";
    if (n.includes("argentina") || n === "arjantin") return "Arjantin";
    if (n.includes("algeria") || n === "cezayir") return "Cezayir";
    if (n.includes("austria") || n === "avusturya") return "Avusturya";
    if (n.includes("jordan") || n === "ürdün") return "Ürdün";
    if (n.includes("portugal") || n === "portekiz") return "Portekiz";
    if (n.includes("congo") || n === "demokratik kongo" || n.includes("drc")) return "Demokratik Kongo";
    if (n.includes("uzbekistan") || n === "özbekistan") return "Özbekistan";
    if (n.includes("colombia") || n === "kolombiya") return "Kolombiya";
    if (n.includes("england") || n === "ingiltere") return "İngiltere";
    if (n.includes("croatia") || n === "hırvatistan") return "Hırvatistan";
    if (n.includes("ghana") || n === "gana") return "Gana";
    if (n.includes("panama")) return "Panama";
    return name.charAt(0).toUpperCase() + name.slice(1);
}


// Türkçe-İngilizce Takım Eşleştirme Haritası
const TEAM_TRANSLATIONS = {
    "mexico": "Meksika",
    "south africa": "Güney Afrika",
    "south korea": "Güney Kore",
    "korea republic": "Güney Kore",
    "czechia": "Çekya",
    "czech republic": "Çekya",
    "canada": "Kanada",
    "bosnia and herzegovina": "Bosna-Hersek",
    "bosnia-herzegovina": "Bosna-Hersek",
    "qatar": "Katar",
    "switzerland": "İsviçre",
    "brazil": "Brezilya",
    "morocco": "Fas",
    "haiti": "Haiti",
    "scotland": "İskoçya",
    "usa": "ABD",
    "united states": "ABD",
    "paraguay": "Paraguay",
    "australia": "Avustralya",
    "turkey": "Türkiye",
    "germany": "Almanya",
    "curacao": "Curaçao",
    "ivory coast": "Fildişi Sahili",
    "cote d'ivoire": "Fildişi Sahili",
    "ecuador": "Ekvador",
    "netherlands": "Hollanda",
    "japan": "Japonya",
    "sweden": "İsveç",
    "tunisia": "Tunus",
    "belgium": "Belçika",
    "egypt": "Mısır",
    "iran": "İran",
    "new zealand": "Yeni Zelanda",
    "spain": "İspanya",
    "cape verde": "Yeşil Burun Adaları",
    "saudi arabia": "Suudi Arabistan",
    "uruguay": "Uruguay",
    "france": "Fransa",
    "senegal": "Senegal",
    "iraq": "Irak",
    "norway": "Norveç",
    "argentina": "Arjantin",
    "algeria": "Cezayir",
    "austria": "Avusturya",
    "jordan": "Ürdün",
    "portugal": "Portekiz",
    "dr congo": "Demokratik Kongo",
    "congo dr": "Demokratik Kongo",
    "congo": "Demokratik Kongo",
    "uzbekistan": "Özbekistan",
    "colombia": "Kolombiya",
    "england": "İngiltere",
    "croatia": "Hırvatistan",
    "ghana": "Gana",
    "panama": "Panama"
};

// SportDB.dev API önbellek verisini okuma
export async function getLiveScoresCache() {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        try {
            const cacheStr = localStorage.getItem("SPORTDB_LIVE_CACHE");
            return cacheStr ? JSON.parse(cacheStr) : null;
        } catch (e) {
            return null;
        }
    } else {
        try {
            const cacheDoc = await fStore.getDoc(fStore.doc(db, "live_scores_cache", "current"));
            return cacheDoc.exists() ? cacheDoc.data() : null;
        } catch (e) {
            console.error("Failed to read Firestore live cache:", e);
            return null;
        }
    }
}

// SportDB.dev API'den skorları ve maç durumlarını senkronize eden paylaşımlı önbellek metod
export async function syncLiveScoresFromSportDb(forceUpdate = false) {
    await initDb();
    const now = Date.now();
    
    // 1. Tüm maçları çek
    let matches = [];
    if (CONFIG.IS_DEMO_MODE) {
        matches = getMockData().matches;
    } else {
        try {
            const snapshot = await fStore.getDocs(fStore.collection(db, "matches"));
            snapshot.forEach(doc => {
                matches.push(doc.data());
            });
        } catch (e) {
            console.error("Failed to fetch matches for live sync:", e);
            return null;
        }
    }

    // 2. Aktif maç var mı kontrol et (Maç başlangıcından 5 dk öncesi ile 2.5 saat sonrası arası)
    const activeMatchesInDb = matches.filter(m => {
        if (m.isFinalized) return false;
        if (m.status === 'LIVE') return true;
        if (m.status === 'SCHEDULED') {
            const matchTime = new Date(m.date).getTime();
            const timeDiff = now - matchTime;
            // 5 dakika önceden 2.5 saat sonraya kadar aktif kabul et
            return timeDiff >= -300000 && timeDiff <= 9000000;
        }
        return false;
    });

    if (activeMatchesInDb.length === 0 && !forceUpdate) {
        console.log("SportDB sync: Aktif veya yakında başlayacak maç bulunmuyor. API çağrısı engellendi.");
        return matches;
    }

    // 3. Ortak önbelleği kontrol et
    let cache = null;
    if (CONFIG.IS_DEMO_MODE) {
        try {
            const cacheStr = localStorage.getItem("SPORTDB_LIVE_CACHE");
            if (cacheStr) cache = JSON.parse(cacheStr);
        } catch (e) {}
    } else {
        try {
            const cacheDoc = await fStore.getDoc(fStore.doc(db, "live_scores_cache", "current"));
            if (cacheDoc.exists()) {
                cache = cacheDoc.data();
            }
        } catch (e) {
            console.error("Failed to read Firestore live cache:", e);
        }
    }

    const cacheAgeLimit = 420000; // 7 dakika önbellek süresi (ms)
    const canRefreshCache = forceUpdate || !cache || (now - cache.lastUpdated > cacheAgeLimit);

    if (!canRefreshCache) {
        console.log("SportDB sync: Önbellek güncel, veriler önbellekten okundu.");
        if (cache && cache.matches) {
            let updated = false;
            cache.matches.forEach(cMatch => {
                const localMatch = matches.find(m => m.id === cMatch.id);
                if (localMatch && !localMatch.isFinalized) {
                    if (localMatch.homeScore !== cMatch.homeScore || 
                        localMatch.awayScore !== cMatch.awayScore || 
                        localMatch.status !== cMatch.status ||
                        localMatch.elapsedTime !== cMatch.elapsedTime ||
                        localMatch.sportDbEventId !== cMatch.sportDbEventId) {
                        
                        localMatch.homeScore = cMatch.homeScore;
                        localMatch.awayScore = cMatch.awayScore;
                        localMatch.status = cMatch.status;
                        localMatch.elapsedTime = cMatch.elapsedTime;
                        localMatch.sportDbEventId = cMatch.sportDbEventId;
                        localMatch.sportDbLinks = cMatch.sportDbLinks;
                        updated = true;
                    }
                }
            });
            if (updated && CONFIG.IS_DEMO_MODE) {
                const mockData = getMockData();
                mockData.matches = matches;
                saveMockData(mockData);
            }
        }
        return matches;
    }

    // 4. API'den yeni skorları al ve önbelleği güncelle
    console.log("SportDB sync: Önbellek eski veya zorlandı. API sorgulanıyor...");
    
    // Kilit kontrolü (30 saniye kilitleme)
    if (!CONFIG.IS_DEMO_MODE && cache && cache.isLocked && (now - cache.lastUpdated < 30000)) {
        console.log("SportDB sync: Başka bir istemci şu an güncelleme yapıyor, kilit beklendi.");
        return matches;
    }

    if (!CONFIG.IS_DEMO_MODE) {
        try {
            await fStore.setDoc(fStore.doc(db, "live_scores_cache", "current"), {
                isLocked: true,
                lastUpdated: now
            }, { merge: true });
        } catch (e) {}
    }

    try {
        const apiKey = CONFIG.SPORTDB_API_KEY || "cHQZm8aayC8IxAYZoFLLAYkV58xUiED928pp1fif";
        const targetUrl = "https://api.sportdb.dev/api/flashscore/football/live";
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}&reqHeaders=x-api-key:${apiKey}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }
        const apiMatches = await response.json();
        
        const cacheMatches = [];
        const dbUpdates = [];
        let updatedCount = 0;

        apiMatches.forEach(g => {
            if (!g.homeName || !g.awayName) return;
            const homeTranslated = TEAM_TRANSLATIONS[g.homeName.toLowerCase().trim()] || g.homeName;
            const awayTranslated = TEAM_TRANSLATIONS[g.awayName.toLowerCase().trim()] || g.awayName;

            const localMatch = matches.find(m => 
                (m.homeTeam.toLowerCase().trim() === homeTranslated.toLowerCase().trim() && 
                 m.awayTeam.toLowerCase().trim() === awayTranslated.toLowerCase().trim())
            );

            if (localMatch) {
                if (localMatch.isFinalized) return;

                const newHomeScore = parseInt(g.homeScore) || 0;
                const newAwayScore = parseInt(g.awayScore) || 0;
                
                let newStatus = "SCHEDULED";
                if (g.eventStage === "FINISHED") {
                    newStatus = "FINISHED";
                } else if (g.eventStage === "LIVE" || g.eventStage === "IN_PROGRESS") {
                    newStatus = "LIVE";
                }

                const elapsedTime = g.gameTime && g.gameTime !== "-1" ? `${g.gameTime}'` : (newStatus === "FINISHED" ? "MS" : "");

                cacheMatches.push({
                    id: localMatch.id,
                    homeScore: newHomeScore,
                    awayScore: newAwayScore,
                    status: newStatus,
                    elapsedTime: elapsedTime,
                    sportDbEventId: g.eventId,
                    sportDbLinks: g.links
                });

                if (localMatch.homeScore !== newHomeScore || 
                    localMatch.awayScore !== newAwayScore || 
                    localMatch.status !== newStatus ||
                    localMatch.elapsedTime !== elapsedTime ||
                    !localMatch.sportDbEventId) {
                    
                    localMatch.homeScore = newHomeScore;
                    localMatch.awayScore = newAwayScore;
                    localMatch.status = newStatus;
                    localMatch.elapsedTime = elapsedTime;
                    localMatch.sportDbEventId = g.eventId;
                    localMatch.sportDbLinks = g.links;

                    dbUpdates.push(localMatch);
                    updatedCount++;
                }
            }
        });

        // Önbelleği kaydet
        const cacheData = {
            matches: cacheMatches,
            lastUpdated: now,
            isLocked: false
        };

        if (CONFIG.IS_DEMO_MODE) {
            localStorage.setItem("SPORTDB_LIVE_CACHE", JSON.stringify(cacheData));
        } else {
            await fStore.setDoc(fStore.doc(db, "live_scores_cache", "current"), cacheData);
        }

        // Veritabanını güncelle
        if (updatedCount > 0) {
            console.log(`SportDB sync: ${updatedCount} maç skoru güncellendi.`);
            if (CONFIG.IS_DEMO_MODE) {
                const mockData = getMockData();
                mockData.matches = matches;
                saveMockData(mockData);
            } else {
                const batch = fStore.writeBatch(db);
                dbUpdates.forEach(m => {
                    const matchDoc = fStore.doc(db, "matches", m.id);
                    batch.set(matchDoc, m, { merge: true });
                });
                await batch.commit();
            }
        }
        
        return matches;
    } catch (err) {
        console.error("SportDB score sync failed:", err);
        if (!CONFIG.IS_DEMO_MODE) {
            try {
                await fStore.setDoc(fStore.doc(db, "live_scores_cache", "current"), {
                    isLocked: false
                }, { merge: true });
            } catch (e) {}
        }
    }
    return matches;
}

// 2. Get Matches List
export async function getMatches() {
    await initDb();
    
    // Arka planda skorları asenkron olarak senkronize et, getMatches'ı engelleme!
    syncLiveScoresFromFreeApi().catch(e => console.error("Background sync failed:", e));
    
    if (CONFIG.IS_DEMO_MODE) {
        return getMockData().matches;
    } else {
        try {
            const snapshot = await fStore.getDocs(fStore.collection(db, "matches"));
            const matches = [];
            snapshot.forEach(doc => {
                matches.push(doc.data());
            });
            const getMatchNum = id => parseInt(id.replace('match-wc', '').replace('match-', '')) || 0;
            return matches.sort((a, b) => getMatchNum(a.id) - getMatchNum(b.id));
        } catch (err) {
            console.error("Failed to get matches from Firestore:", err);
            return INITIAL_MOCK_DATA.matches;
        }
    }
}

// 3. Get Predictions List
export async function getPredictions(userId = null, matchId = null) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        let preds = getMockData().predictions;
        if (userId) preds = preds.filter(p => p.userId === userId);
        if (matchId) preds = preds.filter(p => p.matchId === matchId);
        return preds;
    } else {
        try {
            let preds = [];
            if (userId && matchId) {
                const docRef = fStore.doc(db, "predictions", `${userId}_${matchId}`);
                const docSnap = await fStore.getDoc(docRef);
                if (docSnap.exists()) {
                    preds.push(docSnap.data());
                }
            } else {
                let q = fStore.collection(db, "predictions");
                if (userId) {
                    q = fStore.query(q, fStore.where("userId", "==", userId));
                } else if (matchId) {
                    q = fStore.query(q, fStore.where("matchId", "==", matchId));
                }
                const snapshot = await fStore.getDocs(q);
                snapshot.forEach(doc => {
                    preds.push(doc.data());
                });
            }
            return preds;
        } catch (err) {
            console.error("Failed to get predictions from Firestore:", err);
            return [];
        }
    }
}

// Helper to get a single match by id
async function getMatchById(matchId) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        return getMockData().matches.find(m => m.id === matchId);
    } else {
        try {
            const docRef = fStore.doc(db, "matches", matchId);
            const docSnap = await fStore.getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (err) {
            console.error("Failed to get match from Firestore:", err);
            return null;
        }
    }
}

// 4. Save/Update a Prediction
export async function savePrediction(prediction) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const index = data.predictions.findIndex(p => p.userId === prediction.userId && p.matchId === prediction.matchId);
        const oldPred = index >= 0 ? { ...data.predictions[index] } : null;
        
        const newPred = {
            id: index >= 0 ? data.predictions[index].id : `pred-${Date.now()}`,
            ...prediction
        };

        if (index >= 0) {
            data.predictions[index] = newPred;
        } else {
            data.predictions.push(newPred);
        }

        // Handle Joker refund/subtract
        const oldJoker = oldPred ? oldPred.appliedJoker : null;
        const newJoker = prediction.appliedJoker || null;

        if (oldJoker !== newJoker) {
            const userIndex = data.users.findIndex(u => u.id === prediction.userId);
            if (userIndex >= 0) {
                const user = data.users[userIndex];
                if (oldJoker) {
                    user.jokers[oldJoker] = (user.jokers[oldJoker] || 0) + 1;
                }
                if (newJoker) {
                    if (user.jokers[newJoker] > 0) {
                        user.jokers[newJoker]--;
                    }
                }
            }
        }

        saveMockData(data);
        return newPred;
    } else {
        try {
            const docId = `${prediction.userId}_${prediction.matchId}`;
            const docRef = fStore.doc(db, "predictions", docId);
            const docSnap = await fStore.getDoc(docRef);
            const exists = docSnap.exists();
            const oldPred = exists ? docSnap.data() : null;
            
            const newPred = {
                id: exists ? oldPred.id : `pred-${Date.now()}`,
                ...prediction
            };
            
            await fStore.setDoc(docRef, newPred);
            
            // Handle Joker refund/subtract
            const oldJoker = oldPred ? oldPred.appliedJoker : null;
            const newJoker = prediction.appliedJoker || null;
            
            if (oldJoker !== newJoker) {
                const userDocRef = fStore.doc(db, "users", prediction.userId);
                const userSnap = await fStore.getDoc(userDocRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    let updated = false;
                    if (oldJoker) {
                        userData.jokers[oldJoker] = (userData.jokers[oldJoker] || 0) + 1;
                        updated = true;
                    }
                    if (newJoker) {
                        if (userData.jokers[newJoker] > 0) {
                            userData.jokers[newJoker]--;
                            updated = true;
                        }
                    }
                    if (updated) {
                        await fStore.updateDoc(userDocRef, {
                            jokers: userData.jokers
                        });
                    }
                }
            }
            return newPred;
        } catch (err) {
            console.error("Failed to save prediction in Firestore:", err);
            return prediction;
        }
    }
}

// 5. Save Admin Match Analysis
export async function updateAdminAnalysis(matchId, analysisText) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex >= 0) {
            data.matches[matchIndex].analysis = analysisText;
            saveMockData(data);
            return true;
        }
        return false;
    } else {
        try {
            const matchDocRef = fStore.doc(db, "matches", matchId);
            await fStore.updateDoc(matchDocRef, {
                analysis: analysisText
            });
            return true;
        } catch (err) {
            console.error("Failed to update admin analysis in Firestore:", err);
            return false;
        }
    }
}

// 6. Complete Match (Runs Puanlama Algoritması)
export async function completeMatch(matchId, homeScore, awayScore, sideAnswersActual, extraData = {}) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex < 0) return false;

        const match = data.matches[matchIndex];
        match.homeScore = parseInt(homeScore);
        match.awayScore = parseInt(awayScore);
        match.status = "FINISHED";
        match.isFinalized = true;
        match.sideQuestions = { ...sideAnswersActual };
        if (extraData.statistics) match.statistics = extraData.statistics;
        if (extraData.incidents) match.incidents = extraData.incidents;

        // Puanlama Hesaplaması
        const matchPredictions = data.predictions.filter(p => p.matchId === matchId);
        
        for (const pred of matchPredictions) {
            let pts = 0;
            const userIndex = data.users.findIndex(u => u.id === pred.userId);
            if (userIndex < 0) continue;

            const user = data.users[userIndex];

            // 1. Skoru Karşılaştırma
            const isExact = (pred.homeScorePred === match.homeScore && pred.awayScorePred === match.awayScore);
            const isExactAlt = pred.appliedJoker === 'ciftesans' && (pred.homeScorePredAlt === match.homeScore && pred.awayScorePredAlt === match.awayScore);
            
            const realDiff = match.homeScore - match.awayScore;
            const predDiff = pred.homeScorePred - pred.awayScorePred;
            const isDiffCorrect = (realDiff === predDiff && Math.sign(realDiff) === Math.sign(predDiff));

            const isOutcomeCorrect = (Math.sign(realDiff) === Math.sign(predDiff));
            
            // Çifte Şans ek kontrolü
            let isOutcomeAltCorrect = false;
            if (pred.appliedJoker === 'ciftesans') {
                const predDiffAlt = pred.homeScorePredAlt - pred.awayScorePredAlt;
                isOutcomeAltCorrect = (Math.sign(realDiff) === Math.sign(predDiffAlt));
            }

            // Puan Ekleme (En yüksek olanı ekle)
            if (isExact || isExactAlt) {
                pts += CONFIG.SCORING.EXACT_SCORE;
            } else if (isDiffCorrect) {
                pts += CONFIG.SCORING.DIFF_AND_OUTCOME;
            } else if (isOutcomeCorrect || isOutcomeAltCorrect) {
                pts += CONFIG.SCORING.OUTCOME_ONLY;
            }

            // 2. Yan Sorular Karşılaştırma
            if (pred.sideAnswers) {
                if (pred.sideAnswers.htResult === match.sideQuestions.htResult) pts += CONFIG.SCORING.SIDE_QUESTION;
                if (pred.sideAnswers.firstScorer === match.sideQuestions.firstScorer) pts += CONFIG.SCORING.SIDE_QUESTION;
                
                // Red card boolean comparison
                const predRedCard = String(pred.sideAnswers.redCard) === 'true';
                const actualRedCard = String(match.sideQuestions.redCard) === 'true';
                if (predRedCard === actualRedCard) pts += CONFIG.SCORING.SIDE_QUESTION;
                
                if (pred.sideAnswers.cornersOverUnder === match.sideQuestions.cornersOverUnder) pts += CONFIG.SCORING.SIDE_QUESTION;
            }

            // 3. Joker Etkisi Çarpanları
            let finalPts = pts;
            
            if (pred.appliedJoker === "doublepuan") {
                if (pts > 0) {
                    finalPts = pts * 2;
                } else {
                    finalPts = -5; // Yanlış tahmin cezası
                }
            } else if (pred.appliedJoker === "allin") {
                if (isExact) {
                    finalPts = CONFIG.SCORING.EXACT_SCORE * 3; // 3x Puan (30 puan)
                } else {
                    finalPts = -15; // All in yattı riski
                }
            }

            // Sabotaj Jokeri Kontrolü (Başka biri bu kullanıcıyı sabote etti mi?)
            const sabotageOnUser = data.predictions.find(p => p.matchId === matchId && p.appliedJoker === 'sabotaj' && p.targetUserId === user.id);
            if (sabotageOnUser) {
                finalPts = Math.round(finalPts * 0.5); // Sabotaj yedi, yarı puan!
            }

            user.points += finalPts;
        }

        // Liderlik tablosu rozetlerini (badges) puanlara göre güncelle
        data.users.sort((a, b) => b.points - a.points);
        data.users.forEach((u, i) => {
            u.badge = null;
            if (i === 0) u.badge = "kahin";
            if (data.users.length > 1 && i === data.users.length - 1) {
                u.badge = "aglayan";
            }
        });

        saveMockData(data);
        return true;
    } else {
        try {
            const matchDocRef = fStore.doc(db, "matches", matchId);
            const updatePayload = {
                homeScore: parseInt(homeScore),
                awayScore: parseInt(awayScore),
                status: "FINISHED",
                isFinalized: true,
                sideQuestions: sideAnswersActual
            };
            if (extraData.statistics) updatePayload.statistics = extraData.statistics;
            if (extraData.incidents) updatePayload.incidents = extraData.incidents;
            if (extraData.elapsedTime) updatePayload.elapsedTime = extraData.elapsedTime;
            
            await fStore.updateDoc(matchDocRef, updatePayload);
            await recalculateAllUsersPoints();
            return true;
        } catch (err) {
            console.error("Failed to complete match in Firestore:", err);
            return false;
        }
    }
}

// 7. Get API Stats (Top Scorer, Assists)
export async function getApiStats() {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        return {
            topScorers: data.topScorers || INITIAL_MOCK_DATA.topScorers,
            topAssists: data.topAssists || INITIAL_MOCK_DATA.topAssists
        };
    } else {
        try {
            const docRef = fStore.doc(db, "metadata", "apiStats");
            const docSnap = await fStore.getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
        } catch (err) {
            console.error("Failed to get api stats from Firestore:", err);
        }
        return {
            topScorers: INITIAL_MOCK_DATA.topScorers,
            topAssists: INITIAL_MOCK_DATA.topAssists
        };
    }
}

// 7.5 Save API Stats (Top Scorer, Assists)
export async function saveApiStats(topScorers, topAssists) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        data.topScorers = topScorers;
        data.topAssists = topAssists;
        saveMockData(data);
        return true;
    } else {
        try {
            const docRef = fStore.doc(db, "metadata", "apiStats");
            await fStore.setDoc(docRef, {
                topScorers: topScorers,
                topAssists: topAssists
            }, { merge: true });
            return true;
        } catch (err) {
            console.error("Failed to save api stats to Firestore:", err);
            return false;
        }
    }
}


// 8. Update Match Live Scores (Live Simulation Mode)
export async function updateLiveScore(matchId, homeScore, awayScore, status = "LIVE") {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const index = data.matches.findIndex(m => m.id === matchId);
        if (index >= 0) {
            data.matches[index].homeScore = parseInt(homeScore);
            data.matches[index].awayScore = parseInt(awayScore);
            data.matches[index].status = status;
            saveMockData(data);
            return data.matches[index];
        }
    } else {
        try {
            const matchDocRef = fStore.doc(db, "matches", matchId);
            const updatedData = {
                homeScore: parseInt(homeScore),
                awayScore: parseInt(awayScore),
                status: status
            };
            await fStore.updateDoc(matchDocRef, updatedData);
            const updatedSnap = await fStore.getDoc(matchDocRef);
            return updatedSnap.data();
        } catch (err) {
            console.error("Failed to update live score in Firestore:", err);
        }
    }
    return null;
}

// 10. Fetch stats for a specific match from API-Football

// --- WORLD CUP 2026 BRACKET PREDICTIONS API ---

// Fetch groups data dynamically based on matches
export async function getGroupsData() {
    await initDb();
    const data = getMockData();
    const matches = data.matches;
    const groups = {};
    
    matches.forEach(m => {
        if (!m.group) return;
        if (!groups[m.group]) {
            groups[m.group] = {};
        }
        if (!groups[m.group][m.homeTeam]) {
            groups[m.group][m.homeTeam] = { name: m.homeTeam, code: m.homeTeamCode || m.homeTeam.substring(0,3).toUpperCase(), flag: m.homeFlag };
        }
        if (!groups[m.group][m.awayTeam]) {
            groups[m.group][m.awayTeam] = { name: m.awayTeam, code: m.awayTeamCode || m.awayTeam.substring(0,3).toUpperCase(), flag: m.awayFlag };
        }
    });
    
    const result = {};
    for (const [groupName, teamsMap] of Object.entries(groups)) {
        result[groupName] = Object.values(teamsMap);
    }
    return result;
}

// Calculate group standings based on actual matches scores
export function calculateActualGroupStandings(matches) {
    const standings = {};
    
    matches.forEach(m => {
        if (!m.group) return;
        if (!standings[m.group]) standings[m.group] = {};
        if (!standings[m.group][m.homeTeam]) {
            standings[m.group][m.homeTeam] = { name: m.homeTeam, pts: 0, gd: 0, gs: 0, code: m.homeTeamCode, flag: m.homeFlag };
        }
        if (!standings[m.group][m.awayTeam]) {
            standings[m.group][m.awayTeam] = { name: m.awayTeam, pts: 0, gd: 0, gs: 0, code: m.awayTeamCode, flag: m.awayFlag };
        }
        
        if (m.status === 'FINISHED') {
            const h = parseInt(m.homeScore) || 0;
            const a = parseInt(m.awayScore) || 0;
            standings[m.group][m.homeTeam].gs += h;
            standings[m.group][m.awayTeam].gs += a;
            standings[m.group][m.homeTeam].gd += (h - a);
            standings[m.group][m.awayTeam].gd += (a - h);
            
            if (h > a) {
                standings[m.group][m.homeTeam].pts += 3;
            } else if (h < a) {
                standings[m.group][m.awayTeam].pts += 3;
            } else {
                standings[m.group][m.homeTeam].pts += 1;
                standings[m.group][m.awayTeam].pts += 1;
            }
        }
    });
    
    const result = {};
    for (const [groupLetter, groupTeams] of Object.entries(standings)) {
        const sorted = Object.values(groupTeams).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            if (b.gs !== a.gs) return b.gs - a.gs;
            return a.name.localeCompare(b.name);
        });
        result[groupLetter] = sorted;
    }
    return result;
}

// Get group predictions for a user
export async function getGroupPredictions(userId) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (!data.groupPredictions) data.groupPredictions = {};
        return data.groupPredictions[userId] || null;
    } else {
        try {
            const docRef = fStore.doc(db, "groupPredictions", userId);
            const docSnap = await fStore.getDoc(docRef);
            return docSnap.exists() ? docSnap.data().predictions : null;
        } catch (err) {
            console.error("Failed to get group predictions from Firestore:", err);
            return null;
        }
    }
}

// Save group predictions for a user
export async function saveGroupPredictions(userId, groupPredictions) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (!data.groupPredictions) data.groupPredictions = {};
        data.groupPredictions[userId] = groupPredictions;
        saveMockData(data);
        return groupPredictions;
    } else {
        try {
            const docRef = fStore.doc(db, "groupPredictions", userId);
            await fStore.setDoc(docRef, { userId, predictions: groupPredictions });
            return groupPredictions;
        } catch (err) {
            console.error("Failed to save group predictions in Firestore:", err);
            return groupPredictions;
        }
    }
}

// Get bracket predictions for a user
export async function getBracketPredictions(userId) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (!data.bracketPredictions) data.bracketPredictions = {};
        return data.bracketPredictions[userId] || null;
    } else {
        try {
            const docRef = fStore.doc(db, "bracketPredictions", userId);
            const docSnap = await fStore.getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (err) {
            console.error("Failed to get bracket predictions from Firestore:", err);
            return null;
        }
    }
}

// Save bracket predictions for a user
export async function saveBracketPredictions(userId, bracketPredictions) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (!data.bracketPredictions) data.bracketPredictions = {};
        data.bracketPredictions[userId] = bracketPredictions;
        saveMockData(data);
    } else {
        try {
            const docRef = fStore.doc(db, "bracketPredictions", userId);
            await fStore.setDoc(docRef, { userId, ...bracketPredictions });
        } catch (err) {
            console.error("Failed to save bracket predictions in Firestore:", err);
        }
    }
    
    // Recalculate user points immediately when predictions are saved/updated!
    await recalculateAllUsersPoints();
    return bracketPredictions;
}

// Recalculate bracket points for a specific user based on actual matches
export function calculateBracketPoints(userId, data) {
    let pts = 0;
    if (!data.groupPredictions || !data.groupPredictions[userId]) return 0;
    if (!data.bracketPredictions || !data.bracketPredictions[userId]) return 0;

    const userGroupPred = data.groupPredictions[userId];
    const userBracketPred = data.bracketPredictions[userId];
    
    // 1. Group Standings Scoring (1 point for correct position)
    const actualStandings = calculateActualGroupStandings(data.matches);
    for (const [groupLetter, predTeams] of Object.entries(userGroupPred)) {
        const actualTeams = actualStandings[groupLetter];
        if (actualTeams && actualTeams.length === 4) {
            // Check if matches in this group have been completed to evaluate
            const groupMatches = data.matches.filter(m => m.group === groupLetter);
            const isGroupFinished = groupMatches.every(m => m.status === 'FINISHED');
            
            if (isGroupFinished) {
                predTeams.forEach((teamName, index) => {
                    if (actualTeams[index] && actualTeams[index].name === teamName) {
                        pts += 1;
                    }
                });
            }
        }
    }

    // 2. Elemeler (Knockout) Scoring (2 points for correct winner prediction)
    // Matches 73-104 correspond to knockout matches
    const allRounds = ['r32', 'r16', 'qf', 'sf', 'final'];
    allRounds.forEach(round => {
        const roundPreds = userBracketPred[round];
        if (roundPreds) {
            for (const [matchId, predWinner] of Object.entries(roundPreds)) {
                // Find actual match
                const actualMatch = data.matches.find(m => m.id === matchId);
                if (actualMatch && actualMatch.status === 'FINISHED') {
                    const hScore = parseInt(actualMatch.homeScore) || 0;
                    const aScore = parseInt(actualMatch.awayScore) || 0;
                    const actualWinner = hScore > aScore ? actualMatch.homeTeam : actualMatch.awayTeam;
                    if (actualWinner === predWinner) {
                        pts += 2;
                    }
                }
            }
        }
    });

    return pts;
}

// Recalculates all users points combining match predictions + group standings + tournament bracket + fantasy ratings
export async function recalculateAllUsersPoints() {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (!data) return;

        data.users.forEach(user => {
            // Start from base match predictions scoring (recomputed dynamically from data.predictions)
            let basePts = 0;
            const userPreds = data.predictions.filter(p => p.userId === user.id);
            
            userPreds.forEach(pred => {
                const match = data.matches.find(m => m.id === pred.matchId);
                if (!match || match.status !== 'FINISHED') return;

                let mPts = 0;
                const isExact = (pred.homeScorePred === match.homeScore && pred.awayScorePred === match.awayScore);
                const isExactAlt = pred.appliedJoker === 'ciftesans' && (pred.homeScorePredAlt === match.homeScore && pred.awayScorePredAlt === match.awayScore);
                const realDiff = match.homeScore - match.awayScore;
                const predDiff = pred.homeScorePred - pred.awayScorePred;
                const isDiffCorrect = (realDiff === predDiff && Math.sign(realDiff) === Math.sign(predDiff));
                const isOutcomeCorrect = (Math.sign(realDiff) === Math.sign(predDiff));
                
                let isOutcomeAltCorrect = false;
                if (pred.appliedJoker === 'ciftesans') {
                    const predDiffAlt = pred.homeScorePredAlt - pred.awayScorePredAlt;
                    isOutcomeAltCorrect = (Math.sign(realDiff) === Math.sign(predDiffAlt));
                }

                if (isExact || isExactAlt) {
                    mPts += CONFIG.SCORING.EXACT_SCORE;
                } else if (isDiffCorrect) {
                    mPts += CONFIG.SCORING.DIFF_AND_OUTCOME;
                } else if (isOutcomeCorrect || isOutcomeAltCorrect) {
                    mPts += CONFIG.SCORING.OUTCOME_ONLY;
                }

                if (pred.sideAnswers && match.sideQuestions) {
                    if (pred.sideAnswers.htResult === match.sideQuestions.htResult) mPts += CONFIG.SCORING.SIDE_QUESTION;
                    if (pred.sideAnswers.firstScorer === match.sideQuestions.firstScorer) mPts += CONFIG.SCORING.SIDE_QUESTION;
                    const predRedCard = String(pred.sideAnswers.redCard) === 'true';
                    const actualRedCard = String(match.sideQuestions.redCard) === 'true';
                    if (predRedCard === actualRedCard) mPts += CONFIG.SCORING.SIDE_QUESTION;
                    if (pred.sideAnswers.cornersOverUnder === match.sideQuestions.cornersOverUnder) mPts += CONFIG.SCORING.SIDE_QUESTION;
                }

                let finalPts = mPts;
                if (pred.appliedJoker === "doublepuan") {
                    finalPts = mPts > 0 ? mPts * 2 : -5;
                } else if (pred.appliedJoker === "allin") {
                    finalPts = isExact ? CONFIG.SCORING.EXACT_SCORE * 3 : -15;
                }

                const sabotageOnUser = data.predictions.find(p => p.matchId === match.id && p.appliedJoker === 'sabotaj' && p.targetUserId === user.id);
                if (sabotageOnUser) {
                    finalPts = Math.round(finalPts * 0.5);
                }
                basePts += finalPts;
            });

            // Add Group + Bracket points
            const bracketPts = calculateBracketPoints(user.id, data);

            // Add Fantasy points
            let fantasyPts = 0;
            if (data.fantasySquads && data.fantasySquads[user.id]) {
                const userSquads = data.fantasySquads[user.id];
                for (const [matchId, squad] of Object.entries(userSquads)) {
                    const match = data.matches.find(m => m.id === matchId);
                    if (match && match.status === 'FINISHED' && match.playerRatings) {
                        squad.players.forEach(pId => {
                            let r = parseFloat(match.playerRatings[pId]) || 0;
                            if (pId === squad.captain) {
                                r = r * 2;
                            }
                            fantasyPts += r;
                        });
                    }
                }
            }

            user.points = Math.max(0, Math.round((basePts + bracketPts + fantasyPts) * 10) / 10);
            user.predictionPoints = Math.round((basePts + bracketPts) * 10) / 10;
            user.fantasyPoints = Math.round(fantasyPts * 10) / 10;
        });

        // Re-rank users and apply badges
        data.users.sort((a, b) => b.points - a.points);
        data.users.forEach((u, i) => {
            u.badge = null;
            if (i === 0) u.badge = "kahin";
            if (data.users.length > 1 && i === data.users.length - 1) {
                u.badge = "aglayan";
            }
        });

        saveMockData(data);
    } else {
        try {
            // Real Firestore recalculation
            const usersSnapshot = await fStore.getDocs(fStore.collection(db, "users"));
            const matchesSnapshot = await fStore.getDocs(fStore.collection(db, "matches"));
            const predsSnapshot = await fStore.getDocs(fStore.collection(db, "predictions"));
            const groupPredsSnapshot = await fStore.getDocs(fStore.collection(db, "groupPredictions"));
            const bracketPredsSnapshot = await fStore.getDocs(fStore.collection(db, "bracketPredictions"));
            const fantasySquadsSnapshot = await fStore.getDocs(fStore.collection(db, "fantasySquads"));
            
            const users = [];
            usersSnapshot.forEach(doc => users.push(doc.data()));
            
            const matches = [];
            matchesSnapshot.forEach(doc => matches.push(doc.data()));
            
            const predictions = [];
            predsSnapshot.forEach(doc => predictions.push(doc.data()));
            
            const groupPredictions = {};
            groupPredsSnapshot.forEach(doc => {
                groupPredictions[doc.id] = doc.data().predictions;
            });
            
            const bracketPredictions = {};
            bracketPredsSnapshot.forEach(doc => {
                bracketPredictions[doc.id] = doc.data();
            });

            const fantasySquads = [];
            fantasySquadsSnapshot.forEach(doc => fantasySquads.push(doc.data()));
            
            const contextData = {
                matches,
                groupPredictions,
                bracketPredictions
            };
            
            users.forEach(user => {
                let basePts = 0;
                const userPreds = predictions.filter(p => p.userId === user.id);
                
                userPreds.forEach(pred => {
                    const match = matches.find(m => m.id === pred.matchId);
                    if (!match || match.status !== 'FINISHED') return;

                    let mPts = 0;
                    const isExact = (pred.homeScorePred === match.homeScore && pred.awayScorePred === match.awayScore);
                    const isExactAlt = pred.appliedJoker === 'ciftesans' && (pred.homeScorePredAlt === match.homeScore && pred.awayScorePredAlt === match.awayScore);
                    const realDiff = match.homeScore - match.awayScore;
                    const predDiff = pred.homeScorePred - pred.awayScorePred;
                    const isDiffCorrect = (realDiff === predDiff && Math.sign(realDiff) === Math.sign(predDiff));
                    const isOutcomeCorrect = (Math.sign(realDiff) === Math.sign(predDiff));
                    
                    let isOutcomeAltCorrect = false;
                    if (pred.appliedJoker === 'ciftesans') {
                        const predDiffAlt = pred.homeScorePredAlt - pred.awayScorePredAlt;
                        isOutcomeAltCorrect = (Math.sign(realDiff) === Math.sign(predDiffAlt));
                    }

                    if (isExact || isExactAlt) {
                        mPts += CONFIG.SCORING.EXACT_SCORE;
                    } else if (isDiffCorrect) {
                        mPts += CONFIG.SCORING.DIFF_AND_OUTCOME;
                    } else if (isOutcomeCorrect || isOutcomeAltCorrect) {
                        mPts += CONFIG.SCORING.OUTCOME_ONLY;
                    }

                    if (pred.sideAnswers && match.sideQuestions) {
                        if (pred.sideAnswers.htResult === match.sideQuestions.htResult) mPts += CONFIG.SCORING.SIDE_QUESTION;
                        if (pred.sideAnswers.firstScorer === match.sideQuestions.firstScorer) mPts += CONFIG.SCORING.SIDE_QUESTION;
                        const predRedCard = String(pred.sideAnswers.redCard) === 'true';
                        const actualRedCard = String(match.sideQuestions.redCard) === 'true';
                        if (predRedCard === actualRedCard) mPts += CONFIG.SCORING.SIDE_QUESTION;
                        if (pred.sideAnswers.cornersOverUnder === match.sideQuestions.cornersOverUnder) mPts += CONFIG.SCORING.SIDE_QUESTION;
                    }

                    let finalPts = mPts;
                    if (pred.appliedJoker === "doublepuan") {
                        finalPts = mPts > 0 ? mPts * 2 : -5;
                    } else if (pred.appliedJoker === "allin") {
                        finalPts = isExact ? CONFIG.SCORING.EXACT_SCORE * 3 : -15;
                    }

                    const sabotageOnUser = predictions.find(p => p.matchId === match.id && p.appliedJoker === 'sabotaj' && p.targetUserId === user.id);
                    if (sabotageOnUser) {
                        finalPts = Math.round(finalPts * 0.5);
                    }
                    basePts += finalPts;
                });

                // Add Group + Bracket points
                const bracketPts = calculateBracketPoints(user.id, contextData);

                // Add Fantasy points
                let fantasyPts = 0;
                const userSquads = fantasySquads.filter(s => s.userId === user.id);
                userSquads.forEach(squad => {
                    const match = matches.find(m => m.id === squad.matchId);
                    if (match && match.status === 'FINISHED' && match.playerRatings) {
                        squad.players.forEach(pId => {
                            let r = parseFloat(match.playerRatings[pId]) || 0;
                            if (pId === squad.captain) {
                                r = r * 2;
                            }
                            fantasyPts += r;
                        });
                    }
                });

                user.points = Math.max(0, Math.round((basePts + bracketPts + fantasyPts) * 10) / 10);
                user.predictionPoints = Math.round((basePts + bracketPts) * 10) / 10;
                user.fantasyPoints = Math.round(fantasyPts * 10) / 10;
            });

            // Re-rank users and apply badges
            users.sort((a, b) => b.points - a.points);
            users.forEach((u, i) => {
                u.badge = null;
                if (i === 0) u.badge = "kahin";
                if (users.length > 1 && i === users.length - 1) {
                    u.badge = "aglayan";
                }
            });

            // Save updated users back to Firestore using a batch
            const batch = fStore.writeBatch(db);
            users.forEach(u => {
                const userDocRef = fStore.doc(db, "users", u.id);
                batch.set(userDocRef, u);
            });
            await batch.commit();
        } catch (err) {
            console.error("Failed to recalculate points in Firestore:", err);
        }
    }
}

// Reset all users jokers to default 1x each
export async function resetAllUsersJokers() {
    await initDb();
    const defaultJokers = { ciftesans: 1, doublepuan: 1, allin: 1, spy: 1, doksanarti: 1, sabotaj: 1 };
    
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        data.users.forEach(u => {
            u.jokers = { ...defaultJokers };
        });
        saveMockData(data);
        return true;
    } else {
        try {
            const usersRef = fStore.collection(db, "users");
            const snapshot = await fStore.getDocs(usersRef);
            const batch = fStore.writeBatch(db);
            snapshot.forEach(doc => {
                const userDoc = fStore.doc(db, "users", doc.id);
                batch.update(userDoc, { jokers: defaultJokers });
            });
            await batch.commit();
            return true;
        } catch (err) {
            console.error("Failed to reset users jokers in Firestore:", err);
            throw err;
        }
    }
}

// Update specific user's jokers wallet directly
export async function updateUserJokers(userId, jokers) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex >= 0) {
            data.users[userIndex].jokers = { ...jokers };
            saveMockData(data);
            return true;
        }
        return false;
    } else {
        try {
            const userDocRef = fStore.doc(db, "users", userId);
            await fStore.updateDoc(userDocRef, { jokers: { ...jokers } });
            return true;
        } catch (err) {
            console.error("Failed to update user jokers in Firestore:", err);
            return false;
        }
    }
}

// Update specific user details (username, password, points, badge, avatar)
export async function updateUserDetails(userId, details) {
    await initDb();
    if (details.points !== undefined) {
        details.predictionPoints = details.points;
        details.fantasyPoints = 0;
    }
    if (details.password) {
        const pw = details.password.trim();
        const isHashed = pw.length === 64 && /^[0-9a-f]{64}$/i.test(pw);
        if (!isHashed) {
            details.password = await hashPassword(pw);
        }
    }
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex >= 0) {
            data.users[userIndex] = {
                ...data.users[userIndex],
                ...details
            };
            saveMockData(data);
            return true;
        }
        return false;
    } else {
        try {
            const userDocRef = fStore.doc(db, "users", userId);
            await fStore.updateDoc(userDocRef, { ...details });
            return true;
        } catch (err) {
            console.error("Failed to update user details in Firestore:", err);
            return false;
        }
    }
}

// --- FANTASY 11 HELPER FUNCTIONS ---

// Get list of players, optionally filtered by team or position
export async function getPlayers(teamName = null, position = null) {
    await initDb();
    let playersList = [];
    if (CONFIG.IS_DEMO_MODE) {
        playersList = getMockData().players || [];
    } else {
        try {
            const snap = await fStore.getDocs(fStore.collection(db, "players"));
            snap.forEach(doc => playersList.push(doc.data()));
        } catch (err) {
            console.error("Failed to get players from Firestore:", err);
        }
    }
    if (teamName) {
        playersList = playersList.filter(p => p.team.toLowerCase().trim() === teamName.toLowerCase().trim());
    }
    if (position) {
        playersList = playersList.filter(p => p.pos.toUpperCase() === position.toUpperCase());
    }
    return playersList;
}

// Save or update player details
export async function savePlayer(player) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const idx = data.players.findIndex(p => p.id === player.id);
        if (idx >= 0) {
            data.players[idx] = { ...player };
        } else {
            data.players.push(player);
        }
        saveMockData(data);
        return player;
    } else {
        try {
            const docRef = fStore.doc(db, "players", player.id);
            await fStore.setDoc(docRef, player);
            return player;
        } catch (err) {
            console.error("Failed to save player to Firestore:", err);
            return null;
        }
    }
}

// Delete player from database
export async function deletePlayer(playerId) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        data.players = data.players.filter(p => p.id !== playerId);
        saveMockData(data);
        return true;
    } else {
        try {
            await fStore.deleteDoc(fStore.doc(db, "players", playerId));
            return true;
        } catch (err) {
            console.error("Failed to delete player from Firestore:", err);
            return false;
        }
    }
}

// Save user's fantasy squad for a match
export async function saveFantasySquad(userId, matchId, squadData, isAdminBypass = false) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (!data.fantasySquads) data.fantasySquads = {};
        if (!data.fantasySquads[userId]) data.fantasySquads[userId] = {};
        data.fantasySquads[userId][matchId] = { ...squadData };
        saveMockData(data);
        return true;
    } else {
        try {
            const docRef = fStore.doc(db, "fantasySquads", `${userId}_${matchId}`);
            await fStore.setDoc(docRef, { userId, matchId, ...squadData });
            return true;
        } catch (err) {
            console.error("Failed to save fantasy squad to Firestore:", err);
            return false;
        }
    }
}

// Get user's fantasy squad for a match
export async function getFantasySquad(userId, matchId) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        if (data.fantasySquads && data.fantasySquads[userId] && data.fantasySquads[userId][matchId]) {
            return data.fantasySquads[userId][matchId];
        }
        return null;
    } else {
        try {
            const docRef = fStore.doc(db, "fantasySquads", `${userId}_${matchId}`);
            const snap = await fStore.getDoc(docRef);
            if (snap.exists()) {
                return snap.data();
            }
            return null;
        } catch (err) {
            console.error("Failed to get fantasy squad from Firestore:", err);
            return null;
        }
    }
}

// Save player match ratings and recalculate standings points
export async function savePlayerRatings(matchId, ratings) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex >= 0) {
            data.matches[matchIndex].playerRatings = { ...ratings };
            saveMockData(data);
            await recalculateAllUsersPoints();
            return true;
        }
        return false;
    } else {
        try {
            const docRef = fStore.doc(db, "matches", matchId);
            await fStore.updateDoc(docRef, { playerRatings: { ...ratings } });
            await recalculateAllUsersPoints();
            return true;
        } catch (err) {
            console.error("Failed to save player ratings in Firestore:", err);
            return false;
        }
    }
}

// Get all fantasy squads
export async function getAllFantasySquads() {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const squadsObj = data.fantasySquads || {};
        const squadsArray = [];
        for (const [userId, userSquads] of Object.entries(squadsObj)) {
            for (const [matchId, squadData] of Object.entries(userSquads)) {
                squadsArray.push({ userId, matchId, ...squadData });
            }
        }
        return squadsArray;
    } else {
        try {
            const snap = await fStore.getDocs(fStore.collection(db, "fantasySquads"));
            const squads = [];
            snap.forEach(doc => squads.push(doc.data()));
            return squads;
        } catch (err) {
            console.error("Failed to get all fantasy squads from Firestore:", err);
            return [];
        }
    }
}

// Manually update match team pairings and date/time (useful for knockout stages)
export async function updateMatchTeamsAndDate(matchId, homeTeam, awayTeam, date) {
    await initDb();
    const { TEAMS_DATA } = await import("./components/teamsData.js");
    
    let homeFlag = "https://flagcdn.com/un.svg";
    let awayFlag = "https://flagcdn.com/un.svg";
    
    if (homeTeam !== "Belirsiz") {
        const hData = Object.values(TEAMS_DATA).find(t => t.nameTr === homeTeam);
        if (hData) homeFlag = hData.flag;
    }
    
    if (awayTeam !== "Belirsiz") {
        const aData = Object.values(TEAMS_DATA).find(t => t.nameTr === awayTeam);
        if (aData) awayFlag = aData.flag;
    }
    
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex >= 0) {
            data.matches[matchIndex].homeTeam = homeTeam;
            data.matches[matchIndex].awayTeam = awayTeam;
            data.matches[matchIndex].homeFlag = homeFlag;
            data.matches[matchIndex].awayFlag = awayFlag;
            if (date) data.matches[matchIndex].date = date;
            saveMockData(data);
            return true;
        }
        return false;
    } else {
        try {
            const docRef = fStore.doc(db, "matches", matchId);
            const updateObj = {
                homeTeam,
                awayTeam,
                homeFlag,
                awayFlag
            };
            if (date) updateObj.date = date;
            await fStore.updateDoc(docRef, updateObj);
            return true;
        } catch (err) {
            console.error("Failed to update match teams/date in Firestore:", err);
            return false;
        }
    }
}
