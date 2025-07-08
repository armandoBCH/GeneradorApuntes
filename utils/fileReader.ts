import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';

// Set workerSrc to point to the CDN location
try {
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;
} catch (error) {
    console.error("Failed to set PDF.js worker source:", error);
}

export const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;

    if (fileType === 'text/plain' || fileType === 'text/markdown') {
        return file.text();
    }

    if (fileType === 'application/pdf') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (!event.target?.result) {
                    return reject(new Error('Error reading file content.'));
                }
                
                const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
                
                try {
                    const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                        fullText += pageText + '\n\n'; // Add space between pages
                    }
                    resolve(fullText.trim());
                } catch (error) {
                    console.error('Error parsing PDF:', error);
                    reject(new Error('No se pudo procesar el archivo PDF. Asegúrate de que no esté dañado o protegido.'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsArrayBuffer(file);
        });
    }

    throw new Error(`Unsupported file type: ${fileType}. Please upload a .pdf, .txt, or .md file.`);
};