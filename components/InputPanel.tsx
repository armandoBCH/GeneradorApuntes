
import React from 'react';
import { type InputPanelProps, type UniversityLevel } from '../types';
import FileInput from './common/FileInput';

const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z"></path>
    <path d="M19 12h.01"></path>
    <path d="M6.5 8.5h.01"></path>
  </svg>
);

const SubjectButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}> = ({ label, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full font-semibold py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
      isActive
        ? 'bg-cyan-600 text-white shadow-md'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {label}
  </button>
);

const InputPanel: React.FC<InputPanelProps> = ({
  subject,
  setSubject,
  topic,
  setTopic,
  universityLevel,
  setUniversityLevel,
  programmingLanguages,
  setProgrammingLanguages,
  primaryFiles,
  onPrimaryFilesSelect,
  onPrimaryFileRemove,
  primaryFileContent,
  setPrimaryFileContent,
  onGenerate,
  isLoading,
  isProcessingFile,
  isUploadingFiles,
  generatePodcast,
  setGeneratePodcast,
}) => {
    const anyLoading = isLoading || isProcessingFile || isUploadingFiles;

    const subjectConfig = {
        math: {
            topicLabel: 'Tema Matemático',
            topicPlaceholder: 'Ej: Cálculo de Varias Variables',
            primaryNotesLabel: 'Material Fuente',
        },
        chemistry: {
            topicLabel: 'Tema Químico',
            topicPlaceholder: 'Ej: Termodinámica, Reacciones Redox',
            primaryNotesLabel: 'Material Fuente',
        },
        sociales: {
            topicLabel: 'Tema de Sociedad y Estado',
            topicPlaceholder: 'Ej: Modelo Agroexportador',
            primaryNotesLabel: 'Material Fuente',
        },
        computation: {
            topicLabel: 'Tema de Computación',
            topicPlaceholder: 'Ej: Algoritmos de Ordenamiento',
            primaryNotesLabel: 'Material Fuente',
        }
    };
    
    const config = subjectConfig[subject];
    
    const canGenerate = !anyLoading && topic.trim() && (primaryFileContent.trim() || primaryFiles.length > 0);

    return (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col gap-6 h-full shadow-lg border border-slate-700">
            <div className="grid grid-cols-2 gap-2">
                <SubjectButton label="Matemáticas" isActive={subject === 'math'} onClick={() => setSubject('math')} disabled={anyLoading} />
                <SubjectButton label="Química" isActive={subject === 'chemistry'} onClick={() => setSubject('chemistry')} disabled={anyLoading} />
                <SubjectButton label="Sociedad y Estado" isActive={subject === 'sociales'} onClick={() => setSubject('sociales')} disabled={anyLoading} />
                <SubjectButton label="Computación" isActive={subject === 'computation'} onClick={() => setSubject('computation')} disabled={anyLoading} />
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
                        {config.topicLabel}
                    </label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={config.topicPlaceholder}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={anyLoading}
                    />
                </div>

                {subject !== 'sociales' && (
                    <div>
                        <label htmlFor="level" className="block text-sm font-medium text-slate-300 mb-2">
                            Nivel Universitario
                        </label>
                        <div className="relative">
                            <select
                                id="level"
                                value={universityLevel}
                                onChange={(e) => setUniversityLevel(e.target.value as UniversityLevel)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none"
                                disabled={anyLoading}
                            >
                                <option value="introductorio">Introductorio</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {subject === 'computation' && (
                    <div>
                         <label htmlFor="languages" className="block text-sm font-medium text-slate-300 mb-2">
                            Lenguaje(s) de Programación
                        </label>
                        <input
                            type="text"
                            id="languages"
                            value={programmingLanguages}
                            onChange={(e) => setProgrammingLanguages(e.target.value)}
                            placeholder="Ej: Python, JavaScript, C++"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            disabled={anyLoading}
                        />
                    </div>
                )}
            </div>

            <div className="flex-grow flex flex-col gap-4 min-h-0">
                <div className="flex-grow flex flex-col gap-2 min-h-0">
                    <FileInput
                        files={primaryFiles}
                        onFilesSelect={onPrimaryFilesSelect}
                        onFileRemove={onPrimaryFileRemove}
                        label={config.primaryNotesLabel}
                        placeholder="Arrastra o selecciona uno o más archivos..."
                        acceptedTypes=".pdf,.txt,.md"
                        disabled={anyLoading}
                        isProcessing={isProcessingFile}
                    />
                    <textarea
                        id="primary-material"
                        value={primaryFileContent}
                        onChange={(e) => setPrimaryFileContent(e.target.value)}
                        placeholder="... o pega tus apuntes aquí directamente. El contenido de archivos .txt y .md aparecerá aquí."
                        className="w-full flex-grow bg-slate-700 border border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none"
                        disabled={anyLoading}
                        aria-label="Material fuente principal"
                    />
                </div>
            </div>
            
            <div className="mt-auto flex flex-col gap-4">
                 <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50">
                    <input
                        type="checkbox"
                        id="generate-podcast-toggle"
                        checked={generatePodcast}
                        onChange={(e) => setGeneratePodcast(e.target.checked)}
                        disabled={anyLoading}
                        className="h-5 w-5 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label 
                        htmlFor="generate-podcast-toggle"
                        className="flex-grow text-sm font-medium text-slate-300 cursor-pointer"
                    >
                       🎙️ Crear guion de podcast automáticamente
                    </label>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={!canGenerate}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
                >
                    {isUploadingFiles ? (
                         <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            <span>Subiendo archivos...</span>
                        </>
                    ) : isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            <span>Generando...</span>
                        </>
                    ) : isProcessingFile ? (
                        <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            <span>Procesando archivos...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>Crear Guía de Estudio</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InputPanel;
