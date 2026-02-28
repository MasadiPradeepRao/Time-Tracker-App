import { AuditLog } from '@/types';
import { supabase } from '@/lib/supabase';

export const auditService = {
    logChange: async (
        adminId: string,
        targetUserId: string,
        targetEntryId: string,
        action: string,
        changes: { field: string; before: any; after: any }[]
    ): Promise<void> => {
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                admin_id: adminId,
                target_user_id: targetUserId,
                target_entry_id: targetEntryId,
                action,
                changes
            });

        if (error) {
            console.error('[Audit Log Error]', error);
            throw error;
        }
    },

    getLogs: async (): Promise<AuditLog[]> => {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
                *,
                admin:profiles!admin_id(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(log => ({
            id: log.id,
            adminId: log.admin_id,
            targetUserId: log.target_user_id,
            targetEntryId: log.target_entry_id,
            action: log.action,
            changes: log.changes,
            timestamp: log.created_at,
            adminName: log.admin?.name || 'Unknown Admin'
        }));
    },

    getUserLogs: async (userId: string): Promise<AuditLog[]> => {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
                *,
                admin:profiles!admin_id(name)
            `)
            .eq('target_user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(log => ({
            id: log.id,
            adminId: log.admin_id,
            targetUserId: log.target_user_id,
            targetEntryId: log.target_entry_id,
            action: log.action,
            changes: log.changes,
            timestamp: log.created_at,
            adminName: log.admin?.name || 'Unknown Admin'
        }));
    }
};
