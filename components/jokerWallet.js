// Joker Wallet Component (Floating Action Button + Bottom slide-up drawer + mobile tap dialog)
import { getPredictions, getUsers, savePrediction } from '../firebase-db.js';

export class JokerWallet {
    constructor(containerId, appState) {
        this.container = document.getElementById('jokers-deck'); // Selector in the bottom drawer
        this.appState = appState;
        
        // Modal & Drawer references
        this.modal = document.getElementById('tap-joker-modal');
        this.modalTitle = document.getElementById('modal-joker-title');
        this.modalDesc = document.getElementById('modal-joker-desc');
        this.modalMatchSelector = document.getElementById('modal-match-selector');
        this.modalCancelBtn = document.getElementById('modal-cancel-btn');
        this.activeJokerCountBadge = document.getElementById('active-jokers-count');

        this.fab = document.getElementById('joker-fab');
        this.drawer = document.getElementById('joker-drawer');
        this.backdrop = document.getElementById('joker-drawer-backdrop');

        // Bind cancel
        if (this.modalCancelBtn) {
            this.modalCancelBtn.addEventListener('click', () => this.hideModal());
        }

        // Bind FAB drawer toggle actions
        this.initDrawerActions();

        // Bind Close Drawer button
        this.closeDrawerBtn = document.getElementById('close-joker-drawer-btn');
        if (this.closeDrawerBtn) {
            this.closeDrawerBtn.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    initDrawerActions() {
        if (!this.fab) return;

        this.fab.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.drawer.classList.contains('active')) {
                window.history.back();
            } else {
                window.history.pushState({ screen: this.appState.activeScreen, modal: 'joker-drawer' }, '');
                this.drawer.classList.add('active');
                this.backdrop.classList.add('active');
                this.render();
            }
        });

        this.backdrop.addEventListener('click', () => {
            window.history.back();
        });
        
