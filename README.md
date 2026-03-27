# 黑暗森林 · 文明对战

基于「黑暗森林」世界观的 AI 卡牌对战游戏。玩家扮演「文明·人联」，与 AI 指挥官「文明·智域」展开卡牌博弈。

## 游戏规则

双方各持 12 张牌：清除者×4、研究员×4、重组师×1、护盾官×1、失控·001×1、先知×1。

消灭对方任意一类牌（清除者全灭 / 研究员全灭 / 功能牌全灭）即可获胜。

## 技术栈

- 前端：原生 HTML / CSS / JavaScript
- 后端：Node.js + Express（本地）/ Vercel Serverless Function（部署）
- AI：豆包 Doubao API（推理模式）+ AIHubMix DeepSeek API（极速模式）

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量模板并填入密钥
cp .env.example .env

# 3. 启动后端服务
npm start

# 4. 用浏览器打开 index.html
```

## 部署到 Vercel

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 在 Vercel 项目设置 → **Environment Variables** 中添加以下变量：

| 变量名 | 说明 |
|--------|------|
| `DOUBAO_BASE_URL` | 豆包 API 地址 |
| `DOUBAO_AUTH_TOKEN` | 豆包 API 密钥 |
| `AI_MODEL` | 推理模式模型名（默认 `Doubao-Seed-2.0-lite`）|
| `FAST_BASE_URL` | 极速模式 API 地址 |
| `FAST_AUTH_TOKEN` | 极速模式 API 密钥 |
| `AI_MODEL_FAST` | 极速模式模型名（默认 `DeepSeek-R1-Distill-Qwen-7B`）|

4. 部署完成后即可访问。

## 环境变量说明

参见 [`.env.example`](.env.example)。**请勿将 `.env` 文件提交到版本库。**
