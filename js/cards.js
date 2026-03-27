// 初始化游戏
function initGame() {
    // 重置游戏状态
    gameState = {
        players: [
            {
                id: 1,
                name: "文明·人联",
                cards: createCards(),
                killerCount: 4,
                normalCount: 4,
                godCount: 4,
                eliminatedCards: 0,
                lastGuardedIndex: -1, // 记录上一次守护的卡牌索引
                protectedCards: [] // 记录被守护成功或医疗牌治疗的卡牌索引
            },
            {
                id: 2,
                name: "文明·智域",
                cards: createCards(),
                killerCount: 4,
                normalCount: 4,
                godCount: 4,
                eliminatedCards: 0,
                lastGuardedIndex: -1, // 记录上一次守护的卡牌索引
                protectedCards: [] // 记录被守护成功或医疗牌治疗的卡牌索引
            }
        ],
        gameLog: [], // 存储游戏记录
        aiThinkingLog: [], // 存储AI思考过程
        currentPlayer: 0,
        currentPhase: 'defense',
        gameStarted: true,
        gameEnded: false,
        roundPhase: 1,
        roundNumber: 1,
        hunterBonusAttack: false
    };

    // 更新界面
    updateUI();
    document.getElementById('game-status').textContent = '游戏进行中';
    document.getElementById('result-message').style.display = 'none';
    
    // 开始第一个阶段：玩家1防守
    startNextPhase();
}