        // Also close drawer if clicked inside drawer somewhere that is not a card
        this.drawer.addEventListener('click', (e) => {
            if (e.target === this.drawer || e.target.classList.contains('joker-drawer-drag-line')) {
                window.history.back();
            }
        });
    }

    closeDrawer() {
        if (this.drawer) this.drawer.classList.remove('active');
        if (this.backdrop) this.backdrop.classList.remove('active');
    }

    render() {
        this.container.innerHTML = '';
        const user = this.appState.activeUser;
        if (!user) return;

        const jokers = user.jokers;
        let totalCount = 0;

        const jokerKeys = [
            { key: 'ciftesans', name: 'Çifte Şans', desc: 'Bir maça iki farklı skor girme hakkı.', icon: 'shuffle', grad: 'from-cyan-500 to-blue-600', shadow: 'shadow-neon-cyan' },
            { key: 'doublepuan', name: '2x Kat Puan', desc: 'Doğru tahminde iki kat puan, yanlışta -5 puan riski.', icon: 'zap', grad: 'from-purple-500 to-indigo-600', shadow: 'shadow-neon-purple' },
            { key: 'allin', name: 'Hep ya da Hiç', desc: 'Tam skorda 3x (30) puan, yatarsa -15 puan riski.', icon: 'skull', grad: 'from-yellow-500 to-amber-600', shadow: 'shadow-neon-yellow' },
            { key: 'spy', name: 'Casus', desc: 'Maç başlamadan önce liderin tahminini aynen kopyala.', icon: 'eye', grad: 'from-pink-500 to-rose-600', shadow: 'shadow-neon-pink' },
            { key: 'doksanarti', name: 'Doksan Artı', desc: 'Maçın ilk 15 dakikasında tahmini değiştirebilirsin.', icon: 'clock-3', grad: 'from-green-500 to-emerald-600', shadow: 'shadow-neon-green' },
            { key: 'sabotaj', name: 'Sabotaj', desc: 'Bir arkadaşını sabote et, o maçtaki puanı yarıya insin (0.5x).', icon: 'shield-alert', grad: 'from-red-500 to-rose-700', shadow: 'shadow-neon-pink' }
        ];

        jokerKeys.forEach(j => {
            const count = jokers[j.key] || 0;
            totalCount += count;
            
            const jokerEl = document.createElement('div');
            const isDisabled = count <= 0;
            
            jokerEl.className = `joker-card w-full rounded-2xl bg-gradient-to-r ${j.grad} ${j.shadow} p-4 flex items-center justify-between select-none relative overflow-hidden text-black transition-all mb-3 ${
                isDisabled ? 'opacity-20 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01] active:scale-99'
            }`;

            // Cards design (decorative shapes and lucide icons)
            jokerEl.innerHTML = `
                <!-- Cards shines -->
                <div class="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-md"></div>
                <div class="absolute bottom-[-10px] left-[-10px] w-12 h-12 bg-black/10 rounded-full blur-sm"></div>

                <div class="flex items-center gap-3.5 z-10 flex-1">
                    <div class="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white flex-shrink-0">
                        <i data-lucide="${j.icon}" class="w-5.5 h-5.5"></i>
                    </div>
                    <div class="text-left">
                        <h4 class="text-xs font-outfit font-black tracking-tight text-white uppercase leading-none">${j.name}</h4>
                        <p class="text-[10px] text-white/90 font-medium leading-tight mt-1.5 max-w-[220px]">${j.desc}</p>
                    </div>
                </div>

                <div class="z-10 flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                    <span class="bg-black text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg">
                        x${count}
                    </span>
                    ${isDisabled ? '<span class="text-[8px] bg-black/40 text-white/60 px-1 py-0.5 rounded uppercase font-bold tracking-wider">Tükendi</span>' : ''}
                </div>
            `;

            // Click applies directly or opens selection
            if (!isDisabled) {
                jokerEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.history.back(); // Pop the joker-drawer state first

                    const detailModal = document.getElementById('match-detail-modal');
                    const isDetailOpen = detailModal && detailModal.classList.contains('active');

                    if (isDetailOpen) {
                        // If predicting a match inside detailed view, apply immediately to this match!
                        const activeMatch = this.appState.matches[this.appState.activeMatchIndex];
                        if (activeMatch) {
                            this.executeJokerApplication(j.key, activeMatch.id);
                        }
                    } else {
                        // Otherwise, prompt selection of which match to apply to
                        this.showTapJokerModal(j.key, j.name, j.desc);
                    }
                });
            }

            this.container.appendChild(jokerEl);
        });

        // Update counts
        if (this.activeJokerCountBadge) {
            this.activeJokerCountBadge.textContent = `${totalCount} Kullanılabilir`;
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Modal view for mobile users (tap to apply on list screen)
    async showTapJokerModal(jokerKey, name, desc) {
        this.modalTitle.textContent = name;
        this.modalDesc.textContent = desc;
        
        // Glow accent colors
        const glowDiv = document.getElementById('modal-joker-glow');
        if (glowDiv) {
            glowDiv.className = `absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 blur-xl opacity-40 pointer-events-none bg-cyan-500`;
            if (jokerKey === 'doublepuan') glowDiv.className = 'absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 blur-xl opacity-40 pointer-events-none bg-purple-500';
            if (jokerKey === 'allin') glowDiv.className = 'absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 blur-xl opacity-40 pointer-events-none bg-yellow-500';
            if (jokerKey === 'sabotaj') glowDiv.className = 'absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 blur-xl opacity-40 pointer-events-none bg-red-500';
        }

        this.modalMatchSelector.innerHTML = '';
        
        const matches = this.appState.matches.filter(m => m.status !== 'FINISHED');
        if (matches.length === 0) {
            this.modalMatchSelector.innerHTML = `<span class="text-xs text-slate-500 italic py-2">Uygulanabilecek aktif maç bulunamadı.</span>`;
        } else {
            matches.forEach(m => {
                const btn = document.createElement('button');
                btn.className = 'w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-cyan hover:bg-brand-cyan/10 text-xs font-bold text-slate-200 transition-all flex items-center justify-between mb-1.5';
                btn.innerHTML = `
                    <span>${m.homeTeam} vs ${m.awayTeam}</span>
                    <span class="text-[9px] font-semibold text-slate-500">Uygula ➔</span>
                `;
                
                btn.addEventListener('click', async () => {
                    this.hideModal();
                    await this.executeJokerApplication(jokerKey, m.id);
                });
                
                this.modalMatchSelector.appendChild(btn);
            });
        }

        // Show Modal
        this.modal.classList.remove('hidden');
        setTimeout(() => this.modal.classList.remove('opacity-0'), 10);
    }

    hideModal() {
        this.modal.classList.add('opacity-0');
        setTimeout(() => this.modal.classList.add('hidden'), 300);
    }

    // Handles the actual logic of applying the joker to the prediction
    async executeJokerApplication(jokerKey, matchId) {
        if (jokerKey === 'sabotaj') {
            // Sabotage targets a friend
            this.promptSabotageTarget(matchId);
            return;
        }

        const preds = await getPredictions(this.appState.activeUser.id, matchId);
        const pred = preds.length > 0 ? preds[0] : {
            userId: this.appState.activeUser.id,
            matchId: matchId,
            homeScorePred: 0,
            awayScorePred: 0,
            sideAnswers: { htResult: 'draw', firstScorer: '', redCard: false, cornersOverUnder: 'under' },
            isLocked: false
        };

        if (pred.isLocked) {
            alert("Kilitlenmiş tahminlere joker uygulayamazsınız! Önce kilidi açınız.");
            return;
        }

        // Casus copies leader's predictions
        if (jokerKey === 'spy') {
            const users = await getUsers();
            const leader = users.find(u => u.badge === 'kahin') || users[0];
            if (leader.id === this.appState.activeUser.id) {
                alert("Zaten lider sizsiniz! Kendi tahmininizi kopyalayamazsınız.");
                return;
            }
            
            const leaderPreds = await getPredictions(leader.id, matchId);
            if (leaderPreds.length === 0 || !leaderPreds[0].isLocked) {
                alert("Lider henüz bu maç için tahminini kilitlemedi! Daha sonra tekrar deneyiniz.");
                return;
            }

            pred.homeScorePred = leaderPreds[0].homeScorePred;
            pred.awayScorePred = leaderPreds[0].awayScorePred;
            pred.sideAnswers = { ...leaderPreds[0].sideAnswers };
            
            alert(`Lider ${leader.name} tahminleri kopyalandı! (Skor: ${pred.homeScorePred}-${pred.awayScorePred})`);
        }

        pred.appliedJoker = jokerKey;
        await savePrediction(pred);
        
        // Sync re-render of overlay if it is open
        const detailModal = document.getElementById('match-detail-modal');
        const isDetailOpen = detailModal && detailModal.classList.contains('active');
        if (isDetailOpen) {
            const matchIndex = this.appState.matches.findIndex(m => m.id === matchId);
            const activeMatch = this.appState.matches[matchIndex];
            this.appState.fixtureCardComp.openMatchDetail(activeMatch, matchIndex);
        } else {
            this.appState.refreshDashboard();
        }
    }

    // Custom flow to choose sabotage target user
    async promptSabotageTarget(matchId) {
        this.modalTitle.textContent = "SABOTAJ JOKERİ";
        this.modalDesc.textContent = "Hangi arkadaşının bu maçtan alacağı puanları yarıya (0.5x) indirmek istersin?";
        this.modalMatchSelector.innerHTML = '';

        const users = await getUsers();
        const friends = users.filter(u => u.id !== this.appState.activeUser.id);
        
        friends.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'w-full py-2.5 px-3 rounded-xl bg-red-950/20 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-xs font-bold text-slate-200 transition-all flex items-center justify-between mb-1.5';
            btn.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-full ${f.avatar}"></div>
                    <span>${f.name}</span>
                </div>
                <span class="text-[9px] text-red-400 font-extrabold uppercase">Sabote Et ☠️</span>
            `;
            
            btn.addEventListener('click', async () => {
                this.hideModal();
                
                const pred = {
                    userId: this.appState.activeUser.id,
                    matchId: matchId,
                    appliedJoker: 'sabotaj',
                    targetUserId: f.id,
                    isLocked: true // Autolock sabotage
                };

                await savePrediction(pred);
                alert(`${f.name} başarıyla sabote edildi! ☠️`);
                this.appState.refreshDashboard();
            });

            this.modalMatchSelector.appendChild(btn);
        });

        // Show Modal
        this.modal.classList.remove('hidden');
        setTimeout(() => this.modal.classList.remove('opacity-0'), 10);
    }
}
