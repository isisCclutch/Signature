
export interface Coordinate {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface ContractTemplate {
  id: string;
  companyName: string;
  description: string;
  employeeSignatures: Coordinate[];
  clientHighlights: Coordinate[];
  createdAt: number;
}

export interface ProcessedDocument {
  id: string;
  fileName: string;
  templateName: string;
  processedAt: number;
}

export interface AppState {
  templates: ContractTemplate[];
  employeeSignature: string | null; // Base64 PNG
  processedHistory: ProcessedDocument[];
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PROCESS = 'PROCESS',
  TEMPLATES = 'TEMPLATES',
  SETTINGS = 'SETTINGS'
}
