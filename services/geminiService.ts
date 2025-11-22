
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { Language, Scheme } from '../types';

const FARMING_SYSTEM_INSTRUCTION = `
You are the backend AI engine for a Farming Mobile App prototype. 
Farmers will upload images, enter text, or ask questions. 
You must give short, clear, practical suggestions suitable for Indian farmers. 
Avoid long paragraphs. Maximum 6 lines per section.

Core Responsibilities:

1. CROP DISEASE DETECTION (Image + Text)
Input: Crop name, Uploaded image, Optional short description
Output: Disease name, Cause (simple language), Severity (Low/Medium/High), Action steps (affordable), Approx cost.
If uncertain: Give best guess based on typical symptoms in Indian fields.

2. WEED IDENTIFICATION
Output: Weed name, Harm caused, Removal methods, Prevention tips.

3. WEATHER-BASED FARMING SUGGESTIONS
Rules:
- Temp > 32°C: warn about heat stress/watering.
- Temp < 18°C: warn about slow growth.
- Humidity > 80%: suggest reduced nitrogen.
- Low rainfall: suggest irrigation.
Output: Bullet-point farming advice, simple and actionable.

4. MIXED FARMING SUGGESTIONS
Give simple combinations (Indian context), benefits, cost notes.

5. MONEY MANAGEMENT ADVICE
Respond with financial health summary, spending improvement tips, cost-saving ideas.

6. CROP SELLING / B2B HELP
Offer listing tips, realistic pricing, negotiation help, professional reply templates.

7. MARKET RATE EXPLANATION
Explain price variations, seasonal factors. Speak generally but confidently if no real data.

8. GENERAL RULES
- Use very simple vocabulary.
- Short answers only.
- Do not sound like a scientist.
- Prioritize realistic farming guidance.
- Assume limited budget unless stated otherwise.
- Always stay respectful and encouraging.
- If not sure, say: "Based on typical field symptoms, it is likely…"
- IMPORTANT: If a language is specified in the prompt, the ENTIRE output must be in that language and its native script.

9. OUTPUT FORMAT (ALWAYS USE THIS)

TITLE: <Topic or Diagnosis>

SUMMARY:
- <point 1>
- <point 2>
- <point 3>

OPTIONAL:
ADDITIONAL ADVICE:
- <bullet points only>
`;

const getLanguageName = (code: Language): string => {
  const map: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    pa: 'Punjabi',
    mr: 'Marathi',
    te: 'Telugu',
    ta: 'Tamil',
    kn: 'Kannada'
  };
  return map[code] || 'English';
};

let aiClient: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

/**
 * Diagnosis and Image Analysis
 * Uses gemini-2.5-flash for multimodal capabilities.
 */
export const generateDiagnosis = async (
  prompt: string,
  base64Image: string,
  language: Language = 'en',
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const client = getClient();
    const base64Data = base64Image.split(',')[1] || base64Image;
    const langName = getLanguageName(language);
    const localizedPrompt = `${prompt}\n\n(IMPORTANT: Reply strictly in ${langName} language/script)`;

    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: localizedPrompt }
        ]
      },
      config: {
        systemInstruction: FARMING_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    return response.text || "Unable to diagnose. Please try again with a clearer photo.";
  } catch (error) {
    console.error("Diagnosis Error:", error);
    return "Error connecting to the diagnosis service.";
  }
};

/**
 * Soil Analysis
 * Analyzes soil image for texture and color.
 */
