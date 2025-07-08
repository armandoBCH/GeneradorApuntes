
import React from 'react';
import { type File as GoogleFile } from "@google/genai";

export { GoogleFile };

export type Subject = 'math' | 'chemistry' | 'sociales' | 'computation';
export type UniversityLevel = 'introductorio' | 'intermedio' | 'avanzado';

export interface InputPanelProps {
    subject: Subject;
    setSubject: React.Dispatch<React.SetStateAction<Subject>>;
    topic: string;
    setTopic: React.Dispatch<React.SetStateAction<string>>;
    universityLevel: UniversityLevel;
    setUniversityLevel: React.Dispatch<React.SetStateAction<UniversityLevel>>;
    programmingLanguages: string;
    setProgrammingLanguages: React.Dispatch<React.SetStateAction<string>>;
    
    primaryFiles: File[];
    onPrimaryFilesSelect: (files: File[]) => void;
    onPrimaryFileRemove: (index: number) => void;
    
    primaryFileContent: string;
    setPrimaryFileContent: React.Dispatch<React.SetStateAction<string>>;

    onGenerate: () => void;
    isLoading: boolean;
    isProcessingFile: boolean;
    isUploadingFiles: boolean;
    
    generatePodcast: boolean;
    setGeneratePodcast: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface FileInputProps {
    files: File[];
    onFilesSelect: (newFiles: File[]) => void;
    onFileRemove: (index: number) => void;
    label: string;
    placeholder: string;
    acceptedTypes: string;
    disabled: boolean;
    isProcessing: boolean;
}


export interface OutputPanelProps {
    studyGuide: string;
    isLoading: boolean;
    isProcessingFile: boolean;
    isUploadingFiles: boolean;
    error: string | null;
    topic: string;
    podcastScript: string;
    isGeneratingPodcast: boolean;
    clearError: () => void;
}

export interface StudyGuideParams {
    subject: Subject;
    topic: string;
    universityLevel: UniversityLevel;
    textContent: string;
    pdfFiles: GoogleFile[];
    programmingLanguages?: string;
}
