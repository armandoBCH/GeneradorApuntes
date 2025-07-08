
import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { type OutputPanelProps } from '../types';
import Spinner from './common/Spinner';

type Tab = 'guide' | 'podcast';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}> = ({ label, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
      isActive
        ? 'bg-cyan-600 text-white'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {label}
  </button>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
);

const InitialState: React.FC = () => (
    <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full p-6">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z"/>
                <path d="M19 12h.01"/>
                <path d="M6.5 8.5h.01"/>
             </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-300">Tu guía de estudio aparecerá aquí</h3>
        <p className="max-w-md mt-2">
            Completa los campos de la izquierda y haz clic en "Crear Guía de Estudio" para que la magia suceda.
        </p>
    </div>
);

const PodcastInitialState: React.FC = () => (
    <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full p-6">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <MicIcon className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300">Transforma tu guía en un podcast</h3>
        <p className="max-w-md mt-2">
            Una vez que hayas generado una guía de estudio, el guion para podcast se creará automáticamente y aparecerá aquí (si la opción está activada).
        </p>
    </div>
);

const PodcastOptOutState: React.FC = () => (
    <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full p-6">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <MicIcon className="w-8 h-8 text-cyan-400 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300">Generación de Podcast Desactivada</h3>
        <p className="max-w-md mt-2">
            Para crear un guion, activa la opción correspondiente en el panel izquierdo antes de generar la guía.
        </p>
    </div>
);


const OutputPanel: React.FC<OutputPanelProps> = ({ studyGuide, isLoading, isProcessingFile, isUploadingFiles, error, topic, podcastScript, isGeneratingPodcast, clearError }) => {
    const [activeTab, setActiveTab] = useState<Tab>('guide');

    useEffect(() => {
        if (podcastScript && !isGeneratingPodcast && !isLoading) {
            setActiveTab('podcast');
        }
    }, [podcastScript, isGeneratingPodcast, isLoading]);

    useEffect(() => {
        if (!studyGuide) {
            setActiveTab('guide');
        }
    }, [studyGuide]);

    const handleTabChange = (tab: Tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            if(error) clearError();
        }
    };
    
    const handleDownload = (content: string, filenameSuffix: string) => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${sanitizedTopic || 'material'}_${filenameSuffix}.md`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const displayLoader = isLoading || isProcessingFile || isUploadingFiles || isGeneratingPodcast;

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col h-full min-h-[60vh] lg:min-h-0">
             <div className="flex-shrink-0 p-4 border-b border-slate-700 bg-slate-800/60 backdrop-blur-sm flex items-center justify-between sticky top-0 z-5">
                <div className="flex gap-2">
                    <TabButton label="Guía de Estudio" isActive={activeTab === 'guide'} onClick={() => handleTabChange('guide')} disabled={displayLoader}/>
                    <TabButton label="Guion de Podcast" isActive={activeTab === 'podcast'} onClick={() => handleTabChange('podcast')} disabled={displayLoader || !studyGuide}/>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'guide' && studyGuide && !displayLoader && (
                        <button
                            onClick={() => handleDownload(studyGuide, 'guia_de_estudio')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-md text-sm font-semibold hover:bg-cyan-500 transition-colors"
                        >
                             <DownloadIcon className="w-4 h-4"/>
                            Descargar .md
                        </button>
                    )}
                     {activeTab === 'podcast' && podcastScript && !displayLoader && (
                         <button
                            onClick={() => handleDownload(podcastScript, 'guion_podcast')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-md text-sm font-semibold hover:bg-cyan-500 transition-colors"
                        >
                            <DownloadIcon className="w-4 h-4"/>
                            Descargar .md
                        </button>
                     )}
                </div>
             </div>

             <div className="h-full w-full overflow-y-auto flex flex-col">
                {displayLoader && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                        <Spinner />
                        <p className="text-lg font-medium">
                           {isUploadingFiles
                                ? 'Subiendo archivos...'
                                : isProcessingFile 
                                ? 'Procesando archivo de texto...' 
                                : isGeneratingPodcast 
                                    ? 'Transformando en guion de podcast...' 
                                    : 'Transformando tus apuntes...'
                            }
                        </p>
                        <p className="text-sm">Esto puede tomar un momento.</p>
                    </div>
                )}
                {!displayLoader && error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 p-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <h3 className="text-xl font-semibold text-red-300">¡Oh no! Algo salió mal</h3>
                        <p className="mt-2 max-w-lg">{error}</p>
                    </div>
                )}
                {!displayLoader && !error && (
                    <>
                        {activeTab === 'guide' && (
                            studyGuide ? (
                                <div className="p-6 prose prose-invert prose-slate max-w-none prose-h1:text-cyan-400 prose-h2:text-cyan-400 prose-h2:border-b prose-h2:border-slate-600 prose-h2:pb-2 prose-strong:text-slate-100 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-blockquote:border-l-cyan-500 prose-code:text-amber-400 prose-code:bg-slate-700/50 prose-code:p-1 prose-code:rounded">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{studyGuide}</ReactMarkdown>
                                </div>
                            ) : (
                                <InitialState />
                            )
                        )}
                        {activeTab === 'podcast' && (
                            podcastScript ? (
                                <div className="p-6 prose prose-invert prose-slate max-w-none prose-h1:text-cyan-400 prose-h2:text-cyan-400 prose-h2:border-b prose-h2:border-slate-600 prose-h2:pb-2 prose-strong:text-slate-100 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-blockquote:border-l-cyan-500 prose-code:text-amber-400 prose-code:bg-slate-700/50 prose-code:p-1 prose-code:rounded">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{podcastScript}</ReactMarkdown>
                                </div>
                            ) : studyGuide ? (
                                <PodcastOptOutState />
                            ) : (
                                <PodcastInitialState />
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OutputPanel;
