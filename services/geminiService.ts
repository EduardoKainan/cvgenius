
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    jobTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    experiences: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          position: { type: Type.STRING },
          period: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          year: { type: Type.STRING },
        },
      },
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    contact: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        location: { type: Type.STRING },
      },
    },
  },
};

export async function extractResumeData(input: { text?: string; image?: string; audio?: string; audioMimeType?: string }): Promise<ResumeData> {
  const model = "gemini-3-flash-preview";
  let contents: any[] = [];

  if (input.text) {
    contents.push({ text: `Extract resume data from this text. Detect language (default pt-BR): ${input.text}` });
  }
  
  if (input.image) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: input.image.split(',')[1],
      }
    });
    contents.push({ text: "OCR this image and extract resume data structured as JSON." });
  }

  if (input.audio && input.audioMimeType) {
    contents.push({
      inlineData: {
        mimeType: input.audioMimeType,
        data: input.audio.split(',')[1],
      }
    });
    contents.push({ text: "Listen to this professional background description and extract the resume data structured as JSON. Detect the language automatically." });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: RESUME_SCHEMA,
    },
  });

  return JSON.parse(response.text || '{}') as ResumeData;
}

export async function improveResumeText(data: ResumeData, tone: string): Promise<ResumeData> {
  const model = "gemini-3-flash-preview";
  const prompt = `Rewrite the following resume data to be more professional, impact-oriented, and following a ${tone} tone. Keep the same structure. Data: ${JSON.stringify(data)}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: RESUME_SCHEMA,
    },
  });

  return JSON.parse(response.text || '{}') as ResumeData;
}

export async function processProfessionalPhoto(base64Image: string): Promise<string> {
  const model = "gemini-2.5-flash-image";
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: "image/jpeg",
          },
        },
        { text: "Edit this photo to look like a professional headshot. Adjust lighting, ensure a professional crop focusing on the face, and replace the background with a neutral, slightly blurred office or plain gray studio background." },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return base64Image; // Fallback
}
