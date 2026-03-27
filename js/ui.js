// 战报面板显隐（index.html 按钮 onclick 依赖全局函数）
function toggleGameLog() {
    const panel = document.getElementById('game-log-panel');
    if (!panel) return;
    const opening = panel.style.display === 'none' || panel.style.display === '';
    panel.style.display = opening ? 'block' : 'none';
    if (opening) displayGameLog();
}

// 取消查验 / 守护时重建界面（不可把 JSON 塞进 onclick，双引号会破坏 HTML）
function cancelProphetSelectionRebuild() {
    const ctx = window.__prophetSelectionCtx;
    if (ctx && ctx.availableCards && ctx.cardNumbers != null) {
        showProphetSelectionUI(ctx.availableCards, ctx.cardNumbers);
    }
}

function cancelGuardSelectionRebuild() {
    const ctx = window.__guardSelectionCtx;
    if (ctx && ctx.availableCards && ctx.cardInfo != null) {
        showGuardSelectionUI(ctx.availableCards, ctx.cardInfo);
    }
}

// 显示游戏记录
function displayGameLog() {
    const gameLogContent = document.getElementById('game-log-content');
    gameLogContent.innerHTML = '';
    
    if (gameState.gameLog.length === 0) {
        gameLogContent.innerHTML = '<p>本次游戏无记录</p>';
        return;
    }
    
    gameState.gameLog.forEach((log, index) => {
        const logElement = document.createElement('p');
        logElement.textContent = `${index + 1}. ${log}`;
        gameLogContent.appendChild(logElement);
    });
}

// 显示预言选择界面
function showProphetSelectionUI(availableCards, cardNumbers) {
    window.__prophetSelectionCtx = { availableCards, cardNumbers };
    const interactionContent = document.getElementById('interaction-content');
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const targetPlayerIndex = gameState.currentPlayer === 0 ? 1 : 0;
    const targetPlayer = gameState.players[targetPlayerIndex];
    
    interactionContent.innerHTML = `
        <p>请点击要查验的卡牌：</p>
        <p>可查验的卡牌：${cardNumbers}</p>
        <p>提示：点击对方玩家的卡牌进行查验</p>
    `;
    
    // 添加卡牌点击事件监听，实现点击查验
    const player2CardsContainer = document.getElementById('player2-cards');
    const player1CardsContainer = document.getElementById('player1-cards');
    const targetCardsContainer = targetPlayerIndex === 1 ? player2CardsContainer : player1CardsContainer;
    const cardElements = targetCardsContainer.querySelectorAll('.card');
    
    // 为可查验的卡牌添加点击事件
    availableCards.forEach(card => {
        const cardIndex = targetPlayer.cards.indexOf(card);
        if (cardElements[cardIndex]) {
            cardElements[cardIndex].addEventListener('click', function handleCardClick() {
                // 移除所有卡牌的点击事件
                cardElements.forEach(el => el.removeEventListener('click', handleCardClick));
                
                // 显示确认查验按钮
                let typeName = '';
                switch(card.type) {
                    case 'killer': typeName = '清除者'; break;
                    case 'doctor': typeName = '重组师'; break;
                    case 'guard': typeName = '护盾官'; break;
                    case 'hunter': typeName = '失控·001'; break;
                    case 'prophet': typeName = '先知'; break;
                    case 'normal': typeName = '研究员'; break;
                }
                
                interactionContent.innerHTML = `
                    <p>确认查验对方的卡牌 #${cardIndex + 1} 吗？</p>
                    <button class="btn btn-primary" onclick="confirmProphetCheck(${cardIndex})">确认查验</button>
                    <button type="button" class="btn btn-secondary" onclick="cancelProphetSelectionRebuild()">取消</button>
                `;
            });
        }
    });
    
    // 为不可查验的卡牌添加点击事件，显示错误提示
    cardElements.forEach((el, index) => {
        const card = targetPlayer.cards[index];
        if (!availableCards.includes(card)) {
            el.addEventListener('click', function handleWrongCardClick() {
                showInteractionMessage('这张卡牌不可查验！');
            });
        }
    });
}