// 更新界面
function updateUI() {
    if (!gameState.gameStarted) {
        document.getElementById('current-turn').textContent = '当前回合：未开始';
    }

    // 更新玩家1的卡牌
    const player1CardsContainer = document.getElementById('player1-cards');
    player1CardsContainer.innerHTML = '';
    gameState.players[0].cards.forEach((card, index) => {
        // 创建卡牌容器
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        
        // 创建卡牌元素
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        if (card.eliminated) {
            cardElement.classList.add('eliminated');
        }
        
        // 添加卡牌类型样式
        if (card.type === 'killer') {
            cardElement.classList.add('killer');
        } else if (card.type === 'doctor') {
            cardElement.classList.add('doctor');
        } else if (card.type === 'guard') {
            cardElement.classList.add('guard');
        } else if (card.type === 'hunter') {
            cardElement.classList.add('hunter');
            // 添加失控·001的背景图片
            cardElement.style.backgroundImage = `url('assets/images/experiment_001_card_v3.png.jpeg')`;
            cardElement.style.backgroundSize = 'cover';
            cardElement.style.backgroundPosition = 'center';
            cardElement.style.color = 'white'; // 确保文字清晰可见
        } else if (card.type === 'prophet') {
            cardElement.classList.add('prophet');
        }
        
        // 如果卡牌被预言家查验过，添加查验标记
        let hasInspectedMark = false;
        if (card.inspected) {
            cardElement.classList.add('inspected');
            hasInspectedMark = true;
        }
        
        // 如果卡牌被守护，添加守护样式
        if (card.guarded) {
            cardElement.classList.add('guarded');
        }
        
        // 如果卡牌被消除，添加被消除标记
        if (card.eliminated) {
            const eliminatedMark = document.createElement('div');
            eliminatedMark.className = 'eliminated-mark';
            eliminatedMark.textContent = 'X';
            cardElement.appendChild(eliminatedMark);
        }
        
        // 创建文字和序号的容器
        const cardInfo = document.createElement('div');
        cardInfo.className = 'card-info';
        
        // 创建卡牌文字元素
        const cardText = document.createElement('div');
        cardText.className = 'card-text';
        if (card.eliminated) {
            if (gameState.gameEnded || card.inspected) {
                let typeName = '';
                switch(card.type) {
                    case 'killer': typeName = '清除者'; break;
                    case 'doctor': typeName = '重组师'; break;
                    case 'guard': typeName = '护盾官'; break;
                    case 'hunter': typeName = '失控·001'; break;
                    case 'prophet': typeName = '先知'; break;
                    case 'normal': typeName = '研究员'; break;
                }
                cardText.textContent = `${typeName} (已消除)`;
            } else {
                cardText.textContent = '已消除';
            }
        } else {
            if (card.type === 'killer') {
                cardText.textContent = `清除者`;
            } else if (card.type === 'doctor') {
                cardText.textContent = `重组师`;
            } else if (card.type === 'guard') {
                cardText.textContent = `护盾官`;
            } else if (card.type === 'hunter') {
                cardText.textContent = `失控·001`;
            } else if (card.type === 'prophet') {
                cardText.textContent = `先知`;
            } else {
                cardText.textContent = `研究员`;
            }
        }
        
        // 创建卡牌序号元素
        const cardId = document.createElement('div');
        cardId.className = 'card-id';
        cardId.textContent = index + 1;
        
        // 组装文字和序号容器
        cardInfo.appendChild(cardText);
        cardInfo.appendChild(cardId);
        
        // 如果卡牌被查验过，在序号右侧添加灯泡标记
        if (hasInspectedMark) {
            const exposedMark = document.createElement('div');
            exposedMark.className = 'exposed-mark';
            exposedMark.innerHTML = '💡'; // 灯泡 emoji
            cardInfo.appendChild(exposedMark);
        }
        
        // 组装卡牌容器
        cardContainer.appendChild(cardElement);
        cardContainer.appendChild(cardInfo);
        
        player1CardsContainer.appendChild(cardContainer);
    });

    // 更新玩家2的卡牌
    const player2CardsContainer = document.getElementById('player2-cards');
    player2CardsContainer.innerHTML = '';
    gameState.players[1].cards.forEach((card, index) => {
        // 创建卡牌容器
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        
        // 创建卡牌元素
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        if (card.eliminated) {
            cardElement.classList.add('eliminated');
        }
        
        // 添加卡牌类型样式
        if (gameState.gameEnded || card.inspected) {
            if (card.type === 'killer') {
                cardElement.classList.add('killer');
            } else if (card.type === 'doctor') {
                cardElement.classList.add('doctor');
            } else if (card.type === 'guard') {
                cardElement.classList.add('guard');
            } else if (card.type === 'hunter') {
                cardElement.classList.add('hunter');
                // 添加失控·001的背景图片
                cardElement.style.backgroundImage = `url('assets/images/experiment_001_card_v3.png.jpeg')`;
                cardElement.style.backgroundSize = 'cover';
                cardElement.style.backgroundPosition = 'center';
                cardElement.style.color = 'white'; // 确保文字清晰可见
            } else if (card.type === 'prophet') {
                cardElement.classList.add('prophet');
            }
        } else {
            // 未被查验的卡牌隐藏类型
            cardElement.classList.add('unknown');
        }
        
        // 如果卡牌被预言家查验过，添加查验标记
        let hasInspectedMark = false;
        if (card.inspected) {
            cardElement.classList.add('inspected');
            hasInspectedMark = true;
        }
        
        // 如果卡牌被消除，添加被消除标记
        if (card.eliminated) {
            const eliminatedMark = document.createElement('div');
            eliminatedMark.className = 'eliminated-mark';
            eliminatedMark.textContent = 'X';
            cardElement.appendChild(eliminatedMark);
        }
        
        // 只有在玩家1的攻击回合时，允许点击玩家2的卡牌
        if (gameState.gameStarted && gameState.currentPlayer === 0 && gameState.currentPhase === 'attack' && !card.eliminated) {
            cardElement.addEventListener('click', () =>
                selectCard(1, index, !!gameState.hunterBonusAttack)
            );
        }
        
        // 创建文字和序号的容器
        const cardInfo = document.createElement('div');
        cardInfo.className = 'card-info';
        
        // 创建卡牌文字元素
        const cardText = document.createElement('div');
        cardText.className = 'card-text';
        if (card.eliminated) {
            if (gameState.gameEnded || card.inspected) {
                let typeName = '';
                switch(card.type) {
                    case 'killer': typeName = '清除者'; break;
                    case 'doctor': typeName = '重组师'; break;
                    case 'guard': typeName = '护盾官'; break;
                    case 'hunter': typeName = '失控·001'; break;
                    case 'prophet': typeName = '先知'; break;
                    case 'normal': typeName = '研究员'; break;
                }
                cardText.textContent = `${typeName} (已消除)`;
            } else {
                cardText.textContent = '已消除';
            }
        } else if (gameState.gameEnded || card.inspected) {
            let typeName = '';
            switch(card.type) {
                case 'killer': typeName = '清除者'; break;
                case 'doctor': typeName = '重组师'; break;
                case 'guard': typeName = '护盾官'; break;
                case 'hunter': typeName = '失控·001'; break;
                case 'prophet': typeName = '先知'; break;
                case 'normal': typeName = '研究员'; break;
            }
            cardText.textContent = typeName;
        } else {
            cardText.textContent = '?';
        }
        
        // 创建卡牌序号元素
        const cardId = document.createElement('div');
        cardId.className = 'card-id';
        cardId.textContent = index + 1;
        
        // 组装文字和序号容器
        cardInfo.appendChild(cardText);
        cardInfo.appendChild(cardId);
        
        // 组装卡牌容器
        cardContainer.appendChild(cardElement);
        cardContainer.appendChild(cardInfo);
        
        player2CardsContainer.appendChild(cardContainer);
    });

    // 更新回合数和存活统计
    const roundEl = document.getElementById('round-count');
    if (roundEl) {
        roundEl.textContent = `回合数：${gameState.roundNumber || 1}`;
    }
    const p1 = gameState.players[0];
    const p2 = gameState.players[1];
    const p1KillerEl = document.getElementById('player1-killer-count');
    const p1CardEl   = document.getElementById('player1-card-count');
    const p2KillerEl = document.getElementById('player2-killer-count');
    const p2CardEl   = document.getElementById('player2-card-count');
    if (p1KillerEl) p1KillerEl.textContent = `清除者: ${p1.cards.filter(c => !c.eliminated && c.type === 'killer').length}`;
    if (p1CardEl)   p1CardEl.textContent   = `存活: ${p1.cards.filter(c => !c.eliminated).length}`;
    if (p2KillerEl) p2KillerEl.textContent = `清除者: ${p2.cards.filter(c => !c.eliminated && c.type === 'killer').length}`;
    if (p2CardEl)   p2CardEl.textContent   = `存活: ${p2.cards.filter(c => !c.eliminated).length}`;
}


