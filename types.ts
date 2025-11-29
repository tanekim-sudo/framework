import { LucideIcon } from 'lucide-react';

export type BlockCategory = 'Discovery' | 'Analysis' | 'Recommendations' | 'Implementation' | 'Evaluation';

export interface PromptBlock {
  id: string;
  title: string;
  category: BlockCategory;
  description: string;
  iconName: string; // We'll map string to Lucide icon component
  defaultPrompt?: string;
  estimatedTime?: string;
  inputRequirements?: string[]; // e.g., ["Transcripts", "Financials"]
}

export interface WorkflowStep {
  id: string;
  blockId: string;
  customPrompt?: string;
  inputContext?: string[]; // Names of attached files/data
  status: 'pending' | 'running' | 'completed' | 'error';
  reasoningTrace?: string; // The "how I got here" log
  output?: string;
  timestamp?: Date;
  isExpanded?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  tags: string[];
  steps: WorkflowStep[];
  lastModified: Date;
}

export interface User {
  name: string;
  role: 'Partner' | 'Principal' | 'Associate';
  avatarUrl: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
}