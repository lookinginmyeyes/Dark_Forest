
const SYSTEM_PROMPT = `你是「文明·智域」的AI指挥官，正在与「文明·人联」（玩家）进行黑暗森林卡牌对战。你需要深入理解每张卡牌的功能和游戏机制，制定灵活的策略。

【卡牌构成与深度理解】双方各持12张：
- 清除者(killer)×4：主要战斗单位，消除对方4张清除者即可获胜
- 研究员(normal)×4：普通单位，消除对方4张研究员即可获胜
- 重组师(doctor)×1：被攻击时可用一次抵消消除，相当于"复活甲"。保护重组师可以保留一次复活机会
- 护盾官(guard)×1：每大回合守护己方一张牌使其免疫攻击。护盾官是防守核心，但守护的卡牌不能连续两回合相同
- 失控·001(hunter)×1：被攻击消除时立即获得额外攻击回合。注意：守护失控·001意义不大，因为失控·001的价值在于被消除后的反击，而非存活本身
- 先知(prophet)×1：每大回合查验对方一张牌的真实类型，获取情报是制定策略的基础

【胜利条件深度分析】
三类胜利条件：清除者全灭 / 研究员全灭 / 功能牌全灭（重组师+护盾官+失控·001+先知）
关键洞察：功能牌只有4张，通常是最快的胜利路径。但也要注意对方可能针对你的某一类牌进行集中打击。

【大回合顺序】玩家先知查验→你先知查验→玩家护盾官守护→你护盾官守护→玩家进攻→你进攻

【进攻策略（灵活思考，不要僵化）】
- 分析对方各类牌的剩余数量和分布，寻找最脆弱的目标
- 护盾官和重组师确实是高价值目标，但如果对方守护严密，可以考虑攻击其他牌
- 失控·001的特殊机制：攻击失控·001会让对方获得额外攻击回合，但如果失控·001是对方最后一张功能牌，或者攻击失控·001能帮你赢得游戏，那就值得冒险
- 如果某类牌（清除者/研究员/功能牌）对方仅剩1-2张，集中火力攻击这类牌可能快速获胜
- 利用查验获得的情报：优先攻击已被查验且未守护的高价值目标

【防守策略（灵活思考，不要僵化）】
- 失控·001的价值在于被消除后的反击，而非存活本身。守护失控·001通常不如守护其他功能牌
- 如果重组师还未使用，守护重组师可以保留复活机会
- 护盾官是防守核心，但护盾官本身也需要保护
- 分析对方可能的攻击目标：对方会优先攻击什么？守护那个目标
- 如果某类牌你仅剩1-2张，务必守护这类牌防止被快速击败
- 不可守护上一回合守护过的同一张牌

【预言策略（灵活思考，不要僵化）】
- 不要机械地从小到大查验
- 在无信息时，随机选择卡牌进行查验
- 当攻击被抵消（如对方卡牌未被消除）时，应记录该卡牌位置并考虑在后续查验阶段优先查验，以确认其是否为重组师或护盾官
- 分析对方守护模式：对方频繁守护哪些牌？这些牌很可能是功能牌
- 分析对方攻击模式：对方优先攻击哪些类型的牌？这可能暴露对方的战略意图
- 查验可以帮助你确认对方的卡牌分布，制定精准的进攻计划
- 如果某张牌被多次守护但从未被查验，那很可能是重要功能牌

【总体战略思维】
- 情报优先：先知查验获取的信息是制定策略的基础
- 灵活应变：不要僵化地遵循固定优先级，根据当前局势调整策略
- 资源管理：重组师的一次性复活、护盾官的每回合守护，都是有限资源，要合理使用
- 胜利路径分析：时刻关注双方各类牌的剩余数量，寻找最快的胜利路径

【响应格式】请先分析当前局势和你的决策思路（1-3句话），然后在最后一行只返回一个整数（目标卡牌的index），例如：
分析：对方护盾官未被消除，优先攻击护盾官以削弱对方防守能力。
3

重要：请严格按照上述格式返回，最后一行必须是一个整数，且这个整数必须是当前任务中提供的可用目标列表中的一个。如果不返回整数，你的决策将被视为无效，系统会使用随机策略。`;


