'use client';

'use client';


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WizardContainer } from './WizardContainer';
import { DownloadIcon } from './icons/DownloadIcon';

interface RefinedCopyStepProps {
    refinedCopy: string;
    feedback: string;
    onBack: () => void;
    onNext: () => void;
    onStartOver: () => void;
}

export const RefinedCopyStep: React.FC<RefinedCopyStepProps> = ({ refinedCopy, feedback, onBack, onNext, onStartOver }) => {
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

          // Strip markdown formatting
          const stripMarkdown = (text: string): string => {
            return text
              .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
              .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
              .replace(/`(.*?)`/g, '$1')       // Remove inline code `text`
              .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links [text](url)
          };

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(baseFontSize);

          for (const line of content.split('\n')) {
            if (line.trim() === '') { checkPageBreak(lineHeight); y += lineHeight; continue; }
            let text = line, currentFontSize = baseFontSize;
            const isBold = line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ') || line.includes('**');
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            if (line.startsWith('# ')) { currentFontSize = 18; text = stripMarkdown(line.substring(2)); }
            else if (line.startsWith('## ')) { currentFontSize = 16; text = stripMarkdown(line.substring(3)); }
            else if (line.startsWith('### ')) { currentFontSize = 14; text = stripMarkdown(line.substring(4)); }
            else { text = stripMarkdown(line); }
            doc.setFontSize(currentFontSize);
            const isListItem = text.trim().startsWith('- ') || text.trim().startsWith('* ');
            if (isListItem) text = `• ${text.trim().substring(2)}`;
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
            // Handle headings
            if (line.startsWith('# ')) {
              return new Paragraph({
                text: line.substring(2).replace(/\*\*(.*?)\*\*/g, '$1'),
                heading: HeadingLevel.HEADING_1
              });
            }
            if (line.startsWith('## ')) {
              return new Paragraph({
                text: line.substring(3).replace(/\*\*(.*?)\*\*/g, '$1'),
                heading: HeadingLevel.HEADING_2
              });
            }
            if (line.startsWith('### ')) {
              return new Paragraph({
                text: line.substring(4).replace(/\*\*(.*?)\*\*/g, '$1'),
                heading: HeadingLevel.HEADING_3
              });
            }

            // Handle bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              const text = line.trim().substring(2);
              const parts = text.split(/(\*\*.*?\*\*)/);
              const runs = parts.map(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return new TextRun({ text: part.slice(2, -2), bold: true });
                }
                return new TextRun({ text: part });
              }).filter(run => run.text);

              return new Paragraph({ children: runs, bullet: { level: 0 } });
            }

            // Handle empty lines
            if (line.trim() === '') return new Paragraph({ text: '' });

            // Handle regular text with bold formatting
            const parts = line.split(/(\*\*.*?\*\*)/);
            const runs = parts.map(part => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return new TextRun({ text: part.slice(2, -2), bold: true });
              }
              return new TextRun({ text: part });
            }).filter(run => run.text);

            return new Paragraph({ children: runs.length > 0 ? runs : [new TextRun({ text: line })] });
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
        <WizardContainer title="Refined Resume Copy">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{refinedCopy}</ReactMarkdown>
            <div className="flex items-center gap-2 flex-wrap justify-end my-6">
                <button disabled={!!isDownloading} onClick={() => handlePdfDownload(feedback, 'resume-feedback.pdf')} className="inline-flex items-center gap-x-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-600 transition disabled:opacity-50" title="Download full feedback as PDF">
                    {isDownloading === 'resume-feedback.pdf' ? 'Generating...' : <><DownloadIcon className="h-4 w-4" /> Feedback PDF</>}
                </button>
                <button disabled={!!isDownloading} onClick={() => handlePdfDownload(refinedCopy, 'refined-resume.pdf')} className="inline-flex items-center gap-x-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-600 transition disabled:opacity-50" title="Download refined resume copy as PDF">
                    {isDownloading === 'refined-resume.pdf' ? 'Generating...' : <><DownloadIcon className="h-4 w-4" /> Copy PDF</>}
                </button>
                <button disabled={!!isDownloading} onClick={() => handleDocxDownload(feedback, 'resume-feedback.docx')} className="inline-flex items-center gap-x-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-600 transition disabled:opacity-50" title="Download full feedback as DOCX">
                    {isDownloading === 'resume-feedback.docx' ? 'Generating...' : <><DownloadIcon className="h-4 w-4" /> Feedback DOCX</>}
                </button>
                <button disabled={!!isDownloading} onClick={() => handleDocxDownload(refinedCopy, 'refined-resume.docx')} className="inline-flex items-center gap-x-1.5 rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-600 transition disabled:opacity-50" title="Download refined resume copy as DOCX">
                    {isDownloading === 'refined-resume.docx' ? 'Generating...' : <><DownloadIcon className="h-4 w-4" /> Copy DOCX</>}
                </button>
            </div>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
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
                <button
                    onClick={onNext}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all duration-200"
                >
                    Continue to Cover Letter
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M2 10a.75.75 0 0 1 .75-.75h12.59l-2.1-1.95a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.1-1.95H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </WizardContainer>
    );
};
