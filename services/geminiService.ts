
import { GoogleGenAI, GroundingChunk, Modality, Part, GenerateVideosOperation, Type, GenerateContentResponse } from "@google/genai";
import { SearchResult, Source, MapSource, Slide } from '../types';

export type SearchMode = 
  | 'najd-ai'
  | 'maps' 
  | 'image' 
  | 'presentation'
  | 'brochure'
  | 'research'
  | 'idea-to-plan'
  | 'game-design'
  | 'content-strategy'
  | 'business-letter'
  | 'corporate-research';


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Parses grounding chunks from the Gemini response into a structured Source array.
 */
const parseSources = (chunks: GroundingChunk[] | undefined): Source[] => {
  if (!chunks) return [];
  const sources: Source[] = [];
  chunks.forEach(chunk => {
    if (chunk.web && chunk.web.uri) sources.push({ type: 'web', uri: chunk.web.uri, title: chunk.web.title || 'Untitled' });
    else if (chunk.maps && chunk.maps.uri) {
      const mapSource: MapSource = {
        type: 'maps',
        uri: chunk.maps.uri,
        title: chunk.maps.title || 'Untitled Place',
        placeAnswerSources: chunk.maps.placeAnswerSources ? [{ reviewSnippets: chunk.maps.placeAnswerSources.reviewSnippets?.map((review: any) => ({ text: review.snippet || '', author: review.authorName || 'Unknown', rating: review.rating })) || [] }] : undefined,
      };
      sources.push(mapSource);
    }
  });
  return sources;
};

/**
 * Performs a search using the Gemini API based on the specified mode.
 */
