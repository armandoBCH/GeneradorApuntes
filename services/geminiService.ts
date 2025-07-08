
import { GoogleGenAI, File as GoogleFile } from '@google/genai';
import { type StudyGuideParams, type Subject } from '../types';
import { 
    MATH_PROMPT,
    CHEMISTRY_PROMPT,
    SOCIALES_PROMPT,
    COMPUTACION_PROMPT,
    PODCAST_PROMPT_TEMPLATE
} from '../prompts';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type PromptConfig = {
    template: string;
    temperature: number;
    systemInstruction: string;
};

export const uploadFile = async (file: globalThis.File): Promise<GoogleFile> => {
    try {
        console.log(`Subiendo ${file.name}...`);
        const uploadedFile = await ai.files.upload({
            file: file,
        });
        console.log(`Subido ${file.name} como ${uploadedFile.name}`);
        return uploadedFile;
    } catch (error) {
        console.error(`Error al subir el archivo ${file.name}:`, error);
        throw new Error(`No se pudo subir ${file.name} a Gemini. Por favor, revisa el tamaño y formato del archivo.`);
    }
};


const getPromptConfig = (subject: Subject): PromptConfig => {
    switch(subject) {
        case 'math':
            return {
                template: MATH_PROMPT,
                temperature: 0.45,
                systemInstruction: 'Eres un Matemático-Educador de Élite Mundial',
            };
        case 'chemistry':
            return {
                template: CHEMISTRY_PROMPT,
                temperature: 0.45,
                systemInstruction: 'Eres un Químico-Educador de Élite Mundial',
            };
        case 'sociales':
            return {
                template: SOCIALES_PROMPT,
                temperature: 0.65,
                systemInstruction: 'Eres un Académico Sintético de Élite',
            };
        case 'computation':
            return {
                template: COMPUTACION_PROMPT,
                temperature: 0.5,
                systemInstruction: 'Eres un Educador de Ciencias de la Computación de Élite Mundial',
            };
        default:
            // This should never be reached if types are correct
            throw new Error(`Unknown subject: ${subject}`);
    }
}

export const generateStudyGuide = async (params: StudyGuideParams): Promise<string> => {
    const { subject, topic, universityLevel, textContent, pdfFiles, programmingLanguages } = params;

    const config = getPromptConfig(subject);
    let promptWithParams = config.template;

    const levelMap: { [key: string]: string } = {
        'introductorio': 'NIVEL INTRODUCTORIO',
        'intermedio': 'NIVEL INTERMEDIO',
        'avanzado': 'NIVEL AVANZADO',
    };
    const formattedLevel = levelMap[universityLevel] || universityLevel;

    switch(subject) {
        case 'math':
            promptWithParams = promptWithParams
                .replace('{{TEMA_MATEMATICO_SUBTEMA}}', topic)
                .replace('{{NIVEL_UNIVERSITARIO}}', formattedLevel);
            break;
        case 'chemistry':
            promptWithParams = promptWithParams
                .replace('{{TEMA_QUIMICO_SUBTEMA}}', topic)
                .replace('{{NIVEL_UNIVERSITARIO}}', formattedLevel);
            break;
        case 'sociales':
            promptWithParams = promptWithParams
                .replace('{{TEMA_SOCIEDAD_ESTADO}}', topic);
            break;
        case 'computation':
            promptWithParams = promptWithParams
                .replace('{{TEMA_SUBTEMA_COMPUTACION}}', topic)
                .replace('{{NIVEL_UNIVERSITARIO}}', formattedLevel)
                .replace('{{LENGUAJES_PROGRAMACION}}', programmingLanguages || 'No especificado');
            break;
    }

    const contentParts: any[] = [];

    const combinedTextPart = `${promptWithParams}\n\n${textContent || ''}`;
    contentParts.push({ text: combinedTextPart });

    if (pdfFiles) {
        pdfFiles.forEach(file => {
            if(file.uri && file.mimeType) {
                contentParts.push({
                    fileData: {
                        mimeType: file.mimeType,
                        fileUri: file.uri
                    }
                });
            }
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: [{ parts: contentParts }],
            config: {
                systemInstruction: config.systemInstruction,
                temperature: config.temperature,
                topP: 0.95,
                topK: 64
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("No se pudo generar la guía de estudio desde la API de Gemini.");
    }
};

export const generatePodcastScript = async (studyGuideContent: string): Promise<string> => {
    const finalPrompt = PODCAST_PROMPT_TEMPLATE.replace(
        '[AQUÍ EL USUARIO PEGARÁ SUS APUNTES DE ESTUDIO. EL PROMPT CONTINÚA DESPUÉS DE ESTE PLACEHOLDER.]',
        studyGuideContent
    );

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: finalPrompt,
            config: {
                // The prompt itself sets the persona and is highly detailed,
                // so we don't need a separate systemInstruction.
                temperature: 0.7, // Recommended for creative/interpretive tasks.
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for podcast script:", error);
        throw new Error("No se pudo generar el guion para podcast desde la API de Gemini.");
    }
};
