// src/components/providers/globalDragDropProvider.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface GlobalDragDropContextType {
    isDraggingFile: boolean;
    onDrop: (callback: (files: FileList) => void) => string;
    removeDropZone: (id: string) => void;
}

const GlobalDragDropContext = createContext<GlobalDragDropContextType | undefined>(undefined);

export const GlobalDragDropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const dragCountRef = useRef(0);
    const dropCallbacksRef = useRef<Map<string, (files: FileList) => void>>(new Map());

    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Verifica se contém arquivos
        if (e.dataTransfer?.types?.includes('Files')) {
            dragCountRef.current++;
            setIsDraggingFile(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCountRef.current--;

        if (dragCountRef.current === 0) {
            setIsDraggingFile(false);
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCountRef.current = 0;
        setIsDraggingFile(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            // Executa o callback mais recente (último registrado)
            const callbacks = Array.from(dropCallbacksRef.current.values());
            if (callbacks.length > 0) {
                callbacks[callbacks.length - 1](files);
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
    }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

    const onDrop = useCallback((callback: (files: FileList) => void) => {
        const id = Math.random().toString(36);
        dropCallbacksRef.current.set(id, callback);
        return id;
    }, []);

    const removeDropZone = useCallback((id: string) => {
        dropCallbacksRef.current.delete(id);
    }, []);

    return (
        <GlobalDragDropContext.Provider value={{ isDraggingFile, onDrop, removeDropZone }}>
            {children}
            {isDraggingFile && (
                <div className="fixed inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 pointer-events-none z-[9999] flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <div>
                            <p className="font-semibold text-gray-800">Solte o arquivo aqui</p>
                            <p className="text-xs text-gray-600">O arquivo será processado automaticamente</p>
                        </div>
                    </div>
                </div>
            )}
        </GlobalDragDropContext.Provider>
    );
};

export const useGlobalDragDrop = () => {
    const context = useContext(GlobalDragDropContext);
    if (!context) {
        throw new Error('useGlobalDragDrop deve ser usado dentro de GlobalDragDropProvider');
    }
    return context;
};