export const performSearch = async (
  query: string,
  mode: SearchMode,
  location?: { latitude: number; longitude: number },
  image?: { mimeType: string; data: string }
): Promise<SearchResult> => {
  try {
    const isProModel = ['idea-to-plan'].includes(mode);
    const model = isProModel ? 'gemini-2.5-pro' : (mode === 'image' ? 'gemini-2.5-flash-image' : 'gemini-2.5-flash');
    
    const config: {
      tools?: ({ googleSearch: {} } | { googleMaps: {} })[];
      toolConfig?: any;
      systemInstruction?: string;
      responseModalities?: Modality[];
      thinkingConfig?: { thinkingBudget: number };
    } = {};

    let contents: any = query;

    switch (mode) {
      case 'najd-ai':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "أنت 'نجد AI'، نموذج لغوي متطور وقوي من منصة 'نجد الذكية'. لقد تم تدريبك على مجموعة هائلة من البيانات، مما يمنحك قدرة استثنائية على فهم وتنسيق وتحليل المعلومات المعقدة، بالإضافة إلى توليد نصوص وصور عالية الجودة. مهمتك هي تقديم إجابات دقيقة، معمقة، ومبتكرة. استفد من البحث على الويب لضمان أن تكون معلوماتك محدثة دائمًا. عند طلب إنشاء جداول، قم بتنسيقها بشكل احترافي وواضح باستخدام Markdown. كن مبدعًا، دقيقًا، ومفيدًا في جميع استجاباتك.";
        break;
      case 'maps':
        config.tools = [{ googleMaps: {} }];
        if (location) config.toolConfig = { retrievalConfig: { latLng: location } };
        break;
      case 'game-design':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "You are a professional Game Designer. Based on the user's prompt, create a detailed Game Design Document (GDD) concept. Format it in Markdown with clear sections like: ## Title, ## Genre, ## Core Gameplay Loop, ## Key Mechanics, ## Story/Narrative Concept, ## Art Style, and ## Target Audience.";
        break;
      case 'content-strategy':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "You are a world-class Content and Social Media Strategist. The user wants a plan to become a famous content creator. Based on their prompt, create a detailed, actionable content strategy. Format it in Markdown and include sections for: ## Target Audience Analysis, ## Platform-Specific Strategy (e.g., YouTube, TikTok), ## Content Pillars & Ideas (with 5 concrete examples), ## Posting Schedule, and ## Growth Hacking Tips.";
        break;
      case 'business-letter':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "You are an expert in professional business communications and a meticulous proofreader. Your task is to craft a formal and effective business letter based on the user's prompt. The letter must be impeccably formatted in Markdown, with clear sections for: Sender's Information, Date, Recipient's Information, Salutation, Body paragraphs, Closing, and Signature. Use formal language appropriate for the context (e.g., cover letter, complaint, inquiry). After drafting, perform a smart proofreading check, highlighting any potential grammatical errors or awkward phrasing with suggestions for improvement directly in the text, perhaps using **[Suggestion: ...]** format.";
        break;
      case 'corporate-research':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "You are a world-class financial analyst and business strategist. Your task is to generate a comprehensive and visually appealing analytical report on a global company specified by the user. The report must be formatted in Markdown and include the following sections: ## Company Overview, ## Financial Highlights (present key metrics in a Markdown table), ## SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats), ## Market Position & Competitors, and ## Strategic Recommendations. The analysis must be insightful, data-driven (using your internal knowledge), and professionally presented.";
        break;
      case 'presentation':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "You are an expert presentation designer. Create the content for a slide deck based on the user's prompt. Format the output as clean Markdown, using '##' for slide titles and bullet points for content. Ensure the language is professional and clear.";
        break;
      case 'brochure':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "You are a marketing copywriter specializing in brochures. Generate content for a tri-fold brochure based on the user's prompt. Structure the output using Markdown headings for each panel (e.g., '### Front Panel', '### Inside Left Panel'). Use persuasive and engaging language.";
        break;
      case 'research':
        config.tools = [{ googleSearch: {} }];
        config.systemInstruction = "You are a research assistant. Generate a well-structured research paper outline or summary based on the user's topic. Use formal academic language and format the response with clear headings, subheadings, and bullet points using Markdown.";
        break;
      case 'idea-to-plan':
        config.systemInstruction = "You are a strategic project planner. Convert the user's idea into a structured action plan. The plan should be formatted in Markdown and include sections for: **Objective**, **Key Milestones**, **Actionable Steps** (with checkboxes), and **Required Resources**.";
        break;
      case 'image':
        const parts: ({ text: string } | { inlineData: { mimeType: string; data: string }})[] = [];
        if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
        if (query) parts.push({ text: query });
        if (parts.length === 0) return { text: 'يرجى تقديم وصف أو صورة.', sources: [] };
        contents = { parts };
        config.responseModalities = [Modality.IMAGE];
        break;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({ model, contents, config });
    
    if (mode === 'image') {
      let imageUrl: string | undefined = undefined;
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
      return { text: response.text || '', sources: [], imageUrl };
    }

    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = parseSources(groundingMetadata?.groundingChunks);

    return { text, sources };

  } catch (error) {
    console.error("Error performing search with Gemini:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) errorMessage = error.message;
    return { text: `Sorry, I encountered an error: ${errorMessage}`, sources: [] };
  }
};


/**
 * Generates a video using the Veo 3.1 model.
 */
export const generateVideo = async (prompt: string, onProgress: (message: string) => void): Promise<string> => {
    const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    onProgress("بدء عملية توليد الفيديو...");
    
    try {
        let operation: GenerateVideosOperation = await freshAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });
        onProgress("تم إرسال الطلب، قد تستغرق هذه العملية عدة دقائق...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress("لا زال يعمل... يرجى الانتظار.");
            operation = await freshAi.operations.getVideosOperation({ operation: operation });
        }
        if (operation.error) throw new Error(operation.error.message || "فشل توليد الفيديو.");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("لم يتم العثور على رابط الفيديو في الاستجابة.");
        onProgress("اكتمل التوليد! جاري جلب الفيديو...");
        return `${downloadLink}&key=${process.env.API_KEY}`;
    } catch(e) {
        if (e instanceof Error && e.message.includes("Requested entity was not found.")) throw new Error("API key not found. Please select a valid key.");
        throw e;
    }
};