// 确认预言家查验
function confirmProphetCheck(cardIndex) {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const targetPlayerIndex = gameState.currentPlayer === 0 ? 1 : 0;
    const targetPlayer = gameState.players[targetPlayerIndex];
    const card = targetPlayer.cards[cardIndex];
    
    // 执行查验操作
    card.inspected = true;
    
    // 播放技能音效
    playSound('skill-sound');
    
    // 添加游戏记录
    let typeName = '';
    switch(card.type) {
        case 'killer': typeName = '清除者'; break;
        case 'doctor': typeName = '重组师'; break;
        case 'guard': typeName = '护盾官'; break;
        case 'hunter': typeName = '失控·001'; break;
        case 'prophet': typeName = '先知'; break;
        case 'normal': typeName = '研究员'; break;
    }
    gameState.gameLog.push(`${currentPlayer.name}查验了${targetPlayer.name}的卡牌，发现是${typeName}！`);
    
    // 显示查验结果
    if (currentPlayer.id === 1) {
        // 玩家一查验，显示具体信息
        showInteractionMessage(`${currentPlayer.name}查验了${targetPlayer.name}的卡牌，发现是${typeName}！`);
    } else {
        // 玩家二查验，不显示具体信息
        showInteractionMessage(`${currentPlayer.name}查验了${targetPlayer.name}的卡牌！`);
    }
    
    // 更新界面
    updateUI();
    
    // 继续游戏流程
    setTimeout(startNextPhase, 2000);
}

// 确认预言选择
function confirmProphetSelection() {
    const input = document.getElementById('prophet-input');
    const selectedCardNumber = input.value;
    const selectedIndex = parseInt(selectedCardNumber) - 1;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const targetPlayerIndex = gameState.currentPlayer === 0 ? 1 : 0;
    const targetPlayer = gameState.players[targetPlayerIndex];
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= targetPlayer.cards.length) {
        showInteractionMessage('无效的卡牌编号！');
        setTimeout(() => {
            const availableCards = targetPlayer.cards.filter(c => !c.eliminated && !c.inspected);
            const cardNumbers = availableCards.map(c => targetPlayer.cards.indexOf(c) + 1).join(', ');
            showProphetSelectionUI(availableCards, cardNumbers);
        }, 2000);
        return;
    }

    const selectedCard = targetPlayer.cards[selectedIndex];
    if (selectedCard.eliminated || selectedCard.inspected) {
        showInteractionMessage('无法查验这张卡牌！');
        setTimeout(() => {
            const availableCards = targetPlayer.cards.filter(c => !c.eliminated && !c.inspected);
            const cardNumbers = availableCards.map(c => targetPlayer.cards.indexOf(c) + 1).join(', ');
            showProphetSelectionUI(availableCards, cardNumbers);
        }, 2000);
        return;
    }

    // 设置查验状态
    selectedCard.inspected = true;
    
    // 添加游戏记录
    let typeName = '';
    switch(selectedCard.type) {
        case 'killer': typeName = '清除者'; break;
        case 'doctor': typeName = '重组师'; break;
        case 'guard': typeName = '护盾官'; break;
        case 'hunter': typeName = '失控·001'; break;
        case 'prophet': typeName = '先知'; break;
        case 'normal': typeName = '研究员'; break;
    }
    gameState.gameLog.push(`${currentPlayer.name}查验了${targetPlayer.name}的卡牌 #${selectedIndex + 1}，发现是 ${typeName}！`);
    
    showInteractionMessage('成功查验卡牌 #' + (selectedIndex + 1) + '，发现是 ' + typeName + '！');
    updateUI();
    setTimeout(() => {
        startNextPhase();
    }, 2000);
}

// 取消预言选择
function cancelProphetSelection() {
    showInteractionMessage('取消预言选择！');
    setTimeout(() => {
        startNextPhase();
    }, 2000);
}

// 显示重组师使用选择界面
function showDoctorSelectionUI(cardIndex) {
    const interactionContent = document.getElementById('interaction-content');
    const attackingPlayerIndex = gameState.currentPlayer;
    const targetPlayerIndex = gameState.players.length - 1 - gameState.currentPlayer;
    
    interactionContent.innerHTML = `
        <p>对方要消除你的卡牌 #${cardIndex + 1}！</p>
        <p>是否使用重组师抵消这次消除？</p>
        <button class="btn btn-primary" onclick="confirmDoctorUse(${attackingPlayerIndex}, ${targetPlayerIndex}, ${cardIndex})">使用重组师</button>
        <button class="btn btn-secondary" onclick="cancelDoctorUse(${attackingPlayerIndex}, ${targetPlayerIndex}, ${cardIndex})">不使用</button>
    `;
}

