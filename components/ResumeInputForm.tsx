'use client';
import React, { useState, useCallback, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';

interface ResumeInputFormProps {
  resume: string;
  setResume: (value: string) => void;
  goals: string;
  setGoals: (value: string) => void;
  requirements: string;
  setRequirements: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isReadOnly: boolean;
}

// Helper to wait for a global library to be available on the window object
const waitForLibrary = <T,>(libraryName: string, timeout = 5000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = 100;

    const check = () => {
      const lib = (window as unknown as Record<string, T>)[libraryName];
      if (lib) {
        resolve(lib);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Library '${libraryName}' failed to load. Please check your network connection and refresh the page.`));
      } else {
        setTimeout(check, checkInterval);
      }
    };
    check();
  });
};

export const ResumeInputForm: React.FC<ResumeInputFormProps> = ({
  resume,
  setResume,
  goals,
  setGoals,
  requirements,
  setRequirements,
  onSubmit,
  isLoading,
  isReadOnly,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjsLib = await waitForLibrary<any>('pdfjsLib');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        text = await new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                try {
                    const typedArray = new Uint8Array(event.target!.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        fullText += content.items.map((item: { str: string }) => item.str).join(' ') + '\n';
                    }
                    resolve(fullText);
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = (e) => reject(e);
        });

      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mammoth = await waitForLibrary<any>('mammoth');
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        text = await new Promise((resolve, reject) => {
          reader.onload = async (event) => {
            try {
              const result = await mammoth.extractRawText({ arrayBuffer: event.target!.result });
              resolve(result.value);
            } catch(e) {
              reject(e);
            }
          };
          reader.onerror = (e) => reject(e);
        });

      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }
      setResume(text);
    } catch (error) {
      console.error('Failed to parse file:', error);
      if (error instanceof Error) {
          setParseError(error.message);
      } else {
          setParseError('Failed to parse file. Please ensure it is a valid PDF or DOCX.');
      }
    } finally {
      setIsParsing(false);
      // Reset file input to allow uploading the same file again
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [setResume]);

  const handleDragEnter = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRequirements(value);

    // Check if the input is a URL and show a warning
    if (/^\s*https?:\/\//.test(value)) {
      setUrlWarning("Pasting a URL is not supported. Please copy and paste the text of the job description instead.");
    } else {
      setUrlWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlWarning) return;
    onSubmit();
  };

  const spinner = (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Auto-collapse when readonly (after processing)
  React.useEffect(() => {
    if (isReadOnly && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isReadOnly, isCollapsed]);

  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700 transition-all duration-300 ${isReadOnly ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-xl font-semibold text-white">Your Information</h2>
        {isReadOnly && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-700/50"
            aria-label={isCollapsed ? "Expand form" : "Collapse form"}
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
      {!isCollapsed && (
        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          <div>
          <label htmlFor="resume" className="block text-sm font-medium text-slate-300 mb-2">
            Paste or Upload Your Resume
          </label>

          <div 
            className={`mt-2 flex justify-center rounded-lg border border-dashed ${isDragging ? 'border-cyan-400 bg-slate-800' : 'border-slate-600'} px-6 py-10 transition-colors relative ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isReadOnly && fileInputRef.current?.click()}
          >
            <div className="text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-slate-400">
                <span
                  className={`relative rounded-md font-semibold ${!isReadOnly ? 'text-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-cyan-300' : ''}`}
                >
                  <span>Upload a file</span>
                  <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept=".pdf,.docx" disabled={isLoading || isParsing || isReadOnly}/>
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-slate-500">PDF or DOCX</p>
            </div>
            {(isLoading || isParsing) && <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center rounded-lg"><svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
          </div>
          {parseError && <p className="mt-2 text-sm text-red-400">{parseError}</p>}

          <div className="relative mt-2">
            <textarea
              id="resume"
              name="resume"
              rows={10}
              className="block w-full rounded-md border-0 bg-slate-900/80 py-2 px-3 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 transition"
              placeholder="...or paste the full text of your resume here. Uploading a file will populate this field."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              disabled={isLoading || isParsing || isReadOnly}
            />
             {(isLoading || isParsing) && <div className="absolute inset-0 bg-slate-900/50 rounded-md"></div>}
          </div>
          </div>
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-slate-300 mb-2">
              Describe Your Next Job Goal
            </label>
            <input
              type="text"
              name="goals"
              id="goals"
              className="block w-full rounded-md border-0 bg-slate-900/80 py-2 px-3 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 transition"
              placeholder="e.g., 'Senior Frontend Developer at a SaaS company'"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              disabled={isLoading || isParsing || isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-slate-300 mb-2">
              Target Position Requirements <span className="text-slate-400">(Optional)</span>
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={8}
              className="block w-full rounded-md border-0 bg-slate-900/80 py-2 px-3 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 transition"
              placeholder="Paste the job description or key requirements here to get the best results."
              value={requirements}
              onChange={handleRequirementsChange}
              disabled={isLoading || isParsing || isReadOnly}
            />
            {urlWarning && <p className="mt-2 text-sm text-yellow-400">{urlWarning}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || isParsing || !resume.trim() || !goals.trim() || !!urlWarning || isReadOnly}
              className="inline-flex items-center gap-x-2 rounded-md bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  {spinner}
                  Analyzing...
                </>
              ) : isParsing ? (
                <>
                  {spinner}
                  Parsing File...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Generate Feedback
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};