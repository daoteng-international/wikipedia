# 系統架構 (System Patterns)

## 技術堆疊 (Tech Stack)
- **Frontend**: React 19, TypeScript, Vite
- **AI Model**: Google Gemini API (`@google/genai`)
- **UI Library**: Lucide React (Icons), CSS Modules / Tailwind (待確認，目前看似標準 CSS/Modules)
- **Build Tool**: Vite

## 架構模式
- **Client-Side Rendering (CSR)**: 作為 SPA (Single Page Application) 運行。
- **Direct AI Integration**: 前端直接呼叫 Gemini API (需注意 Key 安全性，建議後續轉為 Backend Proxy 或 Edge Function)。

## 關鍵決策
- 使用 **Google GenAI SDK** 進行 AI 互動。
- 使用 **Vite** 作為開發與建置工具，確保開發體驗流暢。
- **React 19**：採用最新的 React 版本。

## 目錄結構
- `components/`: 重用 UI 元件
- `services/`: API 整合與商業邏輯 (如 Gemini Service)
- `App.tsx`: 主應用入口
- `.agent/memory-bank/`: AI 記憶庫與專案文件