// 确认使用重组师
function confirmDoctorUse(attackingPlayerIndex, targetPlayerIndex, cardIndex) {
    const attackingPlayer = gameState.players[attackingPlayerIndex];
    const targetPlayer = gameState.players[targetPlayerIndex];
    const card = targetPlayer.cards[cardIndex];
    const doctorCard = targetPlayer.cards.find(c => c.type === 'doctor' && !c.eliminated && !c.used);
    
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
    
    showInteractionMessage(targetPlayer.name + '使用了重组师抵消了对卡牌 #' + (cardIndex + 1) + '的消除！');
    updateUI();
    setTimeout(() => {
        startNextPhase();
    }, 2000);
}

// 取消使用重组师
function cancelDoctorUse(attackingPlayerIndex, targetPlayerIndex, cardIndex) {
    const attackingPlayer = gameState.players[attackingPlayerIndex];
    const targetPlayer = gameState.players[targetPlayerIndex];
    const card = targetPlayer.cards[cardIndex];
    
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
    gameState.gameLog.push(`${attackingPlayer.name}消除了${targetPlayer.name}的卡牌 #${cardIndex + 1} (${typeName})！`);

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
        gameState.currentPlayer = targetPlayerIndex;
        gameState.currentPhase = 'attack';
        if (targetPlayerIndex === 0) gameState.hunterBonusAttack = true;
        document.getElementById('current-turn').textContent = `当前回合：${targetPlayer.name} (猎人攻击回合)`;
        updateUI();
        
        // 猎人攻击回合
        setTimeout(() => {
            if (targetPlayerIndex === 0) {
                // 玩家一的猎人攻击回合，让玩家选择要攻击的卡牌
                // 猎人攻击已经在卡牌点击事件中处理
            } else {
                // 玩家二的猎人攻击回合，AI自动选择要攻击的卡牌
                setTimeout(() => {
                    hunterAI();
                    
                    // 猎人攻击回合结束后，恢复原游戏状态
                    setTimeout(() => {
                        gameState.roundPhase = originalRoundPhase;
                        gameState.currentPlayer = originalCurrentPlayer;
                        gameState.currentPhase = originalCurrentPhase;
                        document.getElementById('current-turn').textContent = `当前回合：${gameState.players[originalCurrentPlayer].name}`;
                        updateUI();
                        
                        // 检查游戏是否结束
                        checkGameEnd();
                        
                        // 继续原有的回合流程
                        startNextPhase();
                    }, 3000); // 增加延迟时间，确保攻击操作完成
                }, 1000);
            }
        }, 1000);
    } else {
        // 检查游戏是否结束
        if (checkGameEnd()) {
            return;
        }
        
        // 处理回合切换
        startNextPhase();
    }
}

// 开始预言回合
function startProphetPhase() {
    if (gameState.gameEnded) return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    const targetPlayerIndex = gameState.currentPlayer === 0 ? 1 : 0;
    const targetPlayer = gameState.players[targetPlayerIndex];

    // 检查当前玩家是否有未被消除的先知
    const prophetCard = currentPlayer.cards.find(c => c.type === 'prophet' && !c.eliminated);

    if (prophetCard) {
        // 获取对方未被消除且未被查验的卡牌
        const availableCards = targetPlayer.cards.filter(c => !c.eliminated && !c.inspected);

        if (availableCards.length === 0) {
            // 没有可查验的卡牌
            if (gameState.currentPlayer === 0) {
                showInteractionMessage('对方没有可查验的卡牌！');
                setTimeout(() => {
                    startNextPhase();
                }, 2000);
            } else {
                console.log(currentPlayer.name + '没有可查验的卡牌！');
                startNextPhase();
            }
            return;
        }

        if (gameState.currentPlayer === 0) {
            // 玩家1的预言回合，让玩家选择要查验的卡牌
            const cardNumbers = availableCards.map(c => targetPlayer.cards.indexOf(c) + 1).join(', ');
            showProphetSelectionUI(availableCards, cardNumbers);
        } else {
            // 玩家2的预言回合，由AI决策
            (async () => {
                const availableTargets = availableCards.map(c => targetPlayer.cards.indexOf(c));
                const { action, data } = buildAIContext('prophet', availableTargets);
                let cardIndex = await callAI(action, data);
                if (cardIndex === null) cardIndex = availableTargets[Math.floor(Math.random() * availableTargets.length)];

                const selectedCard = targetPlayer.cards[cardIndex];
                selectedCard.inspected = true;

                const typeNames = { killer:'清除者', doctor:'重组师', guard:'护盾官', hunter:'失控·001', prophet:'先知', normal:'研究员' };
                const typeName = typeNames[selectedCard.type] || selectedCard.type;
                gameState.gameLog.push(`${currentPlayer.name}查验了${targetPlayer.name}的卡牌 #${cardIndex + 1}，发现是 ${typeName}！`);
                console.log(`${currentPlayer.name}查验了卡牌 #${cardIndex + 1}，发现是 ${typeName}！`);
                updateUI();
                startNextPhase();
            })();
        }
    } else {
        // 没有先知，跳过预言回合
        if (gameState.currentPlayer === 0) {
            showInteractionMessage('你没有先知，跳过预言回合！');
            setTimeout(() => {
                startNextPhase();
            }, 2000);
        } else {
            console.log(currentPlayer.name + '没有先知，跳过预言回合！');
            startNextPhase();
        }
    }
}

