
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
  employeeSignaturePos: Coordinate;
  clientHighlightPos: Coordinate;
  createdAt: number;
}

export interface AppState {
  templates: ContractTemplate[];
  employeeSignature: string | null; // Base64 PNG
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PROCESS = 'PROCESS',
  TEMPLATES = 'TEMPLATES',
  SETTINGS = 'SETTINGS'
}
