// 调用文明·智域AI服务
async function callAI(action, data) {
    try {
        const response = await fetch('/api/ai-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data, mode: gameState.aiMode })
        });
        const result = await response.json();
        
        // 存储AI思考过程
        if (result.thinking) {
            gameState.aiThinkingLog = gameState.aiThinkingLog || [];
            gameState.aiThinkingLog.push({
                action,
                timestamp: new Date().toLocaleString(),
                thinking: result.thinking,
                cardIndex: result.cardIndex
            });
        }
        
        return result.cardIndex;
    } catch (err) {
        console.warn('AI服务调用失败，使用随机兜底:', err);
        // 即使调用失败，也添加一个思考记录
        gameState.aiThinkingLog = gameState.aiThinkingLog || [];
        gameState.aiThinkingLog.push({
            action,
            timestamp: new Date().toLocaleString(),
            thinking: 'AI决策无效，使用随机兜底策略',
            cardIndex: null
        });
        return null; // 调用方处理null时用随机兜底
    }
}

// 构建游戏状态上下文（供所有AI决策使用）
function buildAIContext(action, availableTargets, extraData = {}) {
    const p1 = gameState.players[0];
    const p2 = gameState.players[1];

    const myCards = p2.cards.map((c, i) => ({
        index: i,
        type: c.type,
        eliminated: c.eliminated,
        guarded: c.guarded,
        inspected: !!c.inspected  // 是否被对方查验过
    }));

    const opponentCards = p1.cards.map((c, i) => ({
        index: i,
        type: c.inspected ? c.type : 'unknown',
        eliminated: c.eliminated,
        guarded: c.guarded,
        inspected: !!c.inspected,
        protected: p1.protectedCards.includes(i) // 记录是否被保护过（攻击被抵消）
    }));

    const myStats = {
        killerCount: p2.cards.filter(c => !c.eliminated && c.type === 'killer').length,
        normalCount: p2.cards.filter(c => !c.eliminated && c.type === 'normal').length,
        godCount:    p2.cards.filter(c => !c.eliminated && ['doctor','guard','hunter','prophet'].includes(c.type)).length
    };

    const opponentStats = {
        aliveCount: p1.cards.filter(c => !c.eliminated).length
    };

    return {
        action,
        data: {
            myCards,
            opponentCards,
            availableTargets,
            myStats,
            opponentStats,
            ...extraData
        }
    };
}