// 开始防守回合
function startDefensePhase() {
    if (gameState.gameEnded) return;

    const currentPlayer = gameState.players[gameState.currentPlayer];

    // 检查当前玩家是否有未被消除的守卫牌
    const guardCard = currentPlayer.cards.find(c => c.type === 'guard' && !c.eliminated);

    if (guardCard) {
        if (gameState.currentPlayer === 0) {
            // 玩家一的防守回合，让玩家选择要守护的卡牌
            selectGuardTarget();
        } else {
            // 玩家二的防守回合，AI自动选择要守护的卡牌
            // AI逻辑：优先守护杀手卡
            setTimeout(aiSelectGuardTarget, 1000);
        }
    } else {
        // 没有守卫牌，跳过防守回合
        if (gameState.currentPlayer === 0) {
            // 只有玩家一的信息才显示交互面板
            showInteractionMessage(currentPlayer.name + '没有守卫牌，跳过防守回合！');
            setTimeout(() => {
                startNextPhase();
            }, 2000);
        } else {
            // 玩家二的信息只在控制台输出，不显示给玩家一
            console.log(currentPlayer.name + '没有守卫牌，跳过防守回合！');
            startNextPhase();
        }
    }
}

// 显示交互面板消息
function showInteractionMessage(message) {
    const interactionContent = document.getElementById('interaction-content');
    interactionContent.innerHTML = `<p>${message}</p>`;
    
    // 添加标红闪烁效果
    interactionContent.style.color = 'red';
    interactionContent.style.animation = 'blink 1s ease-in-out 3';
    
    // 3秒后恢复默认颜色
    setTimeout(() => {
        interactionContent.style.color = '';
        interactionContent.style.animation = '';
    }, 3000);
}

// 显示守护选择界面
function showGuardSelectionUI(availableCards, cardInfo) {
    window.__guardSelectionCtx = { availableCards, cardInfo };
    const interactionContent = document.getElementById('interaction-content');
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    interactionContent.innerHTML = `
        <p>请点击要守护的卡牌</p>
    `;
    
    // 添加卡牌点击事件监听，实现点击守护
    const player1CardsContainer = document.getElementById('player1-cards');
    const player2CardsContainer = document.getElementById('player2-cards');
    const targetCardsContainer = currentPlayer.id === 1 ? player1CardsContainer : player2CardsContainer;
    const cardElements = targetCardsContainer.querySelectorAll('.card');
    
    // 为可守护的卡牌添加点击事件
    availableCards.forEach(card => {
        const cardIndex = currentPlayer.cards.indexOf(card);
        if (cardElements[cardIndex]) {
            cardElements[cardIndex].addEventListener('click', function() {
                // 移除所有卡牌的点击事件
                cardElements.forEach(el => el.removeEventListener('click', arguments.callee));
                
                // 显示确认守护按钮
                interactionContent.innerHTML = `
                    <p>确认守护自己的卡牌 #${cardIndex + 1} 吗？</p>
                    <button class="btn btn-primary" onclick="confirmGuardCheck(${cardIndex})">确认守护</button>
                    <button type="button" class="btn btn-secondary" onclick="cancelGuardSelection()">取消</button>
                `;
            });
        }
    });
    
    // 为不可守护的卡牌添加点击事件，显示错误提示
    cardElements.forEach((el, index) => {
        const card = currentPlayer.cards[index];
        if (!availableCards.includes(card)) {
            el.addEventListener('click', function() {
                showInteractionMessage('这张卡牌不可守护！');
                // 重新添加可守护卡牌的点击事件，确保可以被打断
                availableCards.forEach(card => {
                    const cardIndex = currentPlayer.cards.indexOf(card);
                    if (cardElements[cardIndex]) {
                        // 重新添加点击事件
                        cardElements[cardIndex].addEventListener('click', function() {
                            // 移除所有卡牌的点击事件
                            cardElements.forEach(el => el.removeEventListener('click', arguments.callee));
                            
                            // 显示确认守护按钮
                            interactionContent.innerHTML = `
                                <p>确认守护自己的卡牌 #${cardIndex + 1} 吗？</p>
                                <button class="btn btn-primary" onclick="confirmGuardCheck(${cardIndex})">确认守护</button>
                                <button type="button" class="btn btn-secondary" onclick="cancelGuardSelection()">取消</button>
                            `;
                        });
                    }
                });
            });
        }
    });
}

