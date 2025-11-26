import React from 'react';

interface CodeEditorProps {
  code: string;
  language: string;
  filename: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, filename }) => {
  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-gray-300">{filename}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400 uppercase">{language}</span>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
        >
          Copy Content
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 relative">
        <pre className="font-mono text-sm leading-relaxed text-gray-300 tab-4">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
