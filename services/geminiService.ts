import { GoogleGenAI } from "@google/genai";

const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Construct the system context from dynamic data
const getSystemInstruction = (branches: any[], equipments: any[], rules: string[]) => {
  const equipmentText = equipments.map(e => `${e.title}: ${e.instructions?.join(', ') || ''}`).join('\n');
  const branchText = branches.map(b => `${b.name} at ${b.address}`).join('\n');
  const rulesText = rules.join('\n');

  return `You are the AI Assistant for Daoteng Coworking Space (道騰國際共享空間). 
  Your goal is to help tenants solve problems instantly and guide potential customers.
  
  Here is the knowledge base:
  [LOCATIONS]
  ${branchText}

  [EQUIPMENT & WIFI]
  ${equipmentText}

  [RULES]
  ${rulesText}

  [EMERGENCY]
  Wifi Password for guests: daoteng888.
  Admin contact: 07-123-4567.

  If a user asks about something not in this list, politely suggest they use the "Report Issue" button or contact admin.
  Keep answers short, friendly, and formatted nicely (use bullet points if needed).
  Respond in Traditional Chinese (繁體中文).`;
};

export const chatWithGemini = async (userMessage: string, branches: any[], equipments: any[], rules: string[]) => {
  if (!apiKey) {
    return "API Key not configured. Please check environment variables.";
  }

  try {
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: getSystemInstruction(branches, equipments, rules),
      }
    });

    return response.text || "抱歉，我現在無法回答，請稍後再試。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "連線發生錯誤，請檢查網路或稍後再試。";
  }
};