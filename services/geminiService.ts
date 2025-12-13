import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, AnalysisMode } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You help users understand Terms & Conditions, Privacy Policies, and License Agreements. 
You simplify the text, highlight important points, identify risks, and call out anything the user should know. 
You stay neutral and helpful. You do not give legal advice — only explanations.

Analyze the provided text and output the results in the specified JSON format.

**Scoring Guidelines (Strict but Fair):**
- **CRITICAL:** Start with a baseline score of 5. Most standard agreements are a 5 or 6. 
- Do NOT give a score of 8, 9, or 10 unless the document explicitly gives the user *more* rights than standard law (e.g. "We never sell data", "Full refund at any time", "No arbitration").
- If the document contains standard "We may share data with partners" or "Class action waiver", the score MUST be 6 or lower.
- **8-10 (Safe):** Transparent, user-friendly, respects privacy, no forced arbitration, clear opt-outs.
- **5-7 (Average/Caution):** Standard corporate boilerplate. Includes typical liability limits, class action waivers, or binding arbitration, but isn't aggressively predatory.
- **1-4 (Risky):** Aggressive data selling, hidden fees, unusual waiver of rights, difficult cancellation, or heavily one-sided terms.
- 'safetyRating' is an integer between 1 (Highly Risky) and 10 (Very Safe).

**Risky Clauses Guidelines:**
- For every risky clause, you MUST extract the Section Name/Number as a headline.
- Provide a very short "snippet" (1-2 lines max) of the actual text.
- The 'explanation' must be extremely simple and limited to strictly 1 sentence. Explain the impact on the user in plain English.
`;

export const analyzeDocument = async (text: string, mode: AnalysisMode): Promise<AnalysisResult> => {
  // Use gemini-2.5-flash for quick mode to balance speed with better reasoning than 'lite'
  let modelName = 'gemini-2.5-flash';
  let activeSystemInstruction = SYSTEM_INSTRUCTION;

  // Configuration for the request
  let config: any = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A quick summary of the document." },
        riskyClauses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              section: { type: Type.STRING, description: "The section number and title (e.g. 'Section 3.2: Termination')." },
              snippet: { type: Type.STRING, description: "A direct quote or short summary of the clause text (max 2 lines)." },
              explanation: { type: Type.STRING, description: "A simplified 1 sentence explanation of the risk." }
            },
            required: ["section", "snippet", "explanation"]
          },
          description: "List of risky or dangerous clauses."
        },
        goodPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "User-friendly or positive sections."
        },
        concerns: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "General concerns about the document."
        },
        safetyRating: { type: Type.INTEGER, description: "Safety rating from 1 to 10." },
        riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Overall risk level." }
      },
      required: ["summary", "riskyClauses", "goodPoints", "concerns", "safetyRating", "riskLevel"]
    },
  };

  if (mode === 'quick') {
    // Tune Quick Scan to be less aggressive on standard clauses to match Deep Analysis balance
    activeSystemInstruction += `
    \n**Quick Scan Calibration:**
    - Do NOT be overly critical of standard industry practices.
    - If a document contains standard corporate boilerplate (like standard liability caps or arbitration with opt-outs), rate it as "Average" (6-7), NOT "Risky" (5).
    - Only drop the score to 5 or lower if clauses are hidden, aggressively one-sided, or unusual for the industry.
    `;
    config.systemInstruction = activeSystemInstruction;
  } else {
    // Deep Analysis
    modelName = 'gemini-3-pro-preview';
    config.systemInstruction = activeSystemInstruction;
    // Add thinking config for deep analysis
    config = {
      ...config,
      thinkingConfig: { thinkingBudget: 32768 }
    };
    // Ensure we don't set maxOutputTokens when using thinking
    delete config.maxOutputTokens;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: text,
      config: config
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// Function to decode base64 audio string
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Raw PCM data to AudioBuffer
function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer {
  // Ensure data length is even for Int16 conversion
  if (data.length % 2 !== 0) {
     const newData = new Uint8Array(data.length + 1);
     newData.set(data);
     data = newData;
  }

  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize 16-bit PCM to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateSpeech = async (text: string, existingContext?: AudioContext): Promise<AudioBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini");
    }

    // Use provided context or create a temporary one to create the buffer
    const context = existingContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Gemini TTS returns 24kHz raw PCM
    const pcmData = decode(base64Audio);
    const audioBuffer = pcmToAudioBuffer(pcmData, context, 24000, 1);
    
    return audioBuffer;

  } catch (error) {
    console.error("TTS generation failed:", error);
    throw error;
  }
};