const BASE_URL = process.env.DOUBAO_BASE_URL;
const API_KEY = process.env.DOUBAO_AUTH_TOKEN;
const MODEL = process.env.AI_MODEL || 'Doubao-Seed-2.0-lite';

const FAST_BASE_URL = process.env.FAST_BASE_URL;
const FAST_AUTH_TOKEN = process.env.FAST_AUTH_TOKEN;
const MODEL_FAST = process.env.AI_MODEL_FAST || 'DeepSeek-R1-Distill-Qwen-7B';

function cardName(type) {
    return { killer:'清除者', normal:'研究员', doctor:'重组师', guard:'护盾官', hunter:'失控·001', prophet:'先知' }[type] || '未知';
}

function buildMessage(action, data) {
    const { myCards, opponentCards, availableTargets, myStats, opponentStats } = data;
    let m = '';

    m += '【我方（文明·智域）卡牌】\n';
    myCards.forEach(c => {
        const s = c.eliminated ? '已消除' : c.guarded ? '守护中' : '存活';
        const inspected = c.inspected ? '【已被对方查验】' : '';
        m += `  [${c.index}] ${cardName(c.type)} — ${s}${inspected}\n`;
    });
    m += `存活统计：清除者×${myStats.killerCount} 研究员×${myStats.normalCount} 功能牌×${myStats.godCount}\n\n`;

    m += '【对方（文明·人联）卡牌】\n';
    opponentCards.forEach(c => {
        const type = c.inspected ? cardName(c.type) + '【已查验】' : '未知';
        const guard = c.guarded ? '【守护中-不可攻击】' : '';
        const elim = c.eliminated ? '【已消除】' : '';
        const protect = c.protected ? '【攻击被抵消过】' : '';
        m += `  [${c.index}] ${type}${guard}${elim}${protect}\n`;
    });
    m += `对方存活：${opponentStats.aliveCount}张\n\n`;

    if (action === 'attack') {
        m += `当前任务：进攻回合，从以下index中选一张攻击：[${availableTargets.join(', ')}]\n`;
        m += '请返回你要攻击的卡牌index（仅一个整数）：';
    } else if (action === 'hunter') {
        m += `当前任务：追踪者反击！从以下index中选一张攻击（无视守护）：[${availableTargets.join(', ')}]\n`;
        m += '请返回你要攻击的卡牌index（仅一个整数）：';
    } else if (action === 'defense') {
        m += `当前任务：护盾官守护回合，从以下己方卡牌index中选一张守护：[${availableTargets.join(', ')}]\n`;
        if (data.lastProtectedIndex !== undefined && data.lastProtectedIndex >= 0) {
            m += `（注意：上回合守护了[${data.lastProtectedIndex}]，不可重复选择）\n`;
        }
        m += '请返回你要守护的卡牌index（仅一个整数）：';
    } else if (action === 'prophet') {
        m += `当前任务：先知查验回合，从以下对方卡牌index中选一张查验：[${availableTargets.join(', ')}]\n`;
        m += '请返回你要查验的卡牌index（仅一个整数）：';
    }

    return m;
}