// 确认守卫守护
function confirmGuardCheck(cardIndex) {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const card = currentPlayer.cards[cardIndex];
    
    // 执行守护操作
    card.guarded = true;
    currentPlayer.lastGuardedIndex = cardIndex;
    
    // 播放守护音效
    playSound('guard-sound');
    
    // 添加游戏记录
    let typeName = '';
    switch(card.type) {
        case 'killer': typeName = '清除者'; break;
        case 'doctor': typeName = '重组师'; break;
        case 'hunter': typeName = '失控·001'; break;
        case 'prophet': typeName = '先知'; break;
        case 'normal': typeName = '研究员'; break;
    }
    gameState.gameLog.push(`${currentPlayer.name}守护了自己的卡牌 #${cardIndex + 1} (${typeName})！`);
    
    // 显示守护结果
    showInteractionMessage(`${currentPlayer.name}守护了自己的卡牌 #${cardIndex + 1} (${typeName})！`);
    
    // 更新界面
    updateUI();
    
    // 继续游戏流程
    setTimeout(startNextPhase, 2000);
}

// 确认守护选择
function confirmGuardSelection() {
    const input = document.getElementById('guard-input');
    const selectedCardNumber = input.value;
    const selectedIndex = parseInt(selectedCardNumber) - 1;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= currentPlayer.cards.length) {
        showInteractionMessage('无效的卡牌编号！');
        setTimeout(() => {
            const availableCards = currentPlayer.cards.filter((c, index) => 
                !c.eliminated && c.type !== 'guard' && index !== currentPlayer.lastGuardedIndex
            );
            const cardInfo = availableCards.map(c => {
                const index = currentPlayer.cards.indexOf(c) + 1;
                let typeName = '';
                switch(c.type) {
                    case 'killer': typeName = '清除者'; break;
                    case 'doctor': typeName = '重组师'; break;
                    case 'hunter': typeName = '失控·001'; break;
                    case 'prophet': typeName = '先知'; break;
                    case 'normal': typeName = '研究员'; break;
                }
                return `#${index}(${typeName})`;
            }).join(', ');
            showGuardSelectionUI(availableCards, cardInfo);
        }, 2000);
        return;
    }

    const selectedCard = currentPlayer.cards[selectedIndex];
    if (selectedCard.eliminated || selectedCard.type === 'guard' || selectedIndex === currentPlayer.lastGuardedIndex) {
        showInteractionMessage('无法守护这张卡牌！');
        setTimeout(() => {
            const availableCards = currentPlayer.cards.filter((c, index) => 
                !c.eliminated && c.type !== 'guard' && index !== currentPlayer.lastGuardedIndex
            );
            const cardInfo = availableCards.map(c => {
                const index = currentPlayer.cards.indexOf(c) + 1;
                let typeName = '';
                switch(c.type) {
                    case 'killer': typeName = '清除者'; break;
                    case 'doctor': typeName = '重组师'; break;
                    case 'hunter': typeName = '失控·001'; break;
                    case 'prophet': typeName = '先知'; break;
                    case 'normal': typeName = '研究员'; break;
                }
                return `#${index}(${typeName})`;
            }).join(', ');
            showGuardSelectionUI(availableCards, cardInfo);
        }, 2000);
        return;
    }

    // 重置所有卡牌的守护状态
    currentPlayer.cards.forEach(c => c.guarded = false);
    
    // 设置守护状态
    selectedCard.guarded = true;
    // 记录本次守护的卡牌索引
    currentPlayer.lastGuardedIndex = selectedIndex;
    
    // 添加游戏记录
    let typeName = '';
    switch(selectedCard.type) {
        case 'killer': typeName = '清除者'; break;
        case 'doctor': typeName = '重组师'; break;
        case 'hunter': typeName = '失控·001'; break;
        case 'prophet': typeName = '先知'; break;
        case 'normal': typeName = '研究员'; break;
    }
    gameState.gameLog.push(`${currentPlayer.name}守护了卡牌 #${selectedIndex + 1} (${typeName})`);
    
    showInteractionMessage('成功守护卡牌 #' + (selectedIndex + 1) + '！');
    updateUI();
    setTimeout(() => {
        startNextPhase();
    }, 2000);
}

