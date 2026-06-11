// Firebase Firestore & Local Mock Database Interface for Ultimate World Cup Tahmin Platformu
import { CONFIG } from './config.js';
import scrapedPlayers from './scratch/scraped_players.json';
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

function getDateKey(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// // State for Mock Database in localStorage
const MOCK_DB_KEY = "WORLD_CUP_PREDICTION_DB_PROD_V11";

const INITIAL_MOCK_DATA = {
    users: [],
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
export function calculateRealisticPrice(p, teamName) {
    let teamStrength = 75; // varsayılan
    const normalizedSearch = teamName.toLowerCase().trim();
    
    for (const [key, val] of Object.entries(TEAMS_DATA)) {
        if (key.toLowerCase().trim() === normalizedSearch || val.nameTr.toLowerCase().trim() === normalizedSearch) {
            teamStrength = val.strength || 75;
            break;
        }
    }

    let basePrice = 4.5;
    let maxPrice = 8.5;
    
    if (p.pos === 'KL') {
        basePrice = 4.0;
        maxPrice = 6.0;
    } else if (p.pos === 'DEF') {
        basePrice = 4.0;
        maxPrice = 7.0;
    } else if (p.pos === 'ORT') {
        basePrice = 4.5;
        maxPrice = 9.0;
    } else if (p.pos === 'FOR') {
        basePrice = 4.5;
        maxPrice = 11.5;
    }

    // Gücü (53 - 100) katsayıya (0.7 - 1.1) eşle
    const strengthFactor = 0.7 + ((teamStrength - 53) / (100 - 53)) * 0.4;
    
    // Bireysel varyasyon ekle (isim hashine göre)
    const hash = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const individualFactor = (hash % 100) / 100;
    
    let priceRange = maxPrice - basePrice;
    let finalPrice = basePrice + (priceRange * individualFactor * strengthFactor);
    
    // 0.5M katlarına yuvarla
    finalPrice = Math.round(finalPrice * 2) / 2;
    
    // Pozisyon bazlı limitler
    if (p.pos === 'KL') finalPrice = Math.min(6.5, Math.max(4.0, finalPrice));
    else if (p.pos === 'DEF') finalPrice = Math.min(7.5, Math.max(4.0, finalPrice));
    else if (p.pos === 'ORT') finalPrice = Math.min(10.0, Math.max(4.5, finalPrice));
    else if (p.pos === 'FOR') finalPrice = Math.min(12.0, Math.max(4.5, finalPrice));
    
    return finalPrice;
}

async function seedPlayersIfEmpty() {
    const allPlayersToSeed = [];
    for (const [rawTeam, players] of Object.entries(scrapedPlayers)) {
        const teamNormalized = normalizeTeamName(rawTeam);
        players.forEach(p => {
            const hash = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rating = 66 + (hash % 26);
            const price = calculateRealisticPrice(p, teamNormalized);
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
            let needsSave = false;
            
            const existingIds = new Set(data.matches.map(m => m.id));
            const missingMatches = INITIAL_MOCK_DATA.matches.filter(m => !existingIds.has(m.id));
            if (missingMatches.length > 0) {
                console.log(`Demo Mode: Auto-seeding ${missingMatches.length} missing matches to localStorage...`);
                data.matches.push(...missingMatches);
                needsSave = true;
            }
            
            // Auto-migrate jokers to 3 for existing users (Demo Mode)
            if (data.users && Array.isArray(data.users)) {
                // Purge any mock users from active database
                const originalLength = data.users.length;
                data.users = data.users.filter(u => !u.id.startsWith("mock-"));
                if (data.users.length !== originalLength) {
                    console.log(`Purged ${originalLength - data.users.length} mock users from local database.`);
                    needsSave = true;
                }
                
                data.users.forEach(u => {
                    if (!u.jokers || Object.values(u.jokers).some(v => v < 3)) {
                        console.log(`Migrating jokers count to 3 for user: ${u.name}`);
                        u.jokers = {
                            ciftesans: 3,
                            doublepuan: 3,
                            allin: 3,
                            spy: 3,
                            doksanarti: 3,
                            sabotaj: 3
                        };
                        needsSave = true;
                    }
                });
            }
            
            if (needsSave) {
                saveMockData(data);
            }
        }
        await seedPlayersIfEmpty();
        console.log("Using Local Storage Mock Database!");
    }

    // Auto-migrate player prices to realistic SofaScore values if using old hash values (average > 9.5M)
    try {
        let playersList = [];
        if (CONFIG.IS_DEMO_MODE) {
            const storedData = getMockData();
            playersList = storedData ? (storedData.players || []) : [];
        } else {
            const snap = await fStore.getDocs(fStore.collection(db, "players"));
            snap.forEach(doc => playersList.push(doc.data()));
        }
        if (playersList.length > 0) {
            const avgPrice = playersList.reduce((sum, p) => sum + (p.price || 0), 0) / playersList.length;
            if (avgPrice > 9.5) {
                console.log(`Auto-migrating ${playersList.length} players to realistic SofaScore prices... (Current Avg: ${avgPrice.toFixed(2)}M)`);
                if (CONFIG.IS_DEMO_MODE) {
                    const data = getMockData();
                    data.players.forEach(p => {
                        p.price = calculateRealisticPrice(p, p.team);
                    });
                    saveMockData(data);
                } else {
                    const batch = fStore.writeBatch(db);
                    playersList.forEach(p => {
                        const newPrice = calculateRealisticPrice(p, p.team);
                        const docRef = fStore.doc(db, "players", p.id);
                        batch.update(docRef, { price: newPrice });
                    });
                    await batch.commit();
                }
                console.log("Player prices auto-migration completed successfully!");
            }
        }
    } catch (migErr) {
        console.error("Failed to run player price auto-migration:", migErr);
    }

    // TEMPORARY GK MIGRATION FROM SCREENSHOTS
    try {
        const gkPrices = {
            "T. Courtois": 6.5,
            "Alisson": 6.0,
            "M. Maignan": 6.0,
            "E. Martínez": 5.5,
            "Bono": 5.5,
            "M. Neuer": 5.5,
            "E. Mendy": 5.5,
            "D. Costa": 5.5,
            "J. Pickford": 5.5,
            "U. Simón": 5.5,
            "G. Kobel": 5.5,
            "B. Verbruggen": 5.5,
            "Ederson": 5.0,
            "L. Zidane": 5.0,
            "D. Livaković": 5.0,
            "U. Çakır": 5.0,
            "Y. Fofana": 5.0,
            "S. Rochet": 5.0,
            "N. Vasilj": 5.0,
            "M. Kovář": 5.0,
            "R. Williams": 5.0,
            "D. St. Clair": 5.0,
            "Ø. Nyland": 5.0,
            "A. Schlager": 5.0,
            "D. Raya": 4.5,
            "S. Lammens": 4.5,
            "M. El-Shenawy": 4.5,
            "A. Bayındır": 4.5,
            "G. Rulli": 4.5,
            "J. Placide": 4.5,
            "M. Shobeir": 4.5,
            "L. Mpasi Nzau": 4.5,
            "D. Henderson": 4.5,
            "G. Ochoa": 4.5,
            "J. Sá": 4.5,
            "A. Lafont": 4.5,
            "M. Harrar": 4.5,
            "D. Kotarski": 4.5,
            "R. Roefs": 4.5,
            "H. Galíndez": 4.5,
            "L. A. Zigi": 4.5,
            "N. Al-Aqidi": 4.5,
            "M. Turner": 4.5,
            "M. Ryan": 4.5,
            "O. Baumann": 4.5,
            "Á. Montero": 4.5,
            "A. Dahmen": 4.5,
            "R. Fernández": 4.5,
            "A. Beiranvand": 4.5,
            "R. Rangel": 4.5,
            "O. Gill": 4.5,
            "S. Mele": 4.5,
            "L. Horníček": 4.5,
            "J. Hassan": 4.5,
            "A. Gunn": 4.5,
            "V. Johansson": 4.5,
            "M. Freese": 4.5,
            "K. Seung-gyu": 4.5,
            "K. Nordfeldt": 4.5,
            "Vozinha": 4.5
        };

        const normalizeName = (str) => {
            if (!str) return "";
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s]/g, "")
                .trim();
        };

        const findBestGKMatch = (pName) => {
            const normP = normalizeName(pName);
            const pParts = normP.split(/\s+/).filter(Boolean);
            
            let bestName = null;
            let bestScore = 0;
            
            for (const gkName of Object.keys(gkPrices)) {
                const normGk = normalizeName(gkName);
                if (normP === normGk) return gkName;
                
                if (normGk.includes(normP) || normP.includes(normGk)) {
                    const score = Math.min(normP.length, normGk.length) / Math.max(normP.length, normGk.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = gkName;
                    }
                }
                
                const gkParts = normGk.split(/\s+/).filter(Boolean);
                let intersection = 0;
                for (const part of pParts) {
                    if (gkParts.includes(part) || normGk.includes(part)) {
                        intersection++;
                    }
                }
                if (intersection > 0) {
                    const score = intersection / Math.max(pParts.length, gkParts.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = gkName;
                    }
                }
            }
            return bestScore >= 0.4 ? bestName : null;
        };

        const keyFlag = "GK_PRICES_MIGRATED_PROD_V4";
        if (!localStorage.getItem(keyFlag)) {
            console.log("Starting screenshot GK prices update...");
            let playersList = [];
            if (CONFIG.IS_DEMO_MODE) {
                const storedData = getMockData();
                playersList = storedData ? (storedData.players || []) : [];
            } else {
                const snap = await fStore.getDocs(fStore.collection(db, "players"));
                snap.forEach(doc => playersList.push(doc.data()));
            }

            if (playersList.length > 0) {
                let updatedCount = 0;
                let defaultCount = 0;
                
                if (CONFIG.IS_DEMO_MODE) {
                    const data = getMockData();
                    data.players.forEach(p => {
                        if (p.pos === 'KL') {
                            const matchKey = findBestGKMatch(p.name);
                            if (matchKey) {
                                p.price = gkPrices[matchKey];
                                updatedCount++;
                            } else {
                                p.price = 4.0;
                                defaultCount++;
                            }
                        }
                    });
                    saveMockData(data);
                } else {
                    const gks = playersList.filter(p => p.pos === 'KL');
                    const updateList = [];
                    gks.forEach(p => {
                        const matchKey = findBestGKMatch(p.name);
                        const finalPrice = matchKey ? gkPrices[matchKey] : 4.0;
                        updateList.push({ id: p.id, price: finalPrice });
                        if (matchKey) updatedCount++;
                        else defaultCount++;
                    });
                    
                    for (let i = 0; i < updateList.length; i += 400) {
                        const chunk = updateList.slice(i, i + 400);
                        const writeB = fStore.writeBatch(db);
                        chunk.forEach(up => {
                            const docRef = fStore.doc(db, "players", up.id);
                            writeB.update(docRef, { price: up.price });
                        });
                        await writeB.commit();
                    }
                }
                console.log(`GK screenshot migration successful! Updated: ${updatedCount}, Defaulted: ${defaultCount}`);
                localStorage.setItem(keyFlag, "true");
            }
        }
    } catch (migErr) {
        console.error("Failed manual GK screenshot migration:", migErr);
    }

    // TEMPORARY DEF MIGRATION FROM SCREENSHOTS (BATCH 1, 2, 3, 4 & 5 - €4.5M to €8.0M)
    try {
        const defPrices = {
            // Batch 1 (4.5M)
            "Danilo": 4.5, "J. Hato": 4.5, "A. Sandro": 4.5, "C. Riad": 4.5, "W. Singo": 4.5, "L. Hernández": 4.5,
            "S. Abdulhamid": 4.5, "T. Tomiyasu": 4.5, "A. Masuaku": 4.5, "A. Mandi": 4.5, "J. Quansah": 4.5, "M. Lacroix": 4.5,
            "A. Witsel": 4.5, "J. Hadjam": 4.5, "I. Jakobs": 4.5, "J. Piquerez": 4.5, "M. Thiaw": 4.5, "Y. Mina": 4.5,
            "S. S. Chergui": 4.5, "Z. E. Ouahdi": 4.5, "F. Torres": 4.5, "F. Medina": 4.5, "D. Spence": 4.5, "K. Tierney": 4.5,
            "D. Burn": 4.5, "A. Abdi": 4.5, "Y. Ibrahim": 4.5, "E. Elmalı": 4.5, "E. Agbadou": 4.5, "Ç. Söyüncü": 4.5,
            "J. Mojica": 4.5, "S. Kolašinac": 4.5, "M. Talbi": 4.5, "K. Danso": 4.5, "R. Halhal": 4.5, "A. Maamar": 4.5,
            "K. De Winter": 4.5, "T. Araújo": 4.5, "M. Müldür": 4.5, "Y. Sugawara": 4.5, "O. Kabak": 4.5, "M. Pongračić": 4.5,
            "M. Chávez": 4.5, "J. A. Adjetey": 4.5, "G. Mensah": 4.5, "H. Abdelmaguid": 4.5, "Y. Valery": 4.5, "A. Aboul-Fetouh": 4.5,
            "W. Anton": 4.5, "M. Wieffer": 4.5, "N. Ngoy": 4.5, "I. Hien": 4.5, "A. Seidu": 4.5, "N. Katić": 4.5,
            "Y. W. Seol": 4.5, "M. Erlić": 4.5, "C. Montes": 4.5, "K. P. Oppong": 4.5, "J. Alonso": 4.5, "J. Sánchez": 4.5,
            
            // Batch 2 (4.5M)
            "R. Baba": 4.5, "F. Balbuena": 4.5, "J. Opoku": 4.5, "O. Rekik": 4.5, "S. Posch": 4.5, "A. Mumin": 4.5,
            "S. Bueno": 4.5, "Y. Medina": 4.5, "J. Suzuki": 4.5, "H. Altambakti": 4.5, "W. Ditta": 4.5, "J. Scally": 4.5,
            "D. Hadžikadunić": 4.5, "D. M. Wolfe": 4.5, "S. Cáceres": 4.5, "J. Cáceres": 4.5, "M. Mohammadi": 4.5, "H. Lee": 4.5,
            "J. Bos": 4.5, "B. Mechele": 4.5, "A. Johnston": 4.5, "E. Lira": 4.5, "S. Taniguchi": 4.5, "A. Hickey": 4.5,
            "A. Seko": 4.5, "D. Cornelius": 4.5, "J. Gallardo": 4.5, "J. Porozo": 4.5, "T. Heggem": 4.5, "C. Starfelt": 4.5,
            "M. Muheim": 4.5, "M. McKenzie": 4.5, "M. Pedersen": 4.5, "H. Souttar": 4.5, "M. Bombito": 4.5, "T. Ream": 4.5,
            "E. Cömert": 4.5, "M. Friedl": 4.5, "H. Ekdal": 4.5, "F. A. Bjørkan": 4.5, "L. Jaquez": 4.5, "S. Hardani": 4.5,
            "A. Behich": 4.5, "E. Smith": 4.5, "A. Majrashi": 4.5, "S. Khalilzadeh": 4.5, "T. Lee": 4.5, "R. Laryea": 4.5,
            "J. Souttar": 4.5, "L. Herrington": 4.5, "C. Burgess": 4.5, "G. Hanley": 4.5, "D. Zima": 4.5, "H. S. Falchener": 4.5,
            "J. Thakri": 4.5, "S. K. Langås": 4.5, "T. Holeš": 4.5, "S. Chaloupek": 4.5, "M. Kim": 4.5, "T. H. Kim": 4.5,

            // Batch 3 (A. Nemati is 4.5M, rest are 5.0M)
            "A. Nemati": 4.5,
            "A. Rüdiger": 5.0, "R. Araújo": 5.0, "I. Konaté": 5.0, "A. Robertson": 5.0, "M. Sarr": 5.0, "K. Koulibaly": 5.0,
            "D. Dalot": 5.0, "J. Stones": 5.0, "N. Aké": 5.0, "M. Gusto": 5.0, "N. Otamendi": 5.0,
            "A. Wan-Bissaka": 5.0, "G. Doué": 5.0, "P. Estupiñán": 5.0, "L. Pereira": 5.0, "Bremer": 5.0, "K. Diatta": 5.0,
            "D. Sánchez": 5.0, "R. Veiga": 5.0, "N. Tagliafico": 5.0, "O. Kossounou": 5.0, "G. Montiel": 5.0, "V. Lindelöf": 5.0,
            "M. Niakhaté": 5.0, "G. Varela": 5.0, "N. Semedo": 5.0, "A. Tuanzebe": 5.0, "A. Salah-Eddine": 5.0, "H. Itō": 5.0,
            "I. Diop": 5.0, "L. Balerdi": 5.0, "R. Belghali": 5.0, "A. Dedić": 5.0, "S. Dest": 5.0, "A. Bardakcı": 5.0,
            "A. Mendy": 5.0, "R. Ibañez": 5.0, "J. Ordóñez": 5.0, "O. Alderete": 5.0, "O. Diomande": 5.0, "T. Livramento": 5.0,
            "L. Digne": 5.0, "M. Hany": 5.0, "J. Vásquez": 5.0, "T. Muharemović": 5.0, "Pubill": 5.0, "J. Lucumí": 5.0,
            "M. De Cuyper": 5.0, "M. Demiral": 5.0, "J. Šutalo": 5.0, "J. Ryerson": 5.0, "M. Olivera": 5.0, "Z. Debast": 5.0,
            "D. Svensson": 5.0, "Z. Çelik": 5.0, "K. Itakura": 5.0, "G. Konan": 5.0, "A. Robinson": 5.0, "D. Ćaleta-Car": 5.0,

            // Batch 4 (€5.0M, €5.5M, €6.0M)
            "T. Meunier": 5.0, "R. Rabia": 5.0, "N. Brown": 5.0, "T. Castagne": 5.0, "C. Richards": 5.0, "L. Østigård": 5.0,
            "R. Rodríguez": 5.0, "J. Seys": 5.0, "T. Watanabe": 5.0, "D. Jurásek": 5.0, "G. Gudmundsson": 5.0, "K. Ajer": 5.0,
            "I. Reyes": 5.0, "N. Elvedi": 5.0, "A. Circati": 5.0, "A. Trusty": 5.0, "A. Freeman": 5.0, "P. Lienhart": 5.0,
            "A. Amenda": 5.0, "G. Lagerbielke": 5.0, "S. Widmer": 5.0, "P. Mwene": 5.0, "R. Hranáč": 5.0,
            "J. Cancelo": 5.5, "D. Alaba": 5.5, "E. García": 5.5, "L. Martínez": 5.5, "R. James": 5.5, "R. Aït-Nouri": 5.5,
            "C. Romero": 5.5, "Wesley": 5.5, "M. Akanji": 5.5, "N. Aguerd": 5.5, "F. Kadıoğlu": 5.5, "M. Nunes": 5.5,
            "K. Min-jae": 5.5, "L. Vušković": 5.5, "M. van de Ven": 5.5, "D. Muñoz": 5.5, "P. Porro": 5.5, "J. Stanišić": 5.5,
            "M. Llorente": 5.5, "A. Laporte": 5.5, "K. Laimer": 5.5, "E. Ndicka": 5.5, "G. Gómez": 5.5, "D. Santos": 5.5,
            "G. Inácio": 5.5, "J. M. Giménez": 5.5, "J. P. van Hecke": 5.5, "E. Konsa": 5.5, "L. Krejčí": 5.5, "A. Theate": 5.5,
            "V. Coufal": 5.5,
            "P. Cubarsí": 6.0, "N. Mazraoui": 6.0, "P. Hincapié": 6.0, "W. Pacho": 6.0, "R. Bensebaini": 6.0, "A. Davies": 6.0,

            // Batch 5 (€6.0M, €6.5M, €7.0M, €7.5M, €8.0M)
            "N. O'Reilly": 6.0, "M. Guéhi": 6.0, "T. Hernández": 6.0, "D. Upamecano": 6.0, "D. Raum": 6.0,
            "J. Koundé": 6.5, "R. Dias": 6.5, "Marquinhos": 6.5, "M. Cucurella": 6.5, "J. Timber": 6.5, "D. Dumfries": 6.5, "J. Tah": 6.5,
            "V. van Dijk": 7.0, "G. Magalhães": 7.0, "J. Gvardiol": 7.0, "W. Saliba": 7.0, "N. Schlotterbeck": 7.0,
            "J. Kimmich": 7.5, "N. Mendes": 7.5,
            "A. Hakimi": 8.0
        };

        const normalizeName = (str) => {
            if (!str) return "";
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s]/g, "")
                .trim();
        };

        const findBestDefMatch = (pName) => {
            const normP = normalizeName(pName);
            const pParts = normP.split(/\s+/).filter(Boolean);
            
            let bestName = null;
            let bestScore = 0;
            
            for (const defName of Object.keys(defPrices)) {
                const normDef = normalizeName(defName);
                if (normP === normDef) return defName;
                
                if (normDef.includes(normP) || normP.includes(normDef)) {
                    const score = Math.min(normP.length, normDef.length) / Math.max(normP.length, normDef.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = defName;
                    }
                }
                
                const defParts = normDef.split(/\s+/).filter(Boolean);
                let intersection = 0;
                for (const part of pParts) {
                    if (defParts.includes(part) || normDef.includes(part)) {
                        intersection++;
                    }
                }
                if (intersection > 0) {
                    const score = intersection / Math.max(pParts.length, defParts.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = defName;
                    }
                }
            }
            return bestScore >= 0.4 ? bestName : null;
        };

        const defKeyFlag = "DEF_PRICES_MIGRATED_PROD_V8";
        if (!localStorage.getItem(defKeyFlag)) {
            console.log("Starting screenshot DEF prices update...");
            let playersList = [];
            if (CONFIG.IS_DEMO_MODE) {
                const storedData = getMockData();
                playersList = storedData ? (storedData.players || []) : [];
            } else {
                const snap = await fStore.getDocs(fStore.collection(db, "players"));
                snap.forEach(doc => playersList.push(doc.data()));
            }

            if (playersList.length > 0) {
                let updatedCount = 0;
                let defaultCount = 0;
                
                if (CONFIG.IS_DEMO_MODE) {
                    const data = getMockData();
                    data.players.forEach(p => {
                        if (p.pos === 'DEF') {
                            const matchKey = findBestDefMatch(p.name);
                            if (matchKey) {
                                p.price = defPrices[matchKey];
                                updatedCount++;
                            } else {
                                p.price = 4.0;
                                defaultCount++;
                            }
                        }
                    });
                    saveMockData(data);
                } else {
                    const defs = playersList.filter(p => p.pos === 'DEF');
                    const updateList = [];
                    defs.forEach(p => {
                        const matchKey = findBestDefMatch(p.name);
                        const finalPrice = matchKey ? defPrices[matchKey] : 4.0;
                        updateList.push({ id: p.id, price: finalPrice });
                        if (matchKey) updatedCount++;
                        else defaultCount++;
                    });
                    
                    for (let i = 0; i < updateList.length; i += 400) {
                        const chunk = updateList.slice(i, i + 400);
                        const writeB = fStore.writeBatch(db);
                        chunk.forEach(up => {
                            const docRef = fStore.doc(db, "players", up.id);
                            writeB.update(docRef, { price: up.price });
                        });
                        await writeB.commit();
                    }
                }
                console.log(`DEF screenshot migration successful! Updated: ${updatedCount}, Defaulted: ${defaultCount}`);
                localStorage.setItem(defKeyFlag, "true");
            }
        }
    } catch (defErr) {
        console.error("Failed manual DEF screenshot migration:", defErr);
    }

    // TEMPORARY ORT MIGRATION FROM USER LIST (ORT & converted FOR - €5.0M to €11.5M, others defaulted to €4.5M)
    try {
        const ortPrices = {
            "L. Yamal": 11.5,
            "O. Dembélé": 11.5,
            "Vinícius Jr.": 11.0,
            "Raphinha": 10.5,
            "M. Olise": 10.5,
            "B. Fernandes": 9.5,
            "Pedri": 9.0,
            "B. Saka": 9.0,
            "J. Bellingham": 8.5,
            "L. Díaz": 8.5,
            "F. Wirtz": 8.5,
            "J. Musiala": 8.5,
            "J. Doku": 8.5,
            "Vitinha": 8.5,
            "M. Salah": 8.0,
            "F. Valverde": 8.0,
            "A. Güler": 8.0,
            "S. Mané": 8.0,
            "E. Fernández": 8.0,
            "D. Doué": 8.0,
            "R. Cherki": 8.0,
            "N. Williams": 8.0,
            "M. Ødegaard": 8.0,
            "R. Mahrez": 8.0,
            "D. Rice": 8.0,
            "J. Neves": 8.0,
            "B. Guimarães": 8.0,
            "H. Çalhanoğlu": 8.0,
            "Y. Diomande": 8.0,
            "Y. Tielemans": 8.0,
            "L. Modrić": 7.5,
            "K. De Bruyne": 7.5,
            "B. Díaz": 7.5,
            "F. de Jong": 7.5,
            "K. Yildiz": 7.5,
            "Rodri": 7.5,
            "A. Mac Allister": 7.5,
            "C. Gakpo": 7.5,
            "T. Reijnders": 7.5,
            "C. Pulišić": 7.5,
            "F. Ruiz": 7.5,
            "M. Rashford": 7.0,
            "D. Olmo": 7.0,
            "J. Félix": 7.0,
            "S. Heung-min": 7.0,
            "N. Paz": 7.0,
            "A. Semenyo": 7.0,
            "M. Caicedo": 7.0,
            "A. Gordon": 7.0,
            "P. Neto": 7.0,
            "B. Barcola": 7.0,
            "L. Sané": 7.0,
            "I. Maza": 7.0,
            "A. Ounahi": 7.0,
            "L. Trossard": 7.0,
            "R. Gravenberch": 7.0,
            "S. McTominay": 7.0,
            "G. Xhaka": 7.0,
            "F. Trincão": 7.0,
            "Neymar": 6.5,
            "Gavi": 6.5,
            "A. Tchouaméni": 6.5,
            "A. Diallo": 6.5,
            "Casemiro": 6.5,
            "G. de Arrascaeta": 6.5,
            "R. Leão": 6.5,
            "L. Paquetá": 6.5,
            "B. Silva": 6.5,
            "I. Ndiaye": 6.5,
            "A. Ezzalzouli": 6.5,
            "F. Kessié": 6.5,
            "P. Gueye": 6.5,
            "T. Almada": 6.5,
            "B. E. Khannouss": 6.5,
            "I. Saibari": 6.5,
            "T. Kubo": 6.5,
            "G. Simeone": 6.5,
            "A. Pavlović": 6.5,
            "I. Perišić": 6.5,
            "R. Neves": 6.5,
            "A. Nusa": 6.5,
            "A. Rabiot": 6.5,
            "E. Anderson": 6.5,
            "A. Baena": 6.5,
            "M. Sabitzer": 6.5,
            "A. Kramarić": 6.5,
            "A. Saelemaekers": 6.5,
            "J. Rodríguez": 6.0,
            "E. Eze": 6.0,
            "R. De Paul": 6.0,
            "N. Madueke": 6.0,
            "R. Ríos": 6.0,
            "M. Kovačić": 6.0,
            "J. Arias": 6.0,
            "M. Merino": 6.0,
            "M. Zubimendi": 6.0,
            "L. Henrique": 6.0,
            "G. Plata": 6.0,
            "F. Conceição": 6.0,
            "L. Camara": 6.0,
            "K. Lee": 6.0,
            "I. Williams": 6.0,
            "W. Zaïre-Emery": 6.0,
            "F. Chaïbi": 6.0,
            "M. Rogers": 6.0,
            "V. Barco": 6.0,
            "H. Aouar": 6.0,
            "J. Enciso": 6.0,
            "A. Grimaldo": 6.0,
            "G. Mora": 6.0,
            "L. Goretzka": 6.0,
            "A. Elanga": 6.0,
            "D. Gómez": 6.0,
            "M. Baturina": 6.0,
            "C. Uzun": 6.0,
            "J. Hauge": 6.0,
            "E. Álvarez": 6.0,
            "I. Sangaré": 6.0,
            "M. Almirón": 6.0,
            "P. Sučić": 6.0,
            "R. Bentancur": 6.0,
            "W. McKennie": 6.0,
            "K. Alajbegović": 6.0,
            "R. Zerrouki": 6.0,
            "A. Onana": 6.0,
            "T. Koopmeiners": 6.0,
            "S. E. Mourabet": 6.0,
            "R. Doan": 6.0,
            "D. Lukebakio": 6.0,
            "J. McGinn": 6.0,
            "J. Manzambi": 6.0,
            "K. Sano": 6.0,
            "P. Berg": 6.0,
            "S. Berge": 6.0,
            "B. Nygren": 6.0,
            "M. de Roon": 6.0,
            "R. Schmid": 6.0,
            "S. Adingra": 5.5,
            "K. Mainoo": 5.5,
            "Zizo": 5.5,
            "L. Karl": 5.5,
            "T. Partey": 5.5,
            "M. Trézéguet": 5.5,
            "P. Sarr": 5.5,
            "S. Amrabat": 5.5,
            "K. Páez": 5.5,
            "I. Gueye": 5.5,
            "O. Bobb": 5.5,
            "N. González": 5.5,
            "W. Endo": 5.5,
            "M. Ugarte": 5.5,
            "O. Kökçü": 5.5,
            "D. Santos": 5.5,
            "G. Lo Celso": 5.5,
            "B. A. Yılmaz": 5.5,
            "E. Palacios": 5.5,
            "H. Diarra": 5.5,
            "H. Boudaoui": 5.5,
            "S. Fofana": 5.5,
            "Fabinho": 5.5,
            "T. Weah": 5.5,
            "S. Al-Dawsari": 5.5,
            "E. Bajraktarević": 5.5,
            "C. I. Oulaï": 5.5,
            "A. Stiller": 5.5,
            "N. Bentaleb": 5.5,
            "M. Koné": 5.5,
            "Mario Pašalić": 5.5,
            "Marco Pašalić": 5.0,
            "D. Kamada": 5.5,
            "Y. Pino": 5.5,
            "C. Summerville": 5.5,
            "J. Kluivert": 5.5,
            "D. Moreira": 5.5,
            "O. Vargas": 5.5,
            "M. Tillman": 5.5,
            "P. I. Ciss": 5.5,
            "J. Lerma": 5.5,
            "Á. Fidalgo": 5.5,
            "A. Tanaka": 5.5,
            "N. Angulo": 5.5,
            "G. Reyna": 5.5,
            "A. Vega": 5.5,
            "J. Yeboah": 5.5,
            "P. Groß": 5.5,
            "F. Nmecha": 5.5,
            "M. Araújo": 5.5,
            "S. Costa": 5.5,
            "P. Šulc": 5.5,
            "T. Souček": 5.5,
            "İ. Yüksek": 5.5,
            "D. Bobadilla": 5.5,
            "D. Zakaria": 5.5,
            "I. Koné": 5.5,
            "H. Vanaken": 5.5,
            "B. Aaronson": 5.5,
            "Y. Ayari": 5.5,
            "R. Vargas": 5.5,
            "O. Pineda": 5.5,
            "P. Vite": 5.5,
            "D. Sow": 5.5,
            "R. Alvarado": 5.5,
            "G. Til": 5.5,
            "R. Freuler": 5.5,
            "F. Rieder": 5.5,
            "N. Seiwald": 5.5,
            "X. Schlager": 5.5,
            "P. Wimmer": 5.5,
            "J. Castrop": 5.5,
            "M. Lasheen": 5.5,
            "L. Provod": 5.5,
            "E. Ashour": 5.0,
            "N. Kanté": 5.0,
            "L. Paredes": 5.0,
            "N. El Aynaoui": 5.0,
            "N. Sadiki": 5.0,
            "G. Yassine": 5.0,
            "A. Bouaddi": 5.0,
            "C. Chukwuemeka": 5.0,
            "L. Bergvall": 5.0,
            "Y. Akgün": 5.0,
            "M. Akliouche": 5.0,
            "E. Achouri": 5.0,
            "T. Buchanan": 5.0,
            "L. Sučić": 5.0,
            "M. Attia": 5.0,
            "N. Vlašić": 5.0,
            "A. Jashari": 5.0,
            "J. Ito": 5.0,
            "K. Sibo": 5.0,
            "F. Aursnes": 5.0,
            "N. Irankunda": 5.0,
            "D. Ndoye": 5.0,
            "E. Skhiri": 5.0,
            "K. Nakamura": 5.0,
            "P. Wanner": 5.0,
            "C. Baah": 5.0,
            "A. Canobbio": 5.0,
            "Y. Titraoui": 5.0,
            "A. Franco": 5.0
        };

        const normalizeName = (str) => {
            if (!str) return "";
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s]/g, "")
                .trim();
        };

        const findBestOrtMatch = (pName) => {
            const normP = normalizeName(pName);
            const pParts = normP.split(/\s+/).filter(Boolean);
            
            let bestName = null;
            let bestScore = 0;
            
            for (const ortName of Object.keys(ortPrices)) {
                const normOrt = normalizeName(ortName);
                if (normP === normOrt) return ortName;
                
                if (ortName.includes('.')) {
                    const dotIdx = ortName.indexOf('.');
                    if (dotIdx === 1) {
                        const initial = ortName[0].toLowerCase();
                        const pFirstChar = pParts[0] ? pParts[0][0] : '';
                        if (pFirstChar !== initial) {
                            continue;
                        }
                    }
                }

                if (normOrt.includes(normP) || normP.includes(normOrt)) {
                    const score = Math.min(normP.length, normOrt.length) / Math.max(normP.length, normOrt.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = ortName;
                    }
                }
                
                const ortParts = normOrt.split(/\s+/).filter(Boolean);
                let intersection = 0;
                for (const part of pParts) {
                    if (ortParts.includes(part) || normOrt.includes(part)) {
                        intersection++;
                    }
                }
                if (intersection > 0) {
                    const score = intersection / Math.max(pParts.length, ortParts.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = ortName;
                    }
                }
            }
            return bestScore >= 0.4 ? bestName : null;
        };

        const ortKeyFlag = "ORT_PRICES_MIGRATED_PROD_V1";
        if (!localStorage.getItem(ortKeyFlag)) {
            console.log("Starting list ORT prices update...");
            let playersList = [];
            if (CONFIG.IS_DEMO_MODE) {
                const storedData = getMockData();
                playersList = storedData ? (storedData.players || []) : [];
            } else {
                const snap = await fStore.getDocs(fStore.collection(db, "players"));
                snap.forEach(doc => playersList.push(doc.data()));
            }

            if (playersList.length > 0) {
                let updatedCount = 0;
                let defaultCount = 0;
                
                if (CONFIG.IS_DEMO_MODE) {
                    const data = getMockData();
                    data.players.forEach(p => {
                        if (p.pos === 'ORT') {
                            const matchKey = findBestOrtMatch(p.name);
                            if (matchKey) {
                                p.price = ortPrices[matchKey];
                                updatedCount++;
                            } else {
                                p.price = 4.5;
                                defaultCount++;
                            }
                        } else if (p.pos === 'FOR') {
                            const matchKey = findBestOrtMatch(p.name);
                            if (matchKey) {
                                p.price = ortPrices[matchKey];
                                p.pos = 'ORT';
                                updatedCount++;
                            }
                        }
                    });
                    saveMockData(data);
                } else {
                    const updateList = [];
                    playersList.forEach(p => {
                        if (p.pos === 'ORT') {
                            const matchKey = findBestOrtMatch(p.name);
                            const finalPrice = matchKey ? ortPrices[matchKey] : 4.5;
                            updateList.push({ id: p.id, price: finalPrice, pos: 'ORT' });
                            if (matchKey) updatedCount++;
                            else defaultCount++;
                        } else if (p.pos === 'FOR') {
                            const matchKey = findBestOrtMatch(p.name);
                            if (matchKey) {
                                updateList.push({ id: p.id, price: ortPrices[matchKey], pos: 'ORT' });
                                updatedCount++;
                            }
                        }
                    });
                    
                    for (let i = 0; i < updateList.length; i += 400) {
                        const chunk = updateList.slice(i, i + 400);
                        const writeB = fStore.writeBatch(db);
                        chunk.forEach(up => {
                            const docRef = fStore.doc(db, "players", up.id);
                            writeB.update(docRef, { price: up.price, pos: up.pos });
                        });
                        await writeB.commit();
                    }
                }
                console.log(`ORT list migration successful! Updated: ${updatedCount}, Defaulted: ${defaultCount}`);
                localStorage.setItem(ortKeyFlag, "true");
            }
        }
    } catch (ortErr) {
        console.error("Failed manual ORT list migration:", ortErr);
    }

    // TEMPORARY FOR MIGRATION FROM USER LIST (FOR - €4.5M to €12.0M, others defaulted to €4.5M)
    try {
        const forPrices = {
            "K. Mbappé": 12.0,
            "H. Kane": 12.0,
            "L. Messi": 10.0,
            "E. Haaland": 10.0,
            "C. Ronaldo": 9.0,
            "J. Álvarez": 9.0,
            "M. Oyarzabal": 8.0,
            "V. Gyökeres": 7.5,
            "O. Marmoush": 7.5,
            "L. Martínez": 7.5,
            "M. Cunha": 7.5,
            "M. Depay": 7.5,
            "G. Martinelli": 7.5,
            "F. Torres": 7.0,
            "A. Isak": 7.0,
            "K. Havertz": 7.0,
            "L. J. Suárez": 7.0,
            "D. Malen": 7.0,
            "P. Schick": 7.0,
            "M. E. A. Amoura": 6.5,
            "A. Sørloth": 6.5,
            "J. David": 6.5,
            "C. De Ketelaere": 6.5,
            "A. Ueda": 6.5,
            "Endrick": 6.0,
            "N. Jackson": 6.0,
            "D. Núñez": 6.0,
            "R. Lukaku": 6.0,
            "N. Woltemade": 6.0,
            "I. Thiago": 6.0,
            "E. Džeko": 6.0,
            "A. E. Kaabi": 6.0,
            "M. Thuram": 6.0,
            "K. Aktürkoğlu": 6.0,
            "O. Watkins": 6.0,
            "R. Jiménez": 6.0,
            "N. Pépé": 6.0,
            "A. Budimir": 6.0,
            "F. Balogun": 6.0,
            "B. Embolo": 6.0,
            "D. Maeda": 6.0,
            "Y. Wissa": 5.5,
            "Rayan": 5.5,
            "A. H. Moussa": 5.5,
            "G. Ramos": 5.5,
            "N. Lang": 5.5,
            "I. Toney": 5.5,
            "J. Ayew": 5.5,
            "J. Mateta": 5.5,
            "N. Okafor": 5.5,
            "E. Valencia": 5.5,
            "D. Undav": 5.5,
            "M. Arnautović": 5.5,
            "E. Demirović": 5.5,
            "H. Hee-chan": 5.5,
            "E. Guessand": 5.5,
            "G. Guedes": 5.5,
            "R. Zalazar": 5.5,
            "R. Pepi": 5.5,
            "I. Matanović": 5.5,
            "A. Sanabria": 5.5,
            "M. Fernandez": 5.5,
            "R. Aguirre": 5.5,
            "S. Giménez": 5.0,
            "I. Sarr": 5.0,
            "A. Gouiri": 5.0,
            "S. Rahimi": 5.0,
            "J. López": 5.0,
            "A. Diao": 5.0,
            "M. Taremi": 5.0,
            "A. Bonny": 5.0,
            "A. Schjelderup": 5.0,
            "C. Hernández": 5.0,
            "R. Sosa": 5.0,
            "K. Sulemana": 5.0,
            "H. Oh": 5.0,
            "J. Larsen": 5.0,
            "W. Weghorst": 5.0,
            "M. Beier": 5.0,
            "B. Iglesias": 5.0,
            "D. Gül": 5.0,
            "A. Amaimouni Echghouyab": 5.0,
            "H. Tabaković": 5.0,
            "K. Rodríguez": 5.0,
            "C. Adams": 5.0,
            "Z. Amdouni": 5.0,
            "Y. Suzuki": 5.0,
            "T. Oluwaseyi": 5.0,
            "M. Touré": 5.0,
            "C. Larin": 5.0,
            "M. Gregoritsch": 5.0,
            "C. Bakambu": 4.5,
            "I. Mbaye": 4.5,
            "F. Mayele": 4.5,
            "E. Shomurodov": 4.5,
            "M. Elia": 4.5,
            "W. Isidor": 4.5,
            "V. Muñoz": 4.5,
            "J. Quiñones": 4.5,
            "A. B. Dieng": 4.5,
            "A. F. Issahaku": 4.5,
            "S. Banza": 4.5,
            "C. Wood": 4.5,
            "O. Diakité": 4.5,
            "A. González": 4.5,
            "B. Brobbey": 4.5,
            "N. Mbuku": 4.5,
            "C. Ndiaye": 4.5,
            "L. Foster": 4.5,
            "M. Tamari": 4.5,
            "B. Cipenga": 4.5,
            "P. David": 4.5,
            "F. Chaouat": 4.5,
            "B. Thomas-Asante": 4.5,
            "P. Musa": 4.5,
            "J. Córdoba": 4.5,
            "F. Ghedjemis": 4.5,
            "A. Minda": 4.5,
            "A. Arce": 4.5,
            "H. Mastouri": 4.5
        };

        const normalizeName = (str) => {
            if (!str) return "";
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s]/g, "")
                .trim();
        };

        const findBestForMatch = (pName) => {
            const normP = normalizeName(pName);
            const pParts = normP.split(/\s+/).filter(Boolean);
            
            let bestName = null;
            let bestScore = 0;
            
            for (const forName of Object.keys(forPrices)) {
                const normFor = normalizeName(forName);
                if (normP === normFor) return forName;
                
                if (forName.includes('.')) {
                    const dotIdx = forName.indexOf('.');
                    if (dotIdx === 1) {
                        const initial = forName[0].toLowerCase();
                        const pFirstChar = pParts[0] ? pParts[0][0] : '';
                        if (pFirstChar !== initial) {
                            continue;
                        }
                    }
                }

                if (normFor.includes(normP) || normP.includes(normFor)) {
                    const score = Math.min(normP.length, normFor.length) / Math.max(normP.length, normFor.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = forName;
                    }
                }
                
                const forParts = normFor.split(/\s+/).filter(Boolean);
                let intersection = 0;
                for (const part of pParts) {
                    if (forParts.includes(part) || normFor.includes(part)) {
                        intersection++;
                    }
                }
                if (intersection > 0) {
                    const score = intersection / Math.max(pParts.length, forParts.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestName = forName;
                    }
                }
            }
            return bestScore >= 0.4 ? bestName : null;
        };

        const forKeyFlag = "FOR_PRICES_MIGRATED_PROD_V1";
        if (!localStorage.getItem(forKeyFlag)) {
            console.log("Starting list FOR prices update...");
            let playersList = [];
            if (CONFIG.IS_DEMO_MODE) {
                const storedData = getMockData();
                playersList = storedData ? (storedData.players || []) : [];
            } else {
                const snap = await fStore.getDocs(fStore.collection(db, "players"));
                snap.forEach(doc => playersList.push(doc.data()));
            }

            if (playersList.length > 0) {
                let updatedCount = 0;
                let defaultCount = 0;
                
                if (CONFIG.IS_DEMO_MODE) {
                    const data = getMockData();
                    data.players.forEach(p => {
                        if (p.pos === 'FOR') {
                            const matchKey = findBestForMatch(p.name);
                            if (matchKey) {
                                p.price = forPrices[matchKey];
                                updatedCount++;
                            } else {
                                p.price = 4.5;
                                defaultCount++;
                            }
                        }
                    });
                    saveMockData(data);
                } else {
                    const updateList = [];
                    playersList.forEach(p => {
                        if (p.pos === 'FOR') {
                            const matchKey = findBestForMatch(p.name);
                            const finalPrice = matchKey ? forPrices[matchKey] : 4.5;
                            updateList.push({ id: p.id, price: finalPrice });
                            if (matchKey) updatedCount++;
                            else defaultCount++;
                        }
                    });
                    
                    for (let i = 0; i < updateList.length; i += 400) {
                        const chunk = updateList.slice(i, i + 400);
                        const writeB = fStore.writeBatch(db);
                        chunk.forEach(up => {
                            const docRef = fStore.doc(db, "players", up.id);
                            writeB.update(docRef, { price: up.price });
                        });
                        await writeB.commit();
                    }
                }
                console.log(`FOR list migration successful! Updated: ${updatedCount}, Defaulted: ${defaultCount}`);
                localStorage.setItem(forKeyFlag, "true");
            }
        }
    } catch (forErr) {
        console.error("Failed manual FOR list migration:", forErr);
    }

    // TEMPORARY CLEANUP OF TEST MATCH AND ITS PREDICTIONS
    try {
        const testMatchDeleteFlag = "TEST_MATCH_DELETED_PROD_V2";
        if (!localStorage.getItem(testMatchDeleteFlag)) {
            console.log("Removing Germany vs Scotland test match and predictions from database...");
            if (CONFIG.IS_DEMO_MODE) {
                const data = getMockData();
                data.matches = (data.matches || []).filter(m => m.id !== "match-test-completed");
                data.predictions = (data.predictions || []).filter(p => p.matchId !== "match-test-completed");
                saveMockData(data);
            } else {
                // Delete from Firestore matches
                try {
                    await fStore.deleteDoc(fStore.doc(db, "matches", "match-test-completed"));
                } catch (e) {
                    console.warn("Match already deleted or failed to delete:", e);
                }
                // Delete predictions associated with this match from Firestore
                try {
                    const q = fStore.query(fStore.collection(db, "predictions"), fStore.where("matchId", "==", "match-test-completed"));
                    const snap = await fStore.getDocs(q);
                    if (!snap.empty) {
                        const batch = fStore.writeBatch(db);
                        snap.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        await batch.commit();
                    }
                } catch (e) {
                    console.warn("Failed to delete test predictions from Firestore:", e);
                }
            }
            localStorage.setItem(testMatchDeleteFlag, "true");
            console.log("Germany vs Scotland test match and predictions removed successfully!");
        }
    } catch (cleanErr) {
        console.error("Failed test match cleanup migration:", cleanErr);
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
                ciftesans: 3,
                doublepuan: 3,
                allin: 3,
                spy: 3,
                doksanarti: 3,
                sabotaj: 3
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
                ciftesans: 3,
                doublepuan: 3,
                allin: 3,
                spy: 3,
                doksanarti: 3,
                sabotaj: 3
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

// API'den gelen golcülerden ilk golü atanı (en küçük dakikaya sahip olanı) ayıklayan yardımcı metod
function extractFirstScorer(homeScorers, awayScorers) {
    const parseScorers = (str) => {
        if (!str || str === 'null' || str === 'undefined') return [];
        return str.split(',').map(s => s.trim()).filter(Boolean);
    };
    
    const homeList = parseScorers(homeScorers);
    const awayList = parseScorers(awayScorers);
    
    if (homeList.length === 0 && awayList.length === 0) return "Diğer";
    
    const getMinute = (nameWithMin) => {
        const match = nameWithMin.match(/\((\d+)\)?/);
        return match ? parseInt(match[1]) : 999;
    };
    
    const homeParsed = homeList.map(name => ({ name, min: getMinute(name) }));
    const awayParsed = awayList.map(name => ({ name, min: getMinute(name) }));
    
    const allScorers = [...homeParsed, ...awayParsed].sort((a, b) => a.min - b.min);
    if (allScorers.length > 0) {
        // İsmin etrafındaki parantezli dakikaları ve ham sayıları temizle
        let cleanName = allScorers[0].name.replace(/\s*\(\d+['\s]*\)/g, '').trim();
        cleanName = cleanName.replace(/\s*\d+['\s]*/g, '').trim();
        return cleanName;
    }
    return "Diğer";
}

let lastSyncTime = 0;
const SYNC_INTERVAL = 300000; // 5 dakika önbellek süresi (ms)

// Ücretsiz World Cup 2026 API'sinden skorları ve maç durumlarını senkronize eden ana metod
export async function syncLiveScoresFromFreeApi() {
    const now = Date.now();
    if (now - lastSyncTime < SYNC_INTERVAL) {
        console.log("Free score API sync: Önbellekten okundu (Son 5 dk içinde senkronize edilmiş)");
        return null;
    }
    lastSyncTime = now;
    try {
        console.log("Free score API sync: Fetching matches from worldcup26.ir...");
        const response = await fetch("https://worldcup26.ir/get/games");
        const resData = await response.json();
        
        if (resData && resData.games && resData.games.length > 0) {
            let matches = [];
            if (CONFIG.IS_DEMO_MODE) {
                matches = getMockData().matches;
            } else {
                const snapshot = await fStore.getDocs(fStore.collection(db, "matches"));
                snapshot.forEach(doc => {
                    matches.push(doc.data());
                });
            }

            let updatedCount = 0;
            const updates = [];
            
            resData.games.forEach(g => {
                if (!g.home_team_name_en || !g.away_team_name_en) return;
                const homeTranslated = TEAM_TRANSLATIONS[g.home_team_name_en.toLowerCase().trim()] || g.home_team_name_en;
                const awayTranslated = TEAM_TRANSLATIONS[g.away_team_name_en.toLowerCase().trim()] || g.away_team_name_en;
                
                const matchIndex = matches.findIndex(m => 
                    (m.homeTeam.toLowerCase().trim() === homeTranslated.toLowerCase().trim() && 
                     m.awayTeam.toLowerCase().trim() === awayTranslated.toLowerCase().trim())
                );
                
                if (matchIndex >= 0) {
                    const localMatch = matches[matchIndex];
                    const newHomeScore = parseInt(g.home_score) || 0;
                    const newAwayScore = parseInt(g.away_score) || 0;
                    const finished = g.finished === 'TRUE';
                    const notStarted = g.time_elapsed === 'notstarted';
                    
                    let newStatus = "SCHEDULED";
                    if (finished) {
                        newStatus = "FINISHED";
                    } else if (!notStarted) {
                        newStatus = "LIVE";
                    }
                    
                    // Skor veya durumda değişiklik varsa yerel veriyi güncelle
                    if (localMatch.homeScore !== newHomeScore || 
                        localMatch.awayScore !== newAwayScore || 
                        localMatch.status !== newStatus) {
                        
                        localMatch.homeScore = newHomeScore;
                        localMatch.awayScore = newAwayScore;
                        localMatch.status = newStatus;
                        
                        // Maç canlı veya bitmişse, ilk golcü bilgisini otomatik güncelle
                        if (newStatus === "LIVE" || newStatus === "FINISHED") {
                            const firstScorerName = extractFirstScorer(g.home_scorers, g.away_scorers);
                            if (firstScorerName && firstScorerName !== "Diğer") {
                                localMatch.sideQuestions.firstScorer = firstScorerName;
                            }
                        }
                        
                        updates.push(localMatch);
                        updatedCount++;
                    }
                }
            });
            
            if (updatedCount > 0) {
                console.log(`Free score API sync: Updated scores for ${updatedCount} matches!`);
                if (CONFIG.IS_DEMO_MODE) {
                    const data = getMockData();
                    data.matches = matches;
                    saveMockData(data);
                } else {
                    const batch = fStore.writeBatch(db);
                    updates.forEach(m => {
                        const matchDoc = fStore.doc(db, "matches", m.id);
                        batch.set(matchDoc, m, { merge: true });
                    });
                    await batch.commit();
                }
            } else {
                console.log("Free score API sync: No new match updates detected.");
            }
            return matches;
        }
    } catch (err) {
        console.error("Free World Cup live score API sync failed:", err);
    }
    return null;
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
export async function savePrediction(prediction, bypassLockCheck = false) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();

        // Enforce 15-minute lock before match starts
        const match = data.matches.find(m => m.id === prediction.matchId);
        if (match && !bypassLockCheck) {
            const matchTime = new Date(match.date).getTime();
            if (Date.now() >= matchTime - 15 * 60 * 1000) {
                console.error("Match is locked for predictions");
                return null;
            }
        }

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
            // Enforce 15-minute lock before match starts
            if (!bypassLockCheck) {
                const matchDocRef = fStore.doc(db, "matches", prediction.matchId);
                const matchSnap = await fStore.getDoc(matchDocRef);
                if (matchSnap.exists()) {
                    const matchData = matchSnap.data();
                    const matchTime = new Date(matchData.date).getTime();
                    if (Date.now() >= matchTime - 15 * 60 * 1000) {
                        console.error("Match is locked for predictions");
                        return null;
                    }
                }
            }

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
export async function completeMatch(matchId, homeScore, awayScore, sideAnswersActual) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex < 0) return false;

        const match = data.matches[matchIndex];
        match.homeScore = parseInt(homeScore);
        match.awayScore = parseInt(awayScore);
        match.status = "FINISHED";
        match.sideQuestions = { ...sideAnswersActual };

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
            await fStore.updateDoc(matchDocRef, {
                homeScore: parseInt(homeScore),
                awayScore: parseInt(awayScore),
                status: "FINISHED",
                sideQuestions: sideAnswersActual
            });
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

// Get all group predictions
export async function getAllGroupPredictions() {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        return data.groupPredictions || {};
    } else {
        try {
            const groupPredsSnapshot = await fStore.getDocs(fStore.collection(db, "groupPredictions"));
            const result = {};
            groupPredsSnapshot.forEach(doc => {
                result[doc.id] = doc.data().predictions;
            });
            return result;
        } catch (err) {
            console.error("Failed to get all group predictions from Firestore:", err);
            return {};
        }
    }
}

// Get all bracket predictions
export async function getAllBracketPredictions() {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        return data.bracketPredictions || {};
    } else {
        try {
            const bracketPredsSnapshot = await fStore.getDocs(fStore.collection(db, "bracketPredictions"));
            const result = {};
            bracketPredsSnapshot.forEach(doc => {
                result[doc.id] = doc.data();
            });
            return result;
        } catch (err) {
            console.error("Failed to get all bracket predictions from Firestore:", err);
            return {};
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
    const getActualMatchIdFromBracketId = (bracketMatchId) => {
        const mapping = {
            'match-r32-1': 'match-wc73', 'match-r32-2': 'match-wc74', 'match-r32-3': 'match-wc75', 'match-r32-4': 'match-wc76',
            'match-r32-5': 'match-wc77', 'match-r32-6': 'match-wc78', 'match-r32-7': 'match-wc79', 'match-r32-8': 'match-wc80',
            'match-r32-9': 'match-wc81', 'match-r32-10': 'match-wc82', 'match-r32-11': 'match-wc83', 'match-r32-12': 'match-wc84',
            'match-r32-13': 'match-wc85', 'match-r32-14': 'match-wc86', 'match-r32-15': 'match-wc87', 'match-r32-16': 'match-wc88',
            'match-r16-1': 'match-wc89', 'match-r16-2': 'match-wc90', 'match-r16-3': 'match-wc91', 'match-r16-4': 'match-wc92',
            'match-r16-5': 'match-wc93', 'match-r16-6': 'match-wc94', 'match-r16-7': 'match-wc95', 'match-r16-8': 'match-wc96',
            'match-qf-1': 'match-wc97', 'match-qf-2': 'match-wc98', 'match-qf-3': 'match-wc99', 'match-qf-4': 'match-wc100',
            'match-sf-1': 'match-wc101', 'match-sf-2': 'match-wc102', 'match-final-1': 'match-wc104'
        };
        return mapping[bracketMatchId] || bracketMatchId;
    };

    const allRounds = ['r32', 'r16', 'qf', 'sf', 'final'];
    allRounds.forEach(round => {
        const roundPreds = userBracketPred[round];
        if (roundPreds) {
            for (const [matchId, predWinner] of Object.entries(roundPreds)) {
                // Find actual match using translated match ID
                const actualMatchId = getActualMatchIdFromBracketId(matchId);
                const actualMatch = data.matches.find(m => m.id === actualMatchId);
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
                for (const [squadKey, squad] of Object.entries(userSquads)) {
                    // squadKey can be a roundKey (e.g. "round_1", "round_32") or matchId or date key
                    const dayMatches = data.matches.filter(m => {
                        return m.id === squadKey || 
                               getDateKey(m.date) === squadKey || 
                               getMatchFantasyRound(m, data.matches) === squadKey;
                    });
                    dayMatches.forEach(match => {
                        if (match.status === 'FINISHED' && match.playerRatings) {
                            squad.players.forEach(pId => {
                                let r = parseFloat(match.playerRatings[pId]) || 0;
                                if (pId === squad.captain) {
                                    r = r * 2;
                                }
                                fantasyPts += r;
                            });
                        }
                    });
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
                    const squadKey = squad.matchId; // squadKey can be a roundKey or match ID or date key
                    const dayMatches = matches.filter(m => {
                        return m.id === squadKey || 
                               getDateKey(m.date) === squadKey || 
                               getMatchFantasyRound(m, matches) === squadKey;
                    });
                    dayMatches.forEach(match => {
                        if (match.status === 'FINISHED' && match.playerRatings) {
                            squad.players.forEach(pId => {
                                let r = parseFloat(match.playerRatings[pId]) || 0;
                                if (pId === squad.captain) {
                                    r = r * 2;
                                }
                                fantasyPts += r;
                            });
                        }
                    });
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
    const defaultJokers = { ciftesans: 3, doublepuan: 3, allin: 3, spy: 3, doksanarti: 3, sabotaj: 3 };
    
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

// Delete user from database
export async function deleteUser(userId) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        data.users = (data.users || []).filter(u => u.id !== userId);
        data.predictions = (data.predictions || []).filter(p => p.userId !== userId);
        if (data.groupPredictions && data.groupPredictions[userId]) {
            delete data.groupPredictions[userId];
        }
        if (data.bracketPredictions && data.bracketPredictions[userId]) {
            delete data.bracketPredictions[userId];
        }
        if (data.fantasySquads && data.fantasySquads[userId]) {
            delete data.fantasySquads[userId];
        }
        saveMockData(data);
        return true;
    } else {
        try {
            // Delete user doc
            await fStore.deleteDoc(fStore.doc(db, "users", userId));
            
            // Delete predictions associated with this user
            const q = fStore.query(fStore.collection(db, "predictions"), fStore.where("userId", "==", userId));
            const snap = await fStore.getDocs(q);
            if (!snap.empty) {
                const batch = fStore.writeBatch(db);
                snap.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }

            // Delete group predictions (doc ID is userId)
            await fStore.deleteDoc(fStore.doc(db, "groupPredictions", userId)).catch(() => {});

            // Delete bracket predictions (doc ID is userId)
            await fStore.deleteDoc(fStore.doc(db, "bracketPredictions", userId)).catch(() => {});

            // Delete fantasy squads (query by userId)
            const qFantasy = fStore.query(fStore.collection(db, "fantasySquads"), fStore.where("userId", "==", userId));
            const snapFantasy = await fStore.getDocs(qFantasy);
            if (!snapFantasy.empty) {
                const batch = fStore.writeBatch(db);
                snapFantasy.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }

            return true;
        } catch (err) {
            console.error("Failed to delete user from Firestore:", err);
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

// Save user's fantasy squad for a match (matchId parameter is actually the round key e.g. "round_1")
export async function saveFantasySquad(userId, matchId, squadData) {
    await initDb();
    
    // Server-side/DB-side Lock validation
    const matches = await getMatches();
    const roundMatches = matches.filter(m => getMatchFantasyRound(m, matches) === matchId);
    if (roundMatches.length > 0) {
        let earliestMatchTime = Infinity;
        roundMatches.forEach(m => {
            const time = new Date(m.date).getTime();
            if (time < earliestMatchTime) earliestMatchTime = time;
        });
        const lockTime = earliestMatchTime - 15 * 60 * 1000;
        if (Date.now() >= lockTime) {
            console.error("Failed to save fantasy squad: Round is locked");
            return false;
        }
    }

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

export async function savePlayerRatings(matchId, ratings, sofaScoreId = null, homeScore = null, awayScore = null, status = null, statistics = null, incidents = null) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex >= 0) {
            const match = data.matches[matchIndex];
            match.playerRatings = { ...ratings };
            if (sofaScoreId) match.sofaScoreId = sofaScoreId;
            if (homeScore !== null && homeScore !== undefined) match.homeScore = parseInt(homeScore);
            if (awayScore !== null && awayScore !== undefined) match.awayScore = parseInt(awayScore);
            if (status) match.status = status;
            if (statistics) match.statistics = statistics;
            if (incidents) match.incidents = incidents;

            // Auto-compute side questions if incidents are available
            if (incidents && incidents.length > 0) {
                let htHome = 0;
                let htAway = 0;
                incidents.forEach(inc => {
                    if (inc.incidentType === 'goal' && inc.time <= 45) {
                        if (inc.isHome) htHome++;
                        else htAway++;
                    }
                });
                const htResult = htHome > htAway ? "home" : (htHome < htAway ? "away" : "draw");

                let firstScorer = "Diğer";
                const firstGoal = incidents.find(inc => inc.incidentType === 'goal');
                if (firstGoal && firstGoal.player && firstGoal.player.name) {
                    firstScorer = firstGoal.player.name;
                }

                const redCard = incidents.some(inc => inc.incidentType === 'card' && inc.incidentClass === 'red');

                let cornersCount = 0;
                if (statistics && Array.isArray(statistics)) {
                    const cornerItem = statistics.flatMap(g => g.statisticsItems || []).find(item => item.name.toLowerCase().includes("corner"));
                    if (cornerItem) {
                        cornersCount = (parseInt(cornerItem.homeValue) || 0) + (parseInt(cornerItem.awayValue) || 0);
                    }
                }
                const cornersOverUnder = cornersCount >= 9 ? "over" : "under";

                match.sideQuestions = {
                    htResult,
                    firstScorer,
                    redCard,
                    cornersOverUnder
                };
            }
            
            saveMockData(data);
            await recalculateAllUsersPoints();
            return true;
        }
        return false;
    } else {
        try {
            const docRef = fStore.doc(db, "matches", matchId);
            const updateObj = { playerRatings: { ...ratings } };
            if (sofaScoreId) updateObj.sofaScoreId = sofaScoreId;
            if (homeScore !== null && homeScore !== undefined) updateObj.homeScore = parseInt(homeScore);
            if (awayScore !== null && awayScore !== undefined) updateObj.awayScore = parseInt(awayScore);
            if (status) updateObj.status = status;
            if (statistics) updateObj.statistics = statistics;
            if (incidents) updateObj.incidents = incidents;

            // Auto-compute side questions if incidents are available
            if (incidents && incidents.length > 0) {
                let htHome = 0;
                let htAway = 0;
                incidents.forEach(inc => {
                    if (inc.incidentType === 'goal' && inc.time <= 45) {
                        if (inc.isHome) htHome++;
                        else htAway++;
                    }
                });
                const htResult = htHome > htAway ? "home" : (htHome < htAway ? "away" : "draw");

                let firstScorer = "Diğer";
                const firstGoal = incidents.find(inc => inc.incidentType === 'goal');
                if (firstGoal && firstGoal.player && firstGoal.player.name) {
                    firstScorer = firstGoal.player.name;
                }

                const redCard = incidents.some(inc => inc.incidentType === 'card' && inc.incidentClass === 'red');

                let cornersCount = 0;
                if (statistics && Array.isArray(statistics)) {
                    const cornerItem = statistics.flatMap(g => g.statisticsItems || []).find(item => item.name.toLowerCase().includes("corner"));
                    if (cornerItem) {
                        cornersCount = (parseInt(cornerItem.homeValue) || 0) + (parseInt(cornerItem.awayValue) || 0);
                    }
                }
                const cornersOverUnder = cornersCount >= 9 ? "over" : "under";

                updateObj.sideQuestions = {
                    htResult,
                    firstScorer,
                    redCard,
                    cornersOverUnder
                };
            }
            
            await fStore.updateDoc(docRef, updateObj);
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

// Manually update all match details
export async function updateMatchDetails(matchId, fields) {
    await initDb();
    
    // Auto-resolve flags if team names are updated and flags are not explicitly provided
    if (fields.homeTeam && !fields.homeFlag) {
        if (fields.homeTeam !== "Belirsiz") {
            const hData = Object.values(TEAMS_DATA).find(t => t.nameTr === fields.homeTeam);
            if (hData) fields.homeFlag = hData.flag;
            else fields.homeFlag = "https://flagcdn.com/un.svg";
        } else {
            fields.homeFlag = "https://flagcdn.com/un.svg";
        }
    }
    
    if (fields.awayTeam && !fields.awayFlag) {
        if (fields.awayTeam !== "Belirsiz") {
            const aData = Object.values(TEAMS_DATA).find(t => t.nameTr === fields.awayTeam);
            if (aData) fields.awayFlag = aData.flag;
            else fields.awayFlag = "https://flagcdn.com/un.svg";
        } else {
            fields.awayFlag = "https://flagcdn.com/un.svg";
        }
    }
    
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex >= 0) {
            data.matches[matchIndex] = { ...data.matches[matchIndex], ...fields };
            saveMockData(data);
            return true;
        }
        return false;
    } else {
        try {
            const docRef = fStore.doc(db, "matches", matchId);
            await fStore.updateDoc(docRef, fields);
            return true;
        } catch (err) {
            console.error("Failed to update match details in Firestore:", err);
            return false;
        }
    }
}

// Save SofaScore ID for a match
export async function updateMatchSofaScoreId(matchId, sofaScoreId) {
    await initDb();
    if (CONFIG.IS_DEMO_MODE) {
        const data = getMockData();
        const matchIndex = data.matches.findIndex(m => m.id === matchId);
        if (matchIndex >= 0) {
            data.matches[matchIndex].sofaScoreId = sofaScoreId;
            saveMockData(data);
            return true;
        }
        return false;
    } else {
        try {
            const docRef = fStore.doc(db, "matches", matchId);
            await fStore.updateDoc(docRef, { sofaScoreId });
            return true;
        } catch (err) {
            console.error("Failed to update match SofaScore ID in Firestore:", err);
            return false;
        }
    }
}

export function getMatchFantasyRound(match, matches = []) {
    if (!match || !match.group) return null;
    
    // Knockout matches
    if (match.group === 'Son 32') return 'round_32';
    if (match.group === 'Son 16') return 'round_16';
    if (match.group === 'Çeyrek Final') return 'quarter';
    if (match.group === 'Yarı Final') return 'semi';
    if (match.group === 'Final' || match.group === 'Üçüncülük') return 'final';
    
    // Group stage matches
    if (match.group.length === 1) {
        const groupMatches = matches.filter(m => m.group === match.group);
        groupMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
        const idx = groupMatches.findIndex(m => m.id === match.id);
        if (idx >= 0) {
            const matchday = Math.floor(idx / 2) + 1;
            return `round_${matchday}`;
        }
    }
    return null;
}