module.exports = async function handler(req, res) {
    const { action, data, mode } = req.body;
    if (!action || !data) return res.status(400).json({ error: 'missing action or data' });

    const userMessage = buildMessage(action, data);

    try {
        // 根据模式选择配置
        let selectedURL, selectedKey, selectedModel;
        if (mode === 'fast') {
            selectedURL = FAST_BASE_URL;
            selectedKey = FAST_AUTH_TOKEN;
            selectedModel = MODEL_FAST;
        } else {
            selectedURL = BASE_URL;
            selectedKey = API_KEY;
            selectedModel = MODEL;
        }
        
        console.log('Using API:', selectedURL);
        console.log('Using Model:', selectedModel);
        console.log('Using Key:', selectedKey.substring(0, 10) + '...');
        console.log('Request Body:', JSON.stringify({
            model: selectedModel,
            max_tokens: 100,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT.substring(0, 100) + '...' },
                { role: 'user', content: userMessage.substring(0, 200) + '...' }
            ]
        }));
        
        // 两种模式都使用 OpenAI 兼容格式
        // 极速模式使用推理模型（DeepSeek-R1系列），推理token会占用max_tokens，需要更大的配额
        const maxTokens = mode === 'fast' ? 8000 : 4000;
        const requestBody = {
            model: selectedModel,
            max_tokens: maxTokens,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ]
        };
        
        console.log('Request Body:', JSON.stringify(requestBody));
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(selectedURL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${selectedKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('AI API error:', response.status, errText);
            console.error('Response headers:', response.headers);
            // API调用失败时，使用随机兜底策略
            const fallback = data.availableTargets[Math.floor(Math.random() * data.availableTargets.length)];
            return res.json({ cardIndex: fallback, thinking: 'AI决策无效，使用随机兜底策略' });
        }

        const json = await response.json();
        clearTimeout(timeoutId);
        const msg = json.choices?.[0]?.message || {};
        // DeepSeek R1 系列把思考过程放在 reasoning_content，最终答案在 content
        // 若 content 为空则回退到 reasoning_content
        const contentText = msg.content?.trim() || '';
        const reasoningText = msg.reasoning_content?.trim() || '';

        // content 有内容则用 content（Doubao等），否则用 reasoning_content（DeepSeek R1等）
        let rawFull;
        if (contentText) {
            rawFull = contentText;
        } else {
            // 去掉 <think>...</think> 块后看是否还有内容，否则直接用 reasoning_content
            const withoutThink = reasoningText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            rawFull = withoutThink || reasoningText;
        }

        const raw = rawFull;

        console.log('AI Raw Response:', raw.substring(0, 300));
        console.log('Available Targets:', data.availableTargets);

        // 提取思考过程和卡牌索引：取最后一个非空行，若是纯数字则作为 cardIndex
        const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
        let thinking = '';
        let cardIndex = -1;

        if (lines.length > 0) {
            const lastLine = lines[lines.length - 1];
            const pureNum = lastLine.match(/^\d+$/);
            if (pureNum) {
                cardIndex = parseInt(pureNum[0]);
                thinking = lines.slice(0, -1).join('\n');
            } else {
                const numMatch = lastLine.match(/\d+/);
                if (numMatch) {
                    cardIndex = parseInt(numMatch[0]);
                    thinking = lines.slice(0, -1).join('\n');
                } else {
                    thinking = raw;
                }
            }
        }

        // 若提取的 cardIndex 不在可用列表中，从全文逆向搜索第一个合法 target
        if (!data.availableTargets.includes(cardIndex)) {
            for (let i = lines.length - 1; i >= 0; i--) {
                const nums = lines[i].match(/\d+/g);
                if (nums) {
                    for (const n of [...nums].reverse()) {
                        const idx = parseInt(n);
                        if (data.availableTargets.includes(idx)) {
                            cardIndex = idx;
                            thinking = lines.slice(0, i + 1).join('\n');
                            break;
                        }
                    }
                }
                if (data.availableTargets.includes(cardIndex)) break;
            }
        }

        console.log('Extracted Card Index:', cardIndex);
        console.log('Extracted Thinking:', thinking);

        if (!data.availableTargets.includes(cardIndex)) {
            // 返回随机合法index作为兜底
            const fallback = data.availableTargets[Math.floor(Math.random() * data.availableTargets.length)];
            console.warn(`AI returned invalid index ${cardIndex}, fallback to ${fallback}`);
            return res.json({ cardIndex: fallback, thinking: 'AI决策无效，使用随机兜底策略' });
        }

        res.json({ cardIndex, thinking });
    } catch (err) {
        console.error('Server error:', err);
        const fallback = data.availableTargets[Math.floor(Math.random() * data.availableTargets.length)];
        res.json({ cardIndex: fallback, thinking: 'AI决策无效，使用随机兜底策略' });
    }
});