// 选择卡牌
function selectCard(targetPlayerIndex, cardIndex, isHunterAttack = false) {
    if (gameState.gameEnded) return;

    const targetPlayer = gameState.players[targetPlayerIndex];
    const card = targetPlayer.cards[cardIndex];
    const attackingPlayer = gameState.players[gameState.currentPlayer];

    // 检查是否是攻击操作（不是猎人攻击的特殊情况）
    if (!isHunterAttack) {
        // 检查当前是否是预言回合或防守回合
        if (gameState.currentPhase === 'prophet' || gameState.currentPhase === 'defense') {
            // 在预言或防守回合，提示当前回合
            let phaseMessage = '';
            if (gameState.currentPhase === 'prophet') {
                phaseMessage = '当前是预言回合，请先完成查验操作！';
            } else if (gameState.currentPhase === 'defense') {
                phaseMessage = '当前是防守回合，请先完成守护操作！';
            }
            showInteractionMessage(phaseMessage);
            return;
        }
        
        // 检查是否已经完成了预言和防守回合
        const hasProphet = attackingPlayer.cards.some(c => c.type === 'prophet' && !c.eliminated);
        const hasGuard = attackingPlayer.cards.some(c => c.type === 'guard' && !c.eliminated);
        
        // 检查是否已经完成了所有必要的回合
        const prophetPhaseCompleted = !hasProphet || gameState.roundPhase > 2;
        const defensePhaseCompleted = !hasGuard || gameState.roundPhase > 4;
        
        if (!prophetPhaseCompleted || !defensePhaseCompleted) {
            // 还没有完成所有必要的回合，不能攻击
            let message = '';
            if (!prophetPhaseCompleted) {
                message = '当前是预言回合，请先完成查验操作！';
            } else if (!defensePhaseCompleted) {
                message = '当前是防守回合，请先完成守护操作！';
            }
            showInteractionMessage(message);
            return;
        }
    }

    // 检查卡牌是否已被消除
    if (card.eliminated) return;

    // 检查卡牌是否被守护，猎人攻击无视守护
    if (card.guarded && !isHunterAttack) {
        // 显示确认攻击按钮
        if (gameState.currentPlayer === 0) {
            // 玩家1的攻击，显示确认按钮
            const interactionContent = document.getElementById('interaction-content');
            interactionContent.innerHTML = `
                <p>确认攻击对方的卡牌 #${cardIndex + 1}吗？</p>
                <button class="btn btn-primary" onclick="confirmAttack(${targetPlayerIndex}, ${cardIndex}, ${isHunterAttack})">确认攻击</button>
                <button class="btn btn-secondary" onclick="cancelAttack()">取消</button>
            `;
            return;
        } else {
            // AI攻击直接执行
            // 添加游戏记录
            gameState.gameLog.push(`${attackingPlayer.name}攻击了被守护的卡牌 #${cardIndex + 1}，攻击失败！`);
            // 记录被守护成功的卡牌
            if (!targetPlayer.protectedCards.includes(cardIndex)) {
                targetPlayer.protectedCards.push(cardIndex);
            }
            // 弹窗提示
            if (targetPlayerIndex === 0) {
                // 玩家一守护成功
                showInteractionMessage('我方守护成功！对方的攻击被抵消了！');
            } else {
                // 玩家二守护成功
                showInteractionMessage('对方守护成功！攻击被抵消了！');
            }
            // 当攻击被守护目标后，视为已攻击过，不能再选择其他目标
            setTimeout(() => {
                startNextPhase();
            }, 2000);
            return;
        }
    }

    // 检查目标玩家是否有未使用的重组师，且被攻击的卡牌不是重组师自己
    const doctorCard = targetPlayer.cards.find(c => c.type === 'doctor' && !c.eliminated && !c.used);
    // 检查被攻击的卡牌是否是重组师自己
    const isDoctorSelf = card.type === 'doctor';
    let shouldEliminate = true;

    // 猎人攻击无法被医师治疗
    if (doctorCard && !isDoctorSelf && !isHunterAttack) {
        if (targetPlayerIndex === 0) {
            // 玩家一被攻击，使用交互面板询问是否使用重组师
            showDoctorSelectionUI(cardIndex);
            return;
        } else {
            // 玩家二被攻击，AI自动判断是否使用重组师
            // 计算各类卡牌的剩余数量
            let killerCount = 0;
            let normalCount = 0;
            let godCount = 0;
            targetPlayer.cards.forEach(c => {
                if (!c.eliminated) {
                    if (c.type === 'killer') {
                        killerCount++;
                    } else if (c.type === 'normal') {
                        normalCount++;
                    } else {
                        godCount++;
                    }
                }
            });
            
            // 计算被攻击卡牌的权重
            let cardWeight = 1;
            
            // 功能牌权重提升
            if (card.type !== 'normal') {
                cardWeight *= 1.5;
            }
            
            // 护盾官权重额外提升
            if (card.type === 'guard') {
                cardWeight *= 2.0; // 提高守卫的救治权重
            }
            
            // 按牌类数目调整权重，优先保护数目少的
            if (card.type === 'killer') {
                cardWeight *= (1 / killerCount);
                // 如果是最后一张杀手卡，额外提升权重
                if (killerCount === 1) {
                    cardWeight *= 1.5;
                }
            } else if (card.type === 'normal') {
                cardWeight *= (1 / normalCount);
                // 如果是最后一张普通卡，额外提升权重
                if (normalCount === 1) {
                    cardWeight *= 1.5;
                }
            } else {
                cardWeight *= (1 / godCount);
                // 如果是最后一张神卡，额外提升权重
                if (godCount === 1) {
                    cardWeight *= 1.5;
                }
            }
            
            // 被查验牌权重提升（更容易被攻击）
            if (card.inspected) {
                cardWeight *= 1.5;
            }
            
            // 添加一定的随机性
            const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 到 1.2 之间的随机数
            cardWeight *= randomFactor;
            
            // 权重高于1.2时使用重组师
            shouldEliminate = cardWeight <= 1.2;
        }

        if (!shouldEliminate) {
            // 使用重组师抵消消除
            doctorCard.used = true;
            
            // 记录被医疗牌治疗的卡牌
            if (!targetPlayer.protectedCards.includes(cardIndex)) {
                targetPlayer.protectedCards.push(cardIndex);
            }
            
            // 添加游戏记录
            let typeName = '';
            switch(card.type) {
                case 'killer': typeName = '清除者'; break;
                case 'doctor': typeName = '重组师'; break;
                case 'hunter': typeName = '失控·001'; break;
                case 'prophet': typeName = '先知'; break;
                case 'normal': typeName = '研究员'; break;
            }
            gameState.gameLog.push(`${targetPlayer.name}使用重组师抵消了对卡牌 #${cardIndex + 1} (${typeName})的消除！`);
            
            // 显示治疗信息，不显示玩家二卡牌的具体信息
            if (targetPlayer.id === 1) {
                // 玩家一治疗，显示具体信息
                showInteractionMessage(targetPlayer.name + '使用了重组师抵消了对卡牌 #' + (cardIndex + 1) + '的消除！');
            } else {
                // 玩家二治疗，不显示具体信息
                showInteractionMessage(targetPlayer.name + '使用了重组师抵消了攻击！');
            }
            
            // 弹窗提示
            if (targetPlayerIndex === 0) {
                // 玩家一治疗成功
                showInteractionMessage('治疗成功！对方的攻击被抵消了！');
            } else {
                // 玩家二治疗成功
                showInteractionMessage('攻击被守护或治疗！');
            }
            
            updateUI();
            
            // 处理回合切换
            startNextPhase();
            return;
        }
    } else if (isHunterAttack) {
        // 猎人攻击无法被医师治疗，添加游戏记录
        gameState.gameLog.push(`失控·001攻击无视医师治疗！`);
    }

    // 显示确认击杀按钮
    if (gameState.currentPlayer === 0) {
        // 玩家1的攻击，显示确认按钮
        const interactionContent = document.getElementById('interaction-content');
        let typeName = '';
        switch(card.type) {
            case 'killer': typeName = '清除者'; break;
            case 'doctor': typeName = '重组师'; break;
            case 'hunter': typeName = '失控·001'; break;
            case 'prophet': typeName = '先知'; break;
            case 'normal': typeName = '研究员'; break;
        }
        
        // 对于玩家二未知的牌，不显示具体类型
        let displayTypeName = '';
        if (targetPlayerIndex === 1 && !card.inspected) {
            // 玩家二的未知卡牌，不显示类型
            displayTypeName = '';
        } else {
            // 玩家一的卡牌或玩家二已被查验的卡牌，显示类型
            displayTypeName = ` (${typeName})`;
        }
        
        interactionContent.innerHTML = `
            <p>确认消除对方的卡牌 #${cardIndex + 1}${displayTypeName}吗？</p>
            <button class="btn btn-primary" onclick="confirmAttack(${targetPlayerIndex}, ${cardIndex}, ${isHunterAttack})">确认击杀</button>
            <button class="btn btn-secondary" onclick="cancelAttack()">取消</button>
        `;
        return;
    }

    // AI攻击直接执行
    executeAttack(targetPlayerIndex, cardIndex, isHunterAttack);
}