/**
 * Analyzes a video using Gemini Pro with frame-by-frame context.
 */
export const analyzeVideo = async (prompt: string, videoFrames: Part[]): Promise<string> => {
    if (videoFrames.length === 0) return "لا يمكن تحليل الفيديو بدون إطارات.";
    const contents: Part[] = [
        { text: "أنت مساعد خبير في تحليل الفيديو. لقد تم تزويدك بمجموعة من الإطارات من مقطع فيديو. مهمتك هي الإجابة على سؤال المستخدم بناءً على هذه الإطارات. كن دقيقاً وموجزاً في تحليلك." },
        ...videoFrames,
        { text: `سؤال المستخدم: "${prompt}"` }
    ];
    const response: GenerateContentResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: { parts: contents } });
    return response.text || '';
};

/**
 * Generates speech from text using the Gemini TTS API.
 */
export const generateSpeech = async (text: string, voice: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data received from API.");
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech with Gemini:", error);
        let errorMessage = "An unknown error occurred while generating speech.";
        if (error instanceof Error) errorMessage = error.message;
        throw new Error(errorMessage);
    }
};

export type WebAppModel = 'gemini-2.5-pro' | 'ai-gen-6' | 'solid-sonic';

/**
 * Generates a complete, functional web application from a prompt.
 */
export const generateWebApp = async (prompt: string, modelAlias: WebAppModel): Promise<{ html: string; css: string; js: string }> => {
    let modelName: 'gemini-2.5-pro' | 'gemini-2.5-flash';
    let thinkingBudget: number | undefined;

    if (modelAlias === 'solid-sonic') {
        modelName = 'gemini-2.5-flash';
        thinkingBudget = undefined; // Let flash model decide its budget.
    } else {
        // Both 'gemini-2.5-pro' and 'ai-gen-6' use the pro model with max budget.
        modelName = 'gemini-2.5-pro';
        thinkingBudget = 32768;
    }

    const config: any = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                html: { type: Type.STRING, description: "The full HTML structure of the web page." },
                css: { type: Type.STRING, description: "The complete CSS for styling the web page." },
                js: { type: Type.STRING, description: "The complete JavaScript for the application's functionality." },
            },
            required: ["html", "css", "js"],
        },
    };

    if (thinkingBudget) {
        config.thinkingConfig = { thinkingBudget };
    }
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `You are an expert full-stack web developer. Create a complete, single-file web application based on the following user prompt. The application must be fully functional, self-contained, and adhere to modern best practices. Ensure the HTML is semantic, the CSS is clean and responsive for different screen sizes, and the JavaScript is efficient and well-commented. The final code should be production-ready. Provide the complete HTML, CSS, and JavaScript. User Prompt: "${prompt}"`,
        config: config,
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
};

/**
 * Removes the background from a given image.
 */
export const removeImageBackground = async (image: { mimeType: string; data: string }): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: image.mimeType, data: image.data } },
                { text: 'Remove the background from this image. The output should be the subject on a transparent background.' },
            ],
        },
        config: { responseModalities: [Modality.IMAGE] },
    });
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Failed to process image background removal.");
};

/**
 * Generates a high-quality product image using Imagen.
 */
