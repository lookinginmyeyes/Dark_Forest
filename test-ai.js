const fetch = require('node-fetch');

const BASE_URL = 'https://ark.cn-beijing.volces.com/api/coding/v3';
const API_KEY = 'f8591ebf-5301-4922-ae6f-c1eb942643e5';
const MODEL = 'Doubao-Seed-2.0-lite';

const SYSTEM_PROMPT = `你是「深渊网」的AI指挥官，正在与「极光署」（玩家）进行代号:深渊卡牌对战。

【卡牌构成】双方各持12张：
- 清除者(killer)×4：主要战斗单位
- 研究员(normal)×4：普通单位
- 重组师(doctor)×1：被消除时复活己方一张已消除的牌
- 护盾官(guard)×1：每大回合守护己方一张牌，守护中的牌免疫攻击（不可连续两回合守护同一张）
- 失控·001(hunter)×1：被攻击消除时立即反击消除对方一张牌
- 先知(prophet)×1：每大回合查验对方一张牌的真实类型

【胜利条件】将对方某一类牌全部消除即胜：清除者全灭 / 研究员全灭 / 功能牌全灭（重组师+护盾官+失控·001+先知）

【大回合顺序】玩家先知查验→你先知查验→玩家护盾官守护→你护盾官守护→玩家进攻→你进攻

【进攻策略】优先消灭护盾官（对方失去守护）和重组师（对方失去复活）；若某类牌仅剩1张优先攻击；避免在非必要时优先攻击失控·001（会反击）。
【防守策略】优先守护已被对方查验的功能牌（对方知道位置会优先攻击）；其次守护功能牌；某类牌仅剩1张时务必守护；不可守护上一回合守护过的同一张牌。
【预言策略】优先查验对方频繁守护的牌（可能是功能牌）；利用查验结果精准进攻。

【响应格式】请先分析当前局势和你的决策思路（1-3句话），然后在最后一行只返回一个整数（目标卡牌的index），例如：
分析：对方护盾官未被消除，优先攻击护盾官以削弱对方防守能力。
3

重要：请严格按照上述格式返回，最后一行必须是一个整数，且这个整数必须是当前任务中提供的可用目标列表中的一个。如果不返回整数，你的决策将被视为无效，系统会使用随机策略。`;

const userMessage = `【我方（深渊网）卡牌】
  [0] 清除者 — 存活
  [1] 研究员 — 存活
  [2] 重组师 — 存活
  [3] 护盾官 — 存活
  [4] 失控·001 — 存活
  [5] 先知 — 存活
  [6] 清除者 — 存活
  [7] 研究员 — 存活
  [8] 清除者 — 存活
  [9] 研究员 — 存活
  [10] 清除者 — 存活
  [11] 研究员 — 存活
存活统计：清除者×4 研究员×4 功能牌×4

【对方（极光署）卡牌】
  [0] 未知
  [1] 未知
  [2] 未知
  [3] 未知
  [4] 未知
  [5] 未知
  [6] 未知
  [7] 未知
  [8] 未知
  [9] 未知
  [10] 未知
  [11] 未知
对方存活：12张

当前任务：进攻回合，从以下index中选一张攻击：[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
请返回你要攻击的卡牌index（仅一个整数）：`;

async function testAI() {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API error:', response.status, errText);
      return;
    }

    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content?.trim() || '';
    console.log('AI Raw Response:', raw);
    console.log('Response Length:', raw.length);
    console.log('Response Lines:', raw.split('\n'));
  } catch (err) {
    console.error('Error:', err);
  }
}

testAI();
