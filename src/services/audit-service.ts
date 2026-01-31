import { AuditLog } from '@/types';

// Mock DB for Audit Logs
let MOCK_AUDIT_LOGS: AuditLog[] = [];

export const auditService = {
    logChange: async (
        adminId: string,
        targetEntryId: string,
        action: 'UPDATE' | 'DELETE',
        changes: { field: string; before: any; after: any }[]
    ): Promise<void> => {
        const logEntry: AuditLog = {
            id: 'audit_' + Date.now(),
            adminId,
            targetEntryId,
            action,
            changes,
            timestamp: new Date().toISOString(),
        };

        MOCK_AUDIT_LOGS.push(logEntry);
        console.log('[Audit Log Created]', logEntry);

        // Persist to local storage if in browser
        if (typeof window !== 'undefined') {
            localStorage.setItem('audit_logs', JSON.stringify(MOCK_AUDIT_LOGS));
        }
    },

    getLogs: async (): Promise<AuditLog[]> => {
        // Sync from storage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('audit_logs');
            if (stored) MOCK_AUDIT_LOGS = JSON.parse(stored);
        }
        return MOCK_AUDIT_LOGS.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
};
