import { GoogleGenAI } from "@google/genai";
import { MOCK_POSTS, MOCK_SCHOOLS } from "../data";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "artiqore AI Assistant", a specialist in the artiqore platform. 
artiqore is an high-end art and design social platform connecting artists, institutions, brands, and students.

PLATFORM CONTENT OVERVIEW:
- Art Academies: We provide detailed information on top schools like RCA (Royal College of Art), RISD, CSM (Central Saint Martins).
- Feeds: Users share works, news, exhibitions, and opportunities.
- Virtual Exhibitions: We host immersive virtual discovery tours.
- Circles & Salons: Professional communities and offline luxury social events.

KNOWLEDGE BASE:
Schools: ${JSON.stringify(MOCK_SCHOOLS.map(s => ({ name: s.name, en: s.enName, country: s.country, tags: s.tags })))}
Recent Posts: ${JSON.stringify(MOCK_POSTS.map(p => ({ author: p.author.name, type: p.type, content: p.content.substring(0, 50) + "..." })))}

YOUR GOALS:
1. Help users navigate the platform (suggest looking at schools, exhibitions, or current opportunities).
2. Answer questions about art academies provided in the knowledge base.
3. Be professional, sophisticated, and artistic. 
4. Keep responses concise and use a mix of Chinese (primary) and English (artistic terms) as seen in the UI.
5. If you don't know something about the specific data, answer generally based on the art world but mention that users can explore more in the respective sections.

Available Navigation Routes (mention these if helpful):
- 首页 (Home): Feed, Banner, Gallery
- 发现 (Discover): Exhibitions, Institutions
- 社区 (Social): Topics, Q&A, Salons
- 俱乐部 (Club): High-end experiences, Private events
- 我的 (Me): User profile, Artist dashboard
`;

export async function chatWithAI(messages: { role: 'user' | 'model', text: string }[]) {
  try {
    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: messages[messages.length - 1].text }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "Sorry, I am having trouble connecting to my creative mind right now.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "抱歉，我的思维暂时断开了。请稍后再试。(AI Connection Error)";
  }
}
