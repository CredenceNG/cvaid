'use client';

'use client';


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WizardContainer } from './WizardContainer';
import { DownloadIcon } from './icons/DownloadIcon';

interface CoverLetterStepProps {
    coverLetter: string;
    onBack: () => void;
    onStartOver: () => void;
}

export const CoverLetterStep: React.FC<CoverLetterStepProps> = ({ coverLetter, onBack, onStartOver }) => {
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    const handlePdfDownload = async (content: string, filename: string) => {
        setIsDownloading(filename);
        try {
          const { jsPDF } = await import('jspdf');
          const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          const margin = 15;
          const pageWidth = doc.internal.pageSize.getWidth();
          const maxLineWidth = pageWidth - margin * 2;
          const baseFontSize = 11;
          const lineHeight = baseFontSize * 0.5;
          let y = margin;
    
          const checkPageBreak = (neededHeight: number) => {
            if (y + neededHeight > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin;
            }
          };
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(baseFontSize);
    
          for (const line of content.split('\n')) {
            if (line.trim() === '') { checkPageBreak(lineHeight); y += lineHeight; continue; }
            let text = line, currentFontSize = baseFontSize;
            doc.setFont('helvetica', line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ') ? 'bold' : 'normal');
            if (line.startsWith('# ')) { currentFontSize = 18; text = line.substring(2); }
            else if (line.startsWith('## ')) { currentFontSize = 16; text = line.substring(3); }
            else if (line.startsWith('### ')) { currentFontSize = 14; text = line.substring(4); }
            doc.setFontSize(currentFontSize);
            const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            if (isListItem) text = `• ${line.trim().substring(2)}`;
            const textLines = doc.splitTextToSize(text, maxLineWidth);
            const neededHeight = textLines.length * (currentFontSize * 0.5);
            checkPageBreak(neededHeight);
            doc.text(textLines, isListItem ? margin + 5 : margin, y);
            y += neededHeight;
          }
          doc.save(filename);
        } catch (error) {
          alert(error instanceof Error ? `Failed to generate PDF: ${error.message}` : "An unknown PDF generation error occurred.");
        } finally {
            setIsDownloading(null);
        }
      };
    
      const handleDocxDownload = async (content: string, filename: string) => {
        setIsDownloading(filename);
        try {
          const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
          const parseMarkdown = (text: string) => text.split('\n').map(line => {
            if (line.startsWith('# ')) return new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1 });
            if (line.startsWith('## ')) return new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2 });
            if (line.startsWith('### ')) return new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3 });
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) return new Paragraph({ text: line.trim().substring(2), bullet: { level: 0 } });
            if (line.trim() === '') return new Paragraph({ text: '' });
            const runs = line.split('**').map((part, i) => new TextRun({ text: part, bold: i % 2 !== 0 })).filter(p => p);
            return new Paragraph({ children: runs });
          });
          const doc = new Document({ sections: [{ children: parseMarkdown(content) }] });
          const blob = await Packer.toBlob(doc);
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
            alert(error instanceof Error ? `Failed to generate DOCX: ${error.message}` : "An unknown DOCX generation error occurred.");
        } finally {
            setIsDownloading(null);
        }
      };

    return (
        <WizardContainer title="Cover Letter Draft">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{coverLetter}</ReactMarkdown>
            <div className="flex items-center gap-2 flex-wrap justify-end my-6">
                <button disabled={!!isDownloading} onClick={() => handlePdfDownload(coverLetter, 'cover-letter.pdf')} className="inline-flex items-center gap-x-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-600 transition disabled:opacity-50" title="Download cover letter as PDF">
                    {isDownloading === 'cover-letter.pdf' ? 'Generating...' : <><DownloadIcon className="h-4 w-4" /> PDF</>}
                </button>
                <button disabled={!!isDownloading} onClick={() => handleDocxDownload(coverLetter, 'cover-letter.docx')} className="inline-flex items-center gap-x-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-600 transition disabled:opacity-50" title="Download cover letter as DOCX">
                    {isDownloading === 'cover-letter.docx' ? 'Generating...' : <><DownloadIcon className="h-4 w-4" /> DOCX</>}
                </button>
            </div>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:justify-start sm:items-center">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onBack}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 transition-all duration-200"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M18 10a.75.75 0 0 1-.75.75H4.66l2.1 1.95a.75.75 0 1 1-1.02 1.1l-3.5-3.25a.75.75 0 0 1 0-1.1l3.5-3.25a.75.75 0 1 1 1.02 1.1l-2.1 1.95h12.59A.75.75 0 0 1 18 10Z" clipRule="evenodd" />
                        </svg>
                        Back
                    </button>
                    <button
                        onClick={onStartOver}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 shadow-sm hover:bg-slate-700 transition-all duration-200"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 0 1 0 1.061L11.873 10l3.439 3.439a.75.75 0 1 1-1.06 1.06L10.812 11.06l-3.439 3.439a.75.75 0 1 1-1.06-1.06L9.752 10 6.313 6.561a.75.75 0 1 1 1.06-1.06L10.812 8.94l3.439-3.439a.75.75 0 0 1 1.061 0Z" clipRule="evenodd" />
                        </svg>
                        Start Over
                    </button>
                </div>
            </div>
        </WizardContainer>
    );
};
