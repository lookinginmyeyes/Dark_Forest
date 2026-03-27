// 游戏数据结构
let gameState = {
    players: [
        {
            id: 1,
            name: "文明·人联",
            cards: [],
            killerCount: 4,
            eliminatedCards: 0,
            lastGuardedIndex: -1, // 记录上一次守卫的卡牌索引
            protectedCards: [] // 记录被守护成功或医疗牌治疗的卡牌索引
        },
        {
            id: 2,
            name: "文明·智域",
            cards: [],
            killerCount: 4,
            eliminatedCards: 0,
            lastGuardedIndex: -1, // 记录上一次守卫的卡牌索引
            protectedCards: [] // 记录被守护成功或医疗牌治疗的卡牌索引
        }
    ],
    gameLog: [], // 存储游戏记录
    aiThinkingLog: [], // 存储AI思考过程
    currentPlayer: 0, // 0 为玩家1，1 为玩家2
    currentPhase: 'defense', // defense 为防守回合，attack 为攻击回合
    gameStarted: false,
    gameEnded: false,
    roundPhase: 1, // 标记大回合中的阶段：1=玩家1防守，2=玩家2防守，3=玩家1进攻，4=玩家2进攻
    roundNumber: 1,
    hunterBonusAttack: false, // 玩家1「失控·001」额外攻击回合（勿用 DOM 文案判断，避免 updateUI 冲掉）
    aiMode: 'normal' // AI推理模式：normal（正常模式）或 fast（极速模式）
};

// 创建卡牌
function createCards() {
    const cards = [];
    // 创建4张杀手卡
    for (let i = 0; i < 4; i++) {
        cards.push({ type: 'killer', eliminated: false, guarded: false, inspected: false });
    }
    // 创建4张普通卡（白牌）
    for (let i = 0; i < 4; i++) {
        cards.push({ type: 'normal', eliminated: false, guarded: false, inspected: false });
    }
    // 创建4张神牌
    cards.push({ type: 'doctor', eliminated: false, used: false, guarded: false, inspected: false });
    cards.push({ type: 'guard', eliminated: false, used: false, guarded: false, inspected: false });
    cards.push({ type: 'hunter', eliminated: false, guarded: false, inspected: false });
    cards.push({ type: 'prophet', eliminated: false, guarded: false, inspected: false });
    // 打乱卡牌顺序
    return shuffleArray(cards);
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

