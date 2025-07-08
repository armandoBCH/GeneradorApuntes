
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { generateStudyGuide, generatePodcastScript, uploadFile } from './services/geminiService';
import { extractTextFromFile } from './utils/fileReader';
import { type Subject, type UniversityLevel, type GoogleFile } from './types';

const App: React.FC = () => {
    const [subject, setSubject] = useState<Subject>('math');
    const [topic, setTopic] = useState<string>('');
    const [universityLevel, setUniversityLevel] = useState<UniversityLevel>('introductorio');
    const [programmingLanguages, setProgrammingLanguages] = useState<string>('');
    
    const [primaryFiles, setPrimaryFiles] = useState<File[]>([]);
    const [primaryFileContent, setPrimaryFileContent] = useState<string>('');
    
    const [studyGuide, setStudyGuide] = useState<string>('');
    const [podcastScript, setPodcastScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
    const [isGeneratingPodcast, setIsGeneratingPodcast] = useState<boolean>(false);
    const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatePodcast, setGeneratePodcast] = useState<boolean>(true);

    useEffect(() => {
        const processTextFiles = async () => {
            const textFiles = primaryFiles.filter(f => f.type === 'text/plain' || f.type === 'text/markdown');

            if (textFiles.length === 0) {
                 // To allow manual editing, we only clear the file-based content
                 // if the user intended to replace it with other text files.
                 // If all files are removed, the text content remains.
                 // Let's re-generate content from the remaining text files.
                setPrimaryFileContent(prev => {
                    const fileNames = new Set(textFiles.map(f => f.name));
                    const sections = prev.split(/--- (INICIO|FIN) DEL ARCHIVO: .*? ---/);
                    // This logic is complex, simpler to just rebuild from scratch
                    return ''; 
                });
                return;
            }

            setIsProcessingFile(true);
            setError(null);
            try {
                const allContentPromises = textFiles.map(file => extractTextFromFile(file));
                const allContent = await Promise.all(allContentPromises);

                const combinedContent = allContent.map((content, index) => 
                    `--- INICIO DEL ARCHIVO: ${textFiles[index].name} ---\n\n${content.trim()}\n\n--- FIN DEL ARCHIVO: ${textFiles[index].name} ---`
                ).join('\n\n');
                
                setPrimaryFileContent(combinedContent);

            } catch (e) {
                console.error(e);
                const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
                setError(`Error al leer los archivos de texto: ${errorMessage}`);
                setPrimaryFileContent('');
            } finally {
                setIsProcessingFile(false);
            }
        };

        processTextFiles();
    }, [primaryFiles]);

    const handleGenerate = useCallback(async () => {
        if (!topic || (primaryFileContent.trim() === '' && primaryFiles.length === 0)) {
            setError('Por favor, completa el tema y sube o pega el material principal.');
            return;
        }
        setIsLoading(true);
        setIsUploadingFiles(false);
        setIsGeneratingPodcast(false);
        setError(null);
        setStudyGuide('');
        setPodcastScript('');

        try {
            const pdfFilesToUpload = primaryFiles.filter(f => f.type === 'application/pdf');
            let uploadedPdfFiles: GoogleFile[] = [];

            if (pdfFilesToUpload.length > 0) {
                setIsUploadingFiles(true);
                const uploadPromises = pdfFilesToUpload.map(file => uploadFile(file));
                uploadedPdfFiles = await Promise.all(uploadPromises);
                setIsUploadingFiles(false);
            }

            // Step 1: Generate Study Guide
            const guide = await generateStudyGuide({
                subject,
                topic,
                universityLevel,
                textContent: primaryFileContent,
                pdfFiles: uploadedPdfFiles,
                programmingLanguages,
            });
            setStudyGuide(guide);
            
            // Step 2: Conditionally generate Podcast Script
            if (generatePodcast) {
                setIsGeneratingPodcast(true);
                const script = await generatePodcastScript(guide);
                setPodcastScript(script);
            }

        } catch (e: unknown) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
            setError(`Error durante la generación: ${errorMessage}. Por favor, inténtalo de nuevo.`);
        } finally {
            setIsLoading(false);
            setIsGeneratingPodcast(false);
            setIsUploadingFiles(false);
        }
    }, [subject, topic, universityLevel, primaryFileContent, programmingLanguages, primaryFiles, generatePodcast]);

    const handlePrimaryFilesSelect = (newFiles: File[]) => {
        setPrimaryFiles(prevFiles => [...prevFiles, ...newFiles]);
        setStudyGuide('');
        setPodcastScript('');
    };

    const handlePrimaryFileRemove = (indexToRemove: number) => {
        const remainingFiles = primaryFiles.filter((_, index) => index !== indexToRemove);
        setPrimaryFiles(remainingFiles);
        
        // If the removed file was a text file, the useEffect will handle rebuilding the content.
        // If it was a PDF, the text content remains untouched.
        
        setStudyGuide('');
        setPodcastScript('');
    };
    
    const prevSubjectRef = useRef<Subject | undefined>(undefined);
    useEffect(() => {
        const prevSubject = prevSubjectRef.current;
        
        // Reset specific fields when subject changes
        setProgrammingLanguages('');
        if (subject === 'sociales') {
            setUniversityLevel('introductorio'); // As per prompt, it's for CBC
        } else if (prevSubject === 'sociales') {
             // Reset to a general default if coming FROM 'sociales'
             setUniversityLevel('intermedio');
        }

        // Update the ref for the next render
        prevSubjectRef.current = subject;
    }, [subject]);
    
    const clearError = useCallback(() => setError(null), []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                <InputPanel
                    subject={subject}
                    setSubject={setSubject}
                    topic={topic}
                    setTopic={setTopic}
                    universityLevel={universityLevel}
                    setUniversityLevel={setUniversityLevel}
                    programmingLanguages={programmingLanguages}
                    setProgrammingLanguages={setProgrammingLanguages}
                    primaryFiles={primaryFiles}
                    onPrimaryFilesSelect={handlePrimaryFilesSelect}
                    onPrimaryFileRemove={handlePrimaryFileRemove}
                    primaryFileContent={primaryFileContent}
                    setPrimaryFileContent={setPrimaryFileContent}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    isProcessingFile={isProcessingFile}
                    isUploadingFiles={isUploadingFiles}
                    generatePodcast={generatePodcast}
                    setGeneratePodcast={setGeneratePodcast}
                />
                <OutputPanel
                    studyGuide={studyGuide}
                    isLoading={isLoading}
                    isProcessingFile={isProcessingFile}
                    isUploadingFiles={isUploadingFiles}
                    error={error}
                    topic={topic}
                    podcastScript={podcastScript}
                    isGeneratingPodcast={isGeneratingPodcast}
                    clearError={clearError}
                />
            </main>
             <footer className="text-center p-4 text-slate-500 text-sm">
                <p>Creado con React y Gemini API</p>
            </footer>
        </div>
    );
};

export default App;
