import React, { useState } from 'react';
import { FileNode } from '../types';

interface FileExplorerProps {
  structure: FileNode[];
  onSelectFile: (path: string) => void;
  selectedPath: string | null;
}

const FileItem: React.FC<{ 
  node: FileNode; 
  depth: number; 
  onSelect: (path: string) => void;
  selectedPath: string | null;
}> = ({ node, depth, onSelect, selectedPath }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else if (node.path) {
      onSelect(node.path);
    }
  };

  const isSelected = node.path === selectedPath;

  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 cursor-pointer text-sm select-none transition-colors
          ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-2 opacity-70">
          {node.type === 'folder' ? (isOpen ? '📂' : '📁') : '📄'}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileItem 
              key={`${child.name}-${idx}`} 
              node={child} 
              depth={depth + 1} 
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ structure, onSelectFile, selectedPath }) => {
  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Explorer</h2>
        <div className="text-xs text-gray-500 mt-1">my-cloudrepo</div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {structure.map((node, idx) => (
          <FileItem 
            key={idx} 
            node={node} 
            depth={0} 
            onSelect={onSelectFile}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
};