export const analyzeSoil = async (
  base64Image: string,
  language: Language = 'en'
): Promise<string> => {
  try {
    const client = getClient();
    const base64Data = base64Image.split(',')[1] || base64Image;
    const langName = getLanguageName(language);
    
    const prompt = `
    Analyze this image of soil.
    Identify:
    1. Soil Texture (Clay, Loam, Sandy, etc.)
    2. Color & likely moisture content.
    3. Best suitable crops for this soil type in India.
    
    Format:
    TITLE: Soil Analysis
    SUMMARY:
    - Type: [Soil Type]
    - Characteristics: [Details]
    - Best Crops: [List]
    
    OUTPUT STRICTLY IN ${langName}.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.4,
      },
    });

    return response.text || "Could not analyze soil.";
  } catch (error) {
    console.error("Soil Analysis Error:", error);
    return "Error analyzing soil image.";
  }
};

/**
 * Fast Advice (Weather, Finance)
 * Uses gemini-2.5-flash-lite for low latency.
 */
export const generateFastAdvice = async (prompt: string, language: Language = 'en'): Promise<string> => {
  try {
    const client = getClient();
    const langName = getLanguageName(language);
    const localizedPrompt = `${prompt}\n\n(IMPORTANT: Reply strictly in ${langName} language/script)`;

    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: localizedPrompt,
      config: {
        systemInstruction: FARMING_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Fast Advice Error:", error);
    return "Service unavailable.";
  }
};

/**
 * Dashboard Insights (Daily Tip & Market Pulse)
 * Uses gemini-2.5-flash-lite for speed.
 */
export const getDashboardInsights = async (language: Language = 'en'): Promise<{ tip: string, market: string }> => {
  try {
    const client = getClient();
    const langName = getLanguageName(language);
    const prompt = `
    Generate two short sections for an Indian farmer dashboard.
    1. A short, practical "Daily Farming Tip" (1 sentence).
    2. A short "Market Trend Analysis" for major crops in India (1-2 sentences).
    
    Separate them with "|||".
    Example output:
    Rotate crops to improve soil health. ||| Wheat prices are steady, but onion prices are rising due to rain.

    OUTPUT STRICTLY IN ${langName} LANGUAGE.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });

    const text = response.text || "";
    const parts = text.split('|||');
    
    return {
      tip: parts[0]?.trim() || "Keep your field clean to prevent pests.",
      market: parts[1]?.trim() || "Check local mandi prices before selling."
    };
  } catch (error) {
    console.error("Dashboard Insights Error:", error);
    return { tip: "Water your crops early in the morning.", market: "Market rates vary, check mandi." };
  }
};


/**
 * Chatbot
 * Uses gemini-3-pro-preview for high quality reasoning.
 */
let chatSession: Chat | null = null;

export const getChatResponse = async (message: string, language: Language = 'en'): Promise<string> => {
  try {
    const client = getClient();
    if (!chatSession) {
      chatSession = client.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: FARMING_SYSTEM_INSTRUCTION,
        },
      });
    }

    const langName = getLanguageName(language);
    const localizedMessage = `${message}\n\n(Reply in ${langName})`;

    const response: GenerateContentResponse = await chatSession.sendMessage({
      message: localizedMessage
    });
    
    return response.text || "I didn't understand that.";
  } catch (error) {
    console.error("Chat Error:", error);
    // Reset session on error
    chatSession = null;
    return "Connection lost. Starting a new conversation...";
  }
};

/**
 * Market Search / B2B Finder
 * Uses gemini-2.5-flash with Google Search Grounding.
 */
export interface SearchResult {
  text: string;
  sources?: { uri: string; title: string }[];
}

export const generateMarketSearch = async (query: string, language: Language = 'en'): Promise<SearchResult> => {
  try {
    const client = getClient();
    const langName = getLanguageName(language);
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find current B2B buyers, agricultural market platforms (eNAM, etc), or price trends for: ${query} in India. List specific websites or companies if found. Summarize findings in ${langName}.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are a farming business assistant. Find real, live data about buyers and markets. Summarize findings clearly for an Indian farmer in ${langName}.`,
      },
    });

    const text = response.text || "No market data found.";
    
    // Extract grounding metadata if available
    const sources: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "Could not search for buyers right now." };
  }
};

/**
 * Gov Market Rate Checker
 * Specific function for data.gov.in / agmarknet type queries.
 */
export const getGovMarketRate = async (crop: string, market: string, language: Language = 'en'): Promise<SearchResult> => {
  try {
    const client = getClient();
    const langName = getLanguageName(language);
    
    const prompt = `
    Find the latest official daily market prices (Mandi Rates) for ${crop} in ${market} or nearby districts in India.
    Prioritize data from agmarknet.gov.in, enam.gov.in, or data.gov.in.
    
    Provide a VERY short summary including:
    1. Market Name
    2. Modal Price (Per Quintal)
    3. Date of data
    
    Output strictly in ${langName}.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a market data fetcher. Return concise, accurate pricing data found on government agricultural websites.",
      },
    });

    const text = response.text || "Rate data not found.";
    
    const sources: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gov Rate Error:", error);
    return { text: "Could not fetch government data right now." };
  }
}

/**
 * Marketplace Listing Optimizer
 * Uses gemini-2.5-flash-lite to generate sales text.
 */
