import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { LeadStatus } from '../types/crm';
import { LeadFormModal } from '../components/leads/LeadFormModal';
import { useToast } from '../components/common/Toast';
import { Plus, Kanban, Loader2 } from 'lucide-react';

export const PipelinePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leads', { limit: 100 }],
    queryFn: () => api.getLeads({ limit: 100 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) =>
      api.updateLeadStatus(leadId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast(`Lead moved to ${updated.status}`);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to move lead stage', 'error');
    },
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    statusMutation.mutate({ leadId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500 font-medium">Loading sales pipeline...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg">
        Failed to load pipeline: {(error as Error)?.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Kanban className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Pipeline</h2>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Drag and drop cards or use stage controls to advance opportunities
          </p>
        </div>

        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Kanban Board View */}
      <KanbanBoard leads={data.data} onStatusChange={handleStatusChange} />

      {/* Modal */}
      {isAddLeadModalOpen && (
        <LeadFormModal
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
        />
      )}
    </div>
  );
};
