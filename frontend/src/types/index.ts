// src/types/index.ts

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  role?: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  userId?: string;
}
export interface PrintAgent {
  id: string;
  location: string;
  apiKey?: string;
  api_key?: string;
  createdAt?: string;
  updatedAt?: string;
}
export type PrinterStatus = 'active' | 'inactive' | 'offline' | 'maintenance';

export interface Printer {
  printerId: string;
  name: string;
  model: string;
  location: string;
  status: PrinterStatus;
  ipAddress: string;
  ip_address: string;
  agent_id: string;
  supportedFormats: string[];
  maxPages: number;
  currentQueue: number;
  tonerLevel?: number;
  paperTray?: string;
}

export type JobStatus = 'queued' | 'downloading' | 'printing' | 'completed' | 'failed' | 'cancelled';

export interface PrintJob {
  jobId: string;
  userId: string;
  printerId: string;
  printerName?: string;
  fileName?: string;
  status: JobStatus;
  copies: number;
  colorMode: 'color' | 'bw' | 'grayscale';
  pageRange?: string;
  startTime?: string;
  endTime?: string;
  pagesPrinted?: number;
}
