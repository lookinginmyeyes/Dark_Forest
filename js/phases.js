// 开始攻击回合
function startAttackPhase() {
    if (gameState.gameEnded) return;

    gameState.currentPhase = 'attack';
    const currentPlayer = gameState.players[gameState.currentPlayer];
    document.getElementById('current-turn').textContent = `当前回合：${currentPlayer.name} (攻击回合)`;
    updateUI();
}

// 开始下一个阶段
function startNextPhase() {
    if (gameState.gameEnded) return;

    // 检查是否完成一个大回合
    if (gameState.roundPhase > 6) {
        // 大回合结束，检查游戏是否结束
        if (!checkGameEnd()) {
            // 游戏未结束，开始新的大回合
            gameState.roundPhase = 1;
            gameState.roundNumber = (gameState.roundNumber || 1) + 1;
            // 重置所有卡牌的守护状态
            gameState.players.forEach(player => {
                player.cards.forEach(card => {
                    card.guarded = false;
                });
            });
            updateUI();
            // 开始新的大回合
            startNextPhase();
        }
        return;
    }

    // 保存当前阶段
    const currentPhase = gameState.roundPhase;
    
    // 进入下一个阶段
    gameState.roundPhase++;

    // 根据当前阶段设置玩家和回合类型
    switch (currentPhase) {
        case 1:
            // 玩家1预言
            gameState.currentPlayer = 0;
            gameState.currentPhase = 'prophet';
            document.getElementById('current-turn').textContent = `当前回合：玩家1 (预言回合)`;
            updateUI();
            startProphetPhase();
            break;
        case 2:
            // 玩家2预言
            gameState.currentPlayer = 1;
            gameState.currentPhase = 'prophet';
            document.getElementById('current-turn').textContent = `当前回合：玩家2 (预言回合)`;
            updateUI();
            setTimeout(startProphetPhase, 1000);
            break;
        case 3:
            // 玩家1防守
            gameState.currentPlayer = 0;
            gameState.currentPhase = 'defense';
            document.getElementById('current-turn').textContent = `当前回合：玩家1 (防守回合)`;
            updateUI();
            startDefensePhase();
            break;
        case 4:
            // 玩家2防守
            gameState.currentPlayer = 1;
            gameState.currentPhase = 'defense';
            document.getElementById('current-turn').textContent = `当前回合：玩家2 (防守回合)`;
            updateUI();
            setTimeout(startDefensePhase, 1000);
            break;
        case 5:
            // 玩家1进攻
            // 检查是否已经完成了预言和防守回合
            const player1 = gameState.players[0];
            const hasProphet1 = player1.cards.some(c => c.type === 'prophet' && !c.eliminated);
            const hasGuard1 = player1.cards.some(c => c.type === 'guard' && !c.eliminated);
            
            // 如果有先知且预言回合尚未完成，或者有守卫牌且防守回合尚未完成，则继续当前流程
            if ((hasProphet1 && currentPhase < 3) || (hasGuard1 && currentPhase < 4)) {
                // 还没有完成所有必要的回合，继续当前流程
                gameState.roundPhase = currentPhase;
                startNextPhase();
                return;
            }
            
            gameState.currentPlayer = 0;
            gameState.currentPhase = 'attack';
            gameState.hunterBonusAttack = false;
            document.getElementById('current-turn').textContent = `当前回合：玩家1 (进攻回合)`;
            updateUI();
            // 显示攻击回合提示
            showInteractionMessage('现在是玩家1的攻击回合，请选择要攻击的玩家2卡牌！');
            break;
        case 6:
            // 玩家2进攻
            // 检查是否已经完成了预言和防守回合
            const player2 = gameState.players[1];
            const hasProphet2 = player2.cards.some(c => c.type === 'prophet' && !c.eliminated);
            const hasGuard2 = player2.cards.some(c => c.type === 'guard' && !c.eliminated);
            
            // 如果有先知且预言回合尚未完成，或者有守卫牌且防守回合尚未完成，则继续当前流程
            if ((hasProphet2 && currentPhase < 3) || (hasGuard2 && currentPhase < 5)) {
                // 还没有完成所有必要的回合，继续当前流程
                gameState.roundPhase = currentPhase;
                startNextPhase();
                return;
            }
            
            gameState.currentPlayer = 1;
            gameState.currentPhase = 'attack';
            gameState.hunterBonusAttack = false;
            document.getElementById('current-turn').textContent = `当前回合：玩家2 (进攻回合)`;
            updateUI();
            setTimeout(player2AI, 1000);
            break;
    }
}

// 结束游戏
function endGame() {
    // 此函数已被整合到checkGameEnd中
}

