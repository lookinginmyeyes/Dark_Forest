
// 玩家2 AI自动行动（由AI驱动）
async function player2AI() {
    if (gameState.gameEnded) return;

    const player1 = gameState.players[0];
    // 可攻击目标：未消除且未守护
    const availableTargets = [];
    player1.cards.forEach((card, index) => {
        if (!card.eliminated && !card.guarded) availableTargets.push(index);
    });

    if (availableTargets.length === 0) {
        checkGameEnd();
        return;
    }

    showInteractionMessage('文明·智域正在思考进攻策略...');
    const { action, data } = buildAIContext('attack', availableTargets);
    let cardIndex = await callAI(action, data);
    if (cardIndex === null) cardIndex = availableTargets[Math.floor(Math.random() * availableTargets.length)];
    selectCard(0, cardIndex);
}

// 玩家2 AI失控·001攻击行动（失控·001反击，由AI驱动）
async function hunterAI() {
    if (gameState.gameEnded) return;

    // 失控·001反击无视守护，所有未消除卡牌均可选
    const availableTargets = [];
    gameState.players[0].cards.forEach((card, index) => {
        if (!card.eliminated) availableTargets.push(index);
    });

    if (availableTargets.length === 0) {
        checkGameEnd();
        return;
    }

    const { action, data } = buildAIContext('hunter', availableTargets);
    let cardIndex = await callAI(action, data);
    if (cardIndex === null) cardIndex = availableTargets[Math.floor(Math.random() * availableTargets.length)];
    selectCard(0, cardIndex, true);
}

// 检查游戏是否结束
function checkGameEnd() {
    const player1 = gameState.players[0];
    const player2 = gameState.players[1];

    // 计算功能卡（doctor, guard, hunter, prophet）存活数量
    const player1GodCount = player1.cards.filter(c => !c.eliminated && ['doctor', 'guard', 'hunter', 'prophet'].includes(c.type)).length;
    const player2GodCount = player2.cards.filter(c => !c.eliminated && ['doctor', 'guard', 'hunter', 'prophet'].includes(c.type)).length;

    // 检查玩家1是否失去所有某一类卡牌，或失去所有功能卡
    const player1Lost = player1.killerCount === 0 || player1.normalCount === 0 || player1GodCount === 0;
    // 检查玩家2是否失去所有某一类卡牌，或失去所有功能卡
    const player2Lost = player2.killerCount === 0 || player2.normalCount === 0 || player2GodCount === 0;

    // 检查是否平局
    if (player1Lost && player2Lost) {
        gameState.gameEnded = true;
        const resultMessage = document.getElementById('result-message');
        resultMessage.style.display = 'block';
        resultMessage.className = 'result-message win';
        resultMessage.textContent = '平局！双方都失去了某一类卡牌';
        document.getElementById('game-status').textContent = '游戏结束';
        updateUI();
        displayGameLog();
        displayAIThinkingLog();
        return true;
    }

    // 检查玩家1是否失去所有某一类卡牌
    if (player1Lost) {
        gameState.gameEnded = true;
        const resultMessage = document.getElementById('result-message');
        resultMessage.style.display = 'block';
        resultMessage.className = 'result-message lose';
        resultMessage.textContent = '玩家2获胜！';
        document.getElementById('game-status').textContent = '游戏结束';
        updateUI();
        displayGameLog();
        displayAIThinkingLog();
        return true;
    }

    // 检查玩家2是否失去所有某一类卡牌
    if (player2Lost) {
        gameState.gameEnded = true;
        const resultMessage = document.getElementById('result-message');
        resultMessage.style.display = 'block';
        resultMessage.className = 'result-message win';
        resultMessage.textContent = '玩家1获胜！';
        document.getElementById('game-status').textContent = '游戏结束';
        updateUI();
        displayGameLog();
        displayAIThinkingLog();
        return true;
    }

    return false;
}

// 显示AI思考过程日志
function displayAIThinkingLog() {
    // 创建AI思考过程容器
    let aiThinkingContainer = document.getElementById('ai-thinking-container');
    if (!aiThinkingContainer) {
        aiThinkingContainer = document.createElement('div');
        aiThinkingContainer.id = 'ai-thinking-container';
        aiThinkingContainer.style.cssText = `
            position: absolute;
            top: 70px;
            right: 20px;
            width: 300px;
            max-height: 400px;
            background: rgba(26, 26, 46, 0.95);
            border: 1px solid rgba(138, 43, 226, 0.3);
            border-radius: 10px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(aiThinkingContainer);
    }

    // 清空容器
    aiThinkingContainer.innerHTML = '';

    // 添加标题
    const title = document.createElement('h3');
    title.style.cssText = `
        color: #8a2be2;
        margin-bottom: 15px;
        font-size: 16px;
        text-align: center;
    `;
    title.textContent = 'AI思考过程';
    aiThinkingContainer.appendChild(title);

    // 检查是否有思考日志
    if (!gameState.aiThinkingLog || gameState.aiThinkingLog.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = `
            font-size: 13px;
            color: #f0f0f0;
            text-align: center;
            padding: 20px 0;
        `;
        emptyMessage.textContent = '暂无AI思考记录';
        aiThinkingContainer.appendChild(emptyMessage);
        return;
    }

    // 添加思考过程日志
    gameState.aiThinkingLog.forEach((log, index) => {
        const logItem = document.createElement('div');
        logItem.style.cssText = `
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(138, 43, 226, 0.2);
        `;

        // 时间和行动类型
        const timeAction = document.createElement('div');
        timeAction.style.cssText = `
            font-size: 12px;
            color: #8a2be2;
            margin-bottom: 5px;
        `;
        timeAction.textContent = `${log.timestamp} - ${getActionName(log.action)}`;
        logItem.appendChild(timeAction);

        // 思考内容
        const thinking = document.createElement('div');
        thinking.style.cssText = `
            font-size: 13px;
            color: #f0f0f0;
            line-height: 1.4;
            margin-bottom: 5px;
        `;
        thinking.textContent = log.thinking;
        logItem.appendChild(thinking);

        // 决策结果
        const decision = document.createElement('div');
        decision.style.cssText = `
            font-size: 12px;
            color: #4ecdc4;
            font-weight: bold;
        `;
        decision.textContent = `决策：选择卡牌 #${log.cardIndex + 1}`;
        logItem.appendChild(decision);

        aiThinkingContainer.appendChild(logItem);
    });
}

// 获取行动名称
function getActionName(action) {
    const actionNames = {
        attack: '进攻',
        hunter: '失控·001反击',
        defense: '守护',
        prophet: '查验'
    };
    return actionNames[action] || action;
}

// 切换AI思考过程面板显隐
function toggleAIThinkingLog() {
    const panel = document.getElementById('ai-thinking-container');
    if (panel) {
        const opening = panel.style.display === 'none' || panel.style.display === '';
        panel.style.display = opening ? 'block' : 'none';
        if (opening) displayAIThinkingLog();
    } else {
        // 如果面板不存在，创建并显示
        displayAIThinkingLog();
    }
}