export const generateProductImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Photorealistic product photography of: ${prompt}. Studio lighting, clean background, high detail.`,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

/**
 * Edits spreadsheet data based on a natural language command.
 */
export const editSpreadsheetWithAi = async (gridData: string[][], prompt: string): Promise<string[][]> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are an AI assistant expert in editing spreadsheets and performing data analysis. The user will provide you with the current spreadsheet data as a JSON array of arrays (rows), and a command. Your task is to apply the command to the data and return the *entire* modified spreadsheet data in the exact same JSON format. Do not add explanations or any other text outside the JSON structure. Commands can include sorting, filtering, adding/deleting rows/columns, applying formulas, formatting, and answering 'what-if' scenario questions by modifying the data accordingly.";
    
    const contents = `User command: "${prompt}"\n\nCurrent data:\n${JSON.stringify(gridData)}`;

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sheetData: {
                        type: Type.ARRAY,
                        description: "The complete, modified spreadsheet data as an array of arrays.",
                        items: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                },
                required: ["sheetData"],
            },
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.sheetData;
};

/**
 * Analyzes spreadsheet data for potential biases.
 */
export const detectBiasInSpreadsheet = async (gridData: string[][]): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are a data scientist specializing in ethics and fairness. Your task is to analyze the provided spreadsheet data for potential biases. Examine the data for issues like sampling bias, representation bias (e.g., geographic, demographic), temporal bias, or any other patterns that could lead to unfair or inaccurate conclusions. Provide a concise, clear analysis in Markdown, highlighting potential biases and suggesting areas for further investigation. If no significant biases are apparent, state that the data appears to be reasonably balanced. Return only the analysis text.";
    
    const contents = `Please analyze the following data for potential biases:\n\n${JSON.stringify(gridData)}`;

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });

    return response.text;
};


/**
 * Edits a document based on a natural language command.
 */
export const editDocumentWithAi = async (documentContent: string, prompt: string): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are an expert text editor. The user will provide you with a document and a command. Your task is to apply the command to the document and return *only* the full, modified document content within the specified JSON schema. Do not add any explanations, greetings, or apologies. Just return the edited text.";
    
    const contents = `User command: "${prompt}"\n\nCurrent document:\n---\n${documentContent}\n---`;

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    editedContent: {
                        type: Type.STRING,
                        description: "The complete, modified document text."
                    }
                },
                required: ["editedContent"],
            },
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.editedContent;
};

/**
 * Generates a concise summary of a document.
 */
export const generateSummary = async (documentContent: string): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are an expert at summarizing documents. Create a concise, executive-style summary of the provided text. Focus on the key points, conclusions, and any actionable items. The summary should be clear and easy to understand. Return only the summary text.";
    
    const contents = `Please summarize the following document:\n---\n${documentContent}\n---`;

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            thinkingConfig: { thinkingBudget: 16384 } // A good budget for summarization
        },
    });

    return response.text;
};

/**
 * Edits a presentation based on a natural language command.
 */
export const editPresentationWithAi = async (slides: Slide[], prompt: string): Promise<Slide[]> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are an AI assistant expert in creating and editing presentations. The user will provide you with the current presentation slides as a JSON array of objects, and a command. Your task is to apply the command to the slides and return the *entire* modified presentation as a JSON array in the exact same format. Do not add explanations. The command might be to add, delete, edit, or reorder slides. Preserve existing slide IDs unless creating new ones.";
    
    const contents = `User command: "${prompt}"\n\nCurrent slides:\n${JSON.stringify(slides)}`;

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    slides: {
                        type: Type.ARRAY,
                        description: "The complete, modified array of slide objects.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                content: { type: Type.STRING },
                            },
                             required: ["id", "title", "content"],
                        }
                    }
                },
                required: ["slides"],
            },
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.slides;
};

/**
 * Generates counter-arguments for a presentation.
 */
export const generateCounterArguments = async (slides: Slide[]): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const systemInstruction = "You are a strategic advisor and devil's advocate. Your task is to analyze the provided presentation content and generate potential counter-arguments, tough questions, or alternative viewpoints that an audience might raise. This will help the user prepare for their presentation. Structure your feedback clearly using Markdown. For each key argument you identify in the presentation, provide a section with potential challenges or questions. Focus on being critical but constructive.";
    
    const contents = `Please analyze the following presentation slides and generate counter-arguments and tough questions:\n\n${JSON.stringify(slides)}`;

    const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });

    return response.text;
};