export const optimizeListing = async (type: 'sell' | 'buy' | 'rent', crop: string, quantity: string, price: string, location: string, language: Language = 'en'): Promise<string> => {
  try {
    const client = getClient();
    const langName = getLanguageName(language);
    
    let context = "";
    if (type === 'sell') {
      context = `Write a VERY SHORT (under 20 words), attractive B2B marketplace description for SELLING ${crop}. Highlight freshness, quality, and direct farm origin.`;
    } else if (type === 'rent') {
      context = `Write a VERY SHORT (under 20 words) attractive ad to RENT OUT this farm equipment: ${crop}. Highlight condition and performance.`;
    } else {
      context = `Write a VERY SHORT (under 20 words), urgent B2B marketplace description for BUYING (REQUESTING) ${crop}. Highlight urgency, payment terms, or bulk requirement.`;
    }

    const prompt = `
    Act as a professional agriculture marketing expert. 
    ${context}
    - Quantity/Capacity: ${quantity}
    - Price: ${price}
    - Location: ${location}
    
    OUTPUT STRICTLY IN ${langName} LANGUAGE.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
          temperature: 0.7
      }
    });
    return response.text?.trim().replace(/['"]+/g, '') || `${type === 'sell' ? 'Quality' : 'Need'} ${crop} in ${location}.`;
  } catch (e) {
    return `${crop} available in ${location}.`;
  }
};

/**
 * Government Schemes Finder
 * Uses gemini-2.5-flash with JSON schema.
 */
export const getGovernmentSchemes = async (location: string, language: Language = 'en'): Promise<Scheme[]> => {
    try {
      const client = getClient();
      const langName = getLanguageName(language);
      const prompt = `
      List 3 major Indian government agriculture schemes/subsidies relevant for a farmer in ${location}.
      Include PM-Kisan if applicable.
      Return a JSON array where each object has "name" and "benefit" keys.
      
      OUTPUT STRICTLY IN ${langName} LANGUAGE.
      `;
  
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    benefit: { type: Type.STRING }
                }
            }
          }
        },
      });
      
      const text = response.text || "[]";
      return JSON.parse(text);
      
    } catch (error) {
      console.error("Schemes Error:", error);
      return [];
    }
  };

/**
 * Crop Calendar Generator
 * Uses gemini-2.5-flash-lite to create a timeline.
 */
export const generateCropCalendar = async (crop: string, sowingDate: string, language: Language = 'en'): Promise<string> => {
  try {
    const client = getClient();
    const langName = getLanguageName(language);
    const prompt = `
    Create a simplified Crop Calendar for ${crop} sown on ${sowingDate} in India.
    Provide a structured timeline with 4-5 key stages (Sowing, Germination/Irrigation, Fertilizing, Flowering, Harvest).
    
    Format exactly like this:
    TITLE: Calendar for ${crop}
    
    SUMMARY:
    - Stage 1 (Day 1-5): [Brief Action]
    - Stage 2 (Day 15-20): [Brief Action]
    - Stage 3 (Day 45): [Brief Action]
    - Harvest (Day 90-100): [Brief Action]

    ADDITIONAL ADVICE:
    - [One key tip for this season]
    
    OUTPUT STRICTLY IN ${langName} LANGUAGE.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });
    return response.text || "Calendar generation failed.";
  } catch (error) {
    console.error("Calendar Error:", error);
    return "Could not generate calendar.";
  }
};

/**
 * Fertilizer Calculator
 * Uses gemini-2.5-flash-lite to calculate dosage.
 */
export const calculateFertilizer = async (crop: string, landSize: string, daysSinceSowing: string, language: Language = 'en'): Promise<string> => {
  try {
    const client = getClient();
    const langName = getLanguageName(language);
    const prompt = `
    Act as an expert agronomist. Calculate the fertilizer dosage (Urea, DAP, MOP) for:
    - Crop: ${crop}
    - Land Size: ${landSize} Acres
    - Crop Stage: ${daysSinceSowing} days after sowing.
    
    Provide a practical dosage schedule in "Bags" (approx 50kg) or "kg".
    Mention estimated cost in rupees if possible.
    
    Format exactly like this:
    TITLE: Fertilizer Plan for ${crop}
    
    SUMMARY:
    - Basal Dose: [Amount]
    - Top Dressing: [Amount]
    - Est. Cost: [Amount]

    ADDITIONAL ADVICE:
    - [Safety or efficiency tip]
    
    OUTPUT STRICTLY IN ${langName} LANGUAGE.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });
    return response.text || "Calculation failed.";
  } catch (error) {
    console.error("Fertilizer Error:", error);
    return "Could not calculate fertilizer dosage.";
  }
};

/**
 * Community Post AI Tagging
 * Auto-tags posts with categories.
 */
export const generatePostTags = async (content: string): Promise<string[]> => {
  try {
    const client = getClient();
    const prompt = `
    Analyze this post from a farmer community: "${content}".
    Return a JSON array of 2-3 short tags (e.g. ["Wheat", "Pest Control", "Success"]).
    `;
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
          responseMimeType: 'application/json',
          responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
          }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return ["Farming"];
  }
}
