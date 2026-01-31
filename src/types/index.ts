export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  startTime: string; // ISO string (UTC)
  endTime: string | null; // ISO string (UTC)
}

export interface AuditLog {
  id: string;
  adminId: string;
  targetEntryId: string;
  action: 'UPDATE' | 'CREATE' | 'DELETE';
  changes: {
    field: string;
    before: any;
    after: any;
  }[];
  timestamp: string; // ISO string (UTC)
}

export interface MonthlyReport {
  userId: string;
  userName: string;
  year: number;
  month: number;
  totalHours: number;
  daysWorked: number;
}
