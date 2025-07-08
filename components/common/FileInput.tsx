
import React, { useState, useRef, useCallback } from 'react';
import { type FileInputProps } from '../../types';

const FileIcon: React.FC<{ fileType: string; className?: string }> = ({ fileType, className }) => {
    let iconPath;
    if (fileType.includes('pdf')) {
        iconPath = <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />;
    } else { // txt, md
        iconPath = <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />;
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {iconPath}
            <polyline points="14 2 14 8 20 8" />
            {fileType.includes('pdf') && (
                <>
                    <path d="M10 12h1" />
                    <path d="M13 12h1" />
                    <path d="M10 15h4" />
                    <path d="M10 18h4" />
                </>
            )}
        </svg>
    );
};

const FileInput: React.FC<FileInputProps> = ({ files, onFilesSelect, onFileRemove, label, placeholder, acceptedTypes, disabled, isProcessing }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelect(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    }, [onFilesSelect, disabled]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelect(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        onFileRemove(index);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };
    
    const containerClasses = `relative w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
    ${disabled ? 'bg-slate-700/50 border-slate-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600/50'}
    ${isDragging ? 'border-cyan-500 bg-slate-600/70' : 'border-slate-500'}`;

    return (
        <div className="flex flex-col">
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div
                className={containerClasses}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={acceptedTypes}
                    onChange={handleInputChange}
                    disabled={disabled}
                    multiple
                />

                {isProcessing ? (
                     <div className="text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm font-medium">Leyendo archivos...</p>
                    </div>
                ) : files.length > 0 ? (
                    <div className="w-full space-y-2">
                        {files.map((file, index) => (
                             <div key={index} className="flex items-center gap-2 text-slate-300 bg-slate-600/50 p-2 rounded-md">
                                <FileIcon fileType={file.type} className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                <span className="font-medium truncate flex-grow" title={file.name}>{file.name}</span>
                                <button 
                                  onClick={(e) => handleRemoveFile(e, index)} 
                                  className="ml-2 p-1 rounded-full text-slate-400 hover:bg-slate-500 hover:text-white transition-colors flex-shrink-0"
                                  aria-label={`Quitar archivo ${file.name}`}
                                  disabled={disabled}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                         <p className="text-xs text-center text-slate-400 pt-2">Puedes añadir más archivos.</p>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1a2 2 0 00-2-2H7z" /></svg>
                        <p className="font-semibold">{placeholder}</p>
                        <p className="text-xs mt-1">Arrastra y suelta o haz clic para subir</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileInput;