// 取消守护选择
function cancelGuardSelection() {
    showInteractionMessage('取消守护选择！');
    setTimeout(() => {
        startNextPhase();
    }, 2000);
}

// 玩家选择守护目标
function selectGuardTarget() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    // 过滤出可守护的卡牌，排除上一次守护的卡牌
    const availableCards = currentPlayer.cards.filter((c, index) => 
        !c.eliminated && c.type !== 'guard' && index !== currentPlayer.lastGuardedIndex
    );

    if (availableCards.length === 0) {
        // 如果没有其他可守护的卡牌（除了上一次守护的），这回合失去守护能力
        showInteractionMessage('没有其他可守护的卡牌，这回合失去守护能力！');
        setTimeout(() => {
            startNextPhase();
        }, 2000);
        return;
    }

    // 让玩家选择要守护的卡牌，显示卡牌身份信息
    const cardInfo = availableCards.map(c => {
        const index = currentPlayer.cards.indexOf(c) + 1;
        let typeName = '';
        switch(c.type) {
            case 'killer': typeName = '清除者'; break;
            case 'doctor': typeName = '重组师'; break;
            case 'hunter': typeName = '失控·001'; break;
            case 'prophet': typeName = '先知'; break;
            case 'normal': typeName = '研究员'; break;
        }
        return `#${index}(${typeName})`;
    }).join(', ');

    showGuardSelectionUI(availableCards, cardInfo);
}

// AI选择守护目标（由AI驱动）
async function aiSelectGuardTarget() {
    const currentPlayer = gameState.players[gameState.currentPlayer];

    // 可守护目标：未消除且非上一回合守护过的，且不是护盾官自己
    const availableTargets = [];
    currentPlayer.cards.forEach((card, index) => {
        if (!card.eliminated && index !== currentPlayer.lastGuardedIndex && card.type !== 'guard') {
            availableTargets.push(index);
        }
    });

    if (availableTargets.length === 0) {
        gameState.gameLog.push(`${currentPlayer.name}没有其他可守护的卡牌，这回合失去守护能力！`);
        console.log(currentPlayer.name + '没有其他可守护的卡牌，这回合失去守护能力！');
        setTimeout(startNextPhase, 1000);
        return;
    }

    const { action, data } = buildAIContext('defense', availableTargets, { lastProtectedIndex: currentPlayer.lastGuardedIndex });
    let cardIndex = await callAI(action, data);
    if (cardIndex === null) cardIndex = availableTargets[Math.floor(Math.random() * availableTargets.length)];

    const targetCard = currentPlayer.cards[cardIndex];
    currentPlayer.cards.forEach(c => c.guarded = false);
    targetCard.guarded = true;
    currentPlayer.lastGuardedIndex = cardIndex;

    const typeNames = { killer:'清除者', doctor:'重组师', guard:'护盾官', hunter:'失控·001', prophet:'先知', normal:'研究员' };
    const typeName = typeNames[targetCard.type] || targetCard.type;
    gameState.gameLog.push(`${currentPlayer.name}守护了卡牌 #${cardIndex + 1} (${typeName})`);
    console.log(`${currentPlayer.name}守护了卡牌 #${cardIndex + 1}！`);
    updateUI();

    setTimeout(startNextPhase, 1000);
}

// 切换AI模式
function toggleAIMode() {
    gameState.aiMode = gameState.aiMode === 'normal' ? 'fast' : 'normal';
    const button = document.getElementById('toggle-ai-mode');
    // 按钮文案显示“当前模式”，而不是“下一次点击要切到的模式”
    const modeLabel = gameState.aiMode === 'normal' ? '推理模式' : '极速模式';
    button.textContent = modeLabel;
    showInteractionMessage(`AI模式已切换为${modeLabel}！`);
}