// 执行攻击
function executeAttack(targetPlayerIndex, cardIndex, isHunterAttack = false) {
    try {
    // 播放攻击音效
    playSound('attack-sound');
    
    const targetPlayer = gameState.players[targetPlayerIndex];
    const card = targetPlayer.cards[cardIndex];
    const attackingPlayer = gameState.players[gameState.currentPlayer];

    // 检查卡牌是否被守护，猎人攻击无视守护
    if (card.guarded && !isHunterAttack) {
        // 添加游戏记录
        gameState.gameLog.push(`${attackingPlayer.name}攻击了被守护的卡牌 #${cardIndex + 1}，攻击失败！`);
        // 记录被守护成功的卡牌
        if (!targetPlayer.protectedCards.includes(cardIndex)) {
            targetPlayer.protectedCards.push(cardIndex);
        }
        // 弹窗提示
        if (targetPlayerIndex === 0) {
            // 玩家一攻击被抵消
            showInteractionMessage('攻击被抵消了！');
        } else {
            // 玩家二攻击被抵消
            showInteractionMessage('攻击被抵消了！');
        }
        // 当攻击被守护目标后，视为已攻击过，不能再选择其他目标
        setTimeout(() => {
            startNextPhase();
        }, 2000);
        return;
    }

    // 检查目标玩家是否有未使用的重组师，且被攻击的卡牌不是重组师自己
    const doctorCard = targetPlayer.cards.find(c => c.type === 'doctor' && !c.eliminated && !c.used);
    // 检查被攻击的卡牌是否是重组师自己
    const isDoctorSelf = card.type === 'doctor';
    let shouldEliminate = true;

    // 猎人攻击无法被医师治疗
    if (doctorCard && !isDoctorSelf && !isHunterAttack) {
        if (targetPlayerIndex === 0) {
            // 玩家一被攻击，使用交互面板询问是否使用重组师
            showDoctorSelectionUI(cardIndex);
            return;
        } else {
            // 玩家二被攻击，AI自动判断是否使用重组师
            // 计算各类卡牌的剩余数量
            let killerCount = 0;
            let normalCount = 0;
            let godCount = 0;
            targetPlayer.cards.forEach(c => {
                if (!c.eliminated) {
                    if (c.type === 'killer') {
                        killerCount++;
                    } else if (c.type === 'normal') {
                        normalCount++;
                    } else {
                        godCount++;
                    }
                }
            });
            
            // 计算被攻击卡牌的权重
            let cardWeight = 1;
            
            // 功能牌权重提升
            if (card.type !== 'normal') {
                cardWeight *= 1.5;
            }
            
            // 护盾官权重额外提升
            if (card.type === 'guard') {
                cardWeight *= 2.0; // 提高守卫的救治权重
            }
            
            // 按牌类数目调整权重，优先保护数目少的
            if (card.type === 'killer') {
                cardWeight *= (1 / killerCount);
                // 如果是最后一张杀手卡，额外提升权重
                if (killerCount === 1) {
                    cardWeight *= 1.5;
                }
            } else if (card.type === 'normal') {
                cardWeight *= (1 / normalCount);
                // 如果是最后一张普通卡，额外提升权重
                if (normalCount === 1) {
                    cardWeight *= 1.5;
                }
            } else {
                cardWeight *= (1 / godCount);
                // 如果是最后一张神卡，额外提升权重
                if (godCount === 1) {
                    cardWeight *= 1.5;
                }
            }
            
            // 被查验牌权重提升（更容易被攻击）
            if (card.inspected) {
                cardWeight *= 1.5;
            }
            
            // 添加一定的随机性
            const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 到 1.2 之间的随机数
            cardWeight *= randomFactor;
            
            // 权重高于1.2时使用重组师
            shouldEliminate = cardWeight <= 1.2;
        }

        if (!shouldEliminate) {
            // 使用重组师抵消消除
            doctorCard.used = true;
            
            // 添加游戏记录
            let typeName = '';
            switch(card.type) {
                case 'killer': typeName = '清除者'; break;
                case 'doctor': typeName = '重组师'; break;
                case 'hunter': typeName = '失控·001'; break;
                case 'prophet': typeName = '先知'; break;
                case 'normal': typeName = '研究员'; break;
            }
            gameState.gameLog.push(`${targetPlayer.name}使用重组师抵消了对卡牌 #${cardIndex + 1} (${typeName})的消除！`);
            
            // 显示攻击被抵消信息
            if (targetPlayerIndex === 0) {
                // 玩家一攻击被抵消
                showInteractionMessage('攻击被抵消了！');
            } else {
                // 玩家二攻击被抵消
                showInteractionMessage('攻击被抵消了！');
            }
            
            updateUI();
            
            // 处理回合切换
            startNextPhase();
            return;
        }
    } else if (isHunterAttack) {
        // 猎人攻击无法被医师治疗，添加游戏记录
        gameState.gameLog.push(`猎人攻击无视医师治疗！`);
    }

    // 消除卡牌
    card.eliminated = true;
    targetPlayer.eliminatedCards++;

    // 检查卡牌类型并更新对应计数
    if (card.type === 'killer') {
        targetPlayer.killerCount--;
    } else if (card.type === 'normal') {
        targetPlayer.normalCount--;
    } else {
        // 神牌（doctor, guard, hunter, prophet）
        targetPlayer.godCount--;
    }

    // 添加游戏记录
    let typeName = '';
    switch(card.type) {
        case 'killer': typeName = '清除者'; break;
        case 'doctor': typeName = '重组师'; break;
        case 'hunter': typeName = '失控·001'; break;
        case 'prophet': typeName = '先知'; break;
        case 'normal': typeName = '研究员'; break;
    }
    let attackType = isHunterAttack ? ' (失控·001攻击，无视守护)' : '';
    gameState.gameLog.push(`${attackingPlayer.name}消除了${targetPlayer.name}的卡牌 #${cardIndex + 1} (${typeName})${attackType}！`);
    
    // 显示卡牌被消除的提示
    if (targetPlayerIndex === 0) {
        // 玩家一的卡牌被消除
        showInteractionMessage('你的卡牌 #' + (cardIndex + 1) + ' 被消除了！');
    } else {
        // 玩家二的卡牌被消除
        showInteractionMessage('对方的卡牌 #' + (cardIndex + 1) + ' 被消除了！');
    }

    // 检查是否是猎人卡
    const isHunter = card.type === 'hunter';
    
    // 更新界面
    updateUI();

    // 处理失控·001效果：当失控·001被消除时，该玩家获得一个额外的攻击回合
    if (isHunter) {
        gameState.gameLog.push(`${targetPlayer.name}的失控·001被消除，获得一个额外的攻击回合！`);
        
        // 显示失控·001效果信息，不显示玩家二卡牌的具体信息
        if (targetPlayer.id === 1) {
            // 玩家一失控·001被消除，显示具体信息
            showInteractionMessage(`${targetPlayer.name}的失控·001被消除，获得一个额外的攻击回合！`);
        } else {
            // 玩家二失控·001被消除，不显示具体信息
            showInteractionMessage(targetPlayer.name + '获得一个额外的攻击回合！');
        }
        // 保存当前游戏状态
        const originalRoundPhase = gameState.roundPhase;
        const originalCurrentPlayer = gameState.currentPlayer;
        const originalCurrentPhase = gameState.currentPhase;
        
        // 设置为猎人的攻击回合
        gameState.currentPlayer = targetPlayer.id - 1;
        gameState.currentPhase = 'attack';
        
        // 等待一下再执行猎人的攻击回合
        setTimeout(() => {
            if (gameState.currentPlayer === 0) {
                // 玩家1的攻击回合，正常进行（用状态位，勿依赖回合文案——updateUI 会重绑点击）
                gameState.hunterBonusAttack = true;
                document.getElementById('current-turn').textContent = `当前回合：玩家1 (失控·001攻击回合)`;
                updateUI();
            } else {
                // 玩家2的攻击回合，AI自动行动
                document.getElementById('current-turn').textContent = `当前回合：玩家2 (失控·001攻击回合)`;
                updateUI();
                setTimeout(() => {
                    hunterAI();
                    
                    // 恢复原游戏状态
                    setTimeout(() => {
                        gameState.roundPhase = originalRoundPhase;
                        gameState.currentPlayer = originalCurrentPlayer;
                        gameState.currentPhase = originalCurrentPhase;
                        document.getElementById('current-turn').textContent = `当前回合：${gameState.players[gameState.currentPlayer].name}`;
                        updateUI();
                        
                        // 检查游戏是否结束
                        checkGameEnd();
                        
                        // 继续原有的回合流程
                        startNextPhase();
                    }, 3000); // 增加延迟时间，确保攻击操作完成
                }, 1000);
            }
        }, 1000);
        return;
    }

    // 处理回合切换
    startNextPhase();
    } finally {
        if (isHunterAttack) gameState.hunterBonusAttack = false;
    }
}

// 确认攻击
function confirmAttack(targetPlayerIndex, cardIndex, isHunterAttack = false) {
    executeAttack(targetPlayerIndex, cardIndex, isHunterAttack);
}

// 取消攻击
function cancelAttack() {
    showInteractionMessage('取消攻击选择！');
    updateUI();
}
