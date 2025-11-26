import React, { useState, useEffect, useCallback } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/CodeEditor';
import { PluginConfig, FileNode, GeneratedFile } from './types';
import { generateKotlinProvider } from './services/geminiService';
import { generateBuildGradle, generateWorkflows, generateReadme } from './utils/fileTemplates';

// Initial config based on user request
const INITIAL_CONFIG: PluginConfig = {
  author: 'hcgn2005-ai',
  repoName: 'my-cloudrepo',
  pluginName: 'Anikai',
  siteUrl: 'https://anikai.to/',
  lang: 'en',
  description: 'CloudStream provider for Anikai.to'
};

const App: React.FC = () => {
  const [config, setConfig] = useState<PluginConfig>(INITIAL_CONFIG);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [kotlinCode, setKotlinCode] = useState<string>("// Click 'Generate Plugin Code' to use AI to write the scraper.");
  const [showGuide, setShowGuide] = useState(false);

  // Re-generate structure when config changes
  useEffect(() => {
    const pkgPath = `com/${config.author.toLowerCase().replace(/[^a-z0-9]/g, '')}/${config.pluginName.toLowerCase()}`;
    const mainProviderPath = `app/src/main/java/${pkgPath}/${config.pluginName}Provider.kt`;

    const files: GeneratedFile[] = [
      {
        path: mainProviderPath,
        content: kotlinCode,
        language: 'kotlin'
      },
      {
        path: 'build.gradle.kts',
        content: generateBuildGradle(config),
        language: 'gradle'
      },
      {
        path: '.github/workflows/build.yml',
        content: generateWorkflows(config),
        language: 'yaml'
      },
      {
        path: 'README.md',
        content: generateReadme(config),
        language: 'text'
      }
    ];

    setGeneratedFiles(files);
    
    // Auto-select provider if nothing selected
    if (!selectedFilePath) {
      setSelectedFilePath(mainProviderPath);
    }
  }, [config, kotlinCode, selectedFilePath]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const code = await generateKotlinProvider(config);
      setKotlinCode(code);
      // Force select the provider file
      const pkgPath = `com/${config.author.toLowerCase().replace(/[^a-z0-9]/g, '')}/${config.pluginName.toLowerCase()}`;
      setSelectedFilePath(`app/src/main/java/${pkgPath}/${config.pluginName}Provider.kt`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Construct file tree for visualizer
  const getFileStructure = (): FileNode[] => {
    const pkgParts = config.author.toLowerCase().replace(/[^a-z0-9]/g, '').split('/');
    const providerPath = `app/src/main/java/com/${pkgParts.join('/')}/${config.pluginName.toLowerCase()}/${config.pluginName}Provider.kt`;
    
    return [
      {
        name: '.github',
        type: 'folder',
        children: [
            { name: 'workflows', type: 'folder', children: [
                { name: 'build.yml', type: 'file', path: '.github/workflows/build.yml' }
            ]}
        ]
      },
      {
        name: 'app',
        type: 'folder',
        children: [
            { name: 'src', type: 'folder', children: [
                { name: 'main', type: 'folder', children: [
                    { name: 'java', type: 'folder', children: [
                        { name: 'com', type: 'folder', children: [
                            { name: config.author.toLowerCase(), type: 'folder', children: [
                                { name: config.pluginName.toLowerCase(), type: 'folder', children: [
                                    { name: `${config.pluginName}Provider.kt`, type: 'file', path: providerPath }
                                ]}
                            ]}
                        ]}
                    ]}
                ]}
            ]},
            { name: 'build.gradle.kts', type: 'file', path: 'build.gradle.kts' }
        ]
      },
      { name: 'README.md', type: 'file', path: 'README.md' }
    ];
  };

  const selectedFile = generatedFiles.find(f => f.path === selectedFilePath);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            CS
          </div>
          <h1 className="text-xl font-bold tracking-tight">CloudStream Plugin Forge</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            {showGuide ? 'Hide Guide' : 'GitHub Export Guide'}
          </button>
          <button 
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-all shadow-lg 
              ${isGenerating ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25'}`}
          >
            {isGenerating ? 'AI Writing Code...' : 'Generate Provider Code'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Config & Explorer */}
        <div className="w-80 flex flex-col border-r border-gray-700 bg-gray-900 shrink-0">
          
          {/* Config Form */}
          <div className="p-4 border-b border-gray-700 space-y-4 overflow-y-auto max-h-[50%]">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Configuration</h2>
            
            <div className="space-y-1">
              <label className="text-xs text-gray-500">GitHub Username</label>
              <input 
                type="text" 
                value={config.author}
                onChange={(e) => setConfig({...config, author: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Repo Name</label>
              <input 
                type="text" 
                value={config.repoName}
                onChange={(e) => setConfig({...config, repoName: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Plugin Name</label>
              <input 
                type="text" 
                value={config.pluginName}
                onChange={(e) => setConfig({...config, pluginName: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Site URL</label>
              <input 
                type="text" 
                value={config.siteUrl}
                onChange={(e) => setConfig({...config, siteUrl: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* File Tree */}
          <div className="flex-1 overflow-hidden">
            <FileExplorer 
              structure={getFileStructure()} 
              onSelectFile={setSelectedFilePath}
              selectedPath={selectedFilePath}
            />
          </div>
        </div>

        {/* Center: Code Viewer or Guide */}
        <div className="flex-1 flex flex-col bg-gray-950 relative">
          {showGuide ? (
             <div className="p-8 max-w-3xl mx-auto overflow-y-auto h-full text-gray-300">
                <h2 className="text-2xl font-bold text-white mb-6">How to Push to GitHub</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-2">1. Initialize Local Directory</h3>
                    <p className="mb-4 text-sm">Open your terminal and create the folder structure manually or via script, then paste the code generated in this tool into the respective files.</p>
                    <pre className="bg-black p-4 rounded text-sm font-mono text-green-400 overflow-x-auto">
{`mkdir ${config.repoName}
cd ${config.repoName}
git init`}
                    </pre>
                  </div>

                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-2">2. Commit Files</h3>
                    <p className="mb-4 text-sm">After creating the files shown in the Explorer sidebar:</p>
                    <pre className="bg-black p-4 rounded text-sm font-mono text-green-400 overflow-x-auto">
{`git add .
git commit -m "Initial commit of ${config.pluginName} plugin"`}
                    </pre>
                  </div>

                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-2">3. Push to GitHub</h3>
                    <p className="mb-4 text-sm">Ensure you have created the repository <strong>{config.author}/{config.repoName}</strong> on GitHub first.</p>
                    <pre className="bg-black p-4 rounded text-sm font-mono text-green-400 overflow-x-auto">
{`git branch -M main
git remote add origin https://github.com/${config.author}/${config.repoName}.git
git push -u origin main`}
                    </pre>
                  </div>

                  <p className="text-sm text-yellow-500">
                    Note: The CloudStream repository system works via GitHub Actions. The workflow file included (`build.yml`) will automatically build the `.cs3` extension file when you push.
                  </p>
                </div>
             </div>
          ) : (
            selectedFile ? (
              <CodeEditor 
                code={selectedFile.content} 
                language={selectedFile.language} 
                filename={selectedFile.path} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a file from the explorer to view content
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
