export interface PluginConfig {
  author: string;
  repoName: string;
  pluginName: string;
  siteUrl: string;
  lang: string;
  description: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: 'kotlin' | 'json' | 'yaml' | 'gradle' | 'text';
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path?: string; // Full path for file lookup
}
