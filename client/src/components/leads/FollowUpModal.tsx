import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { FollowUp, FollowUpType } from '../../types/crm';
import { useToast } from '../common/Toast';
import { Loader2 } from 'lucide-react';

const followUpSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  dueDate: z.string().min(1, 'Due date is required'),
  dueTime: z.string().optional().nullable(),
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'WHATSAPP', 'TASK', 'OTHER']),
  assignedToId: z.string().optional().nullable(),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  followUp?: FollowUp | null;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  leadId,
  followUp,
}) => {
  const isEditing = Boolean(followUp);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });

  const defaultDateStr = followUp
    ? new Date(followUp.dueDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      title: followUp?.title || '',
      description: followUp?.description || '',
      dueDate: defaultDateStr,
      dueTime: followUp?.dueTime || '10:00',
      type: (followUp?.type as FollowUpType) || 'TASK',
      assignedToId: followUp?.assignedToId || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FollowUpFormData) => {
      if (isEditing && followUp) {
        return api.updateFollowUp(followUp.id, data as Partial<FollowUp>);
      }
      return api.createFollowUp(leadId, data);
    },
    onSuccess: (resFollowUp) => {
      queryClient.setQueryData(['lead', leadId], (old: any) => {
        if (!old) return old;
        const existing = old.followUps || [];
        const exists = existing.some((f: any) => f.id === resFollowUp.id);
        const updatedFollowUps = exists
          ? existing.map((f: any) => (f.id === resFollowUp.id ? resFollowUp : f))
          : [...existing, resFollowUp];
        return {
          ...old,
          followUps: updatedFollowUps,
        };
      });

      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast(
        isEditing
          ? 'Follow-up updated successfully'
          : 'Follow-up reminder scheduled successfully'
      );
      onClose();
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to save follow-up', 'error');
    },
  });

  const onSubmit = (data: FollowUpFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Follow-up Reminder' : 'Schedule Follow-up'}
      subtitle="Set a reminder date, interaction type, and assigned team member"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Follow-up Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Call to discuss proposal specs"
            {...register('title')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              errors.title
                ? 'border-rose-300 focus:ring-rose-500'
                : 'border-slate-300 focus:ring-indigo-500'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Type & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="CALL">Call</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="TASK">Task</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                errors.dueDate
                  ? 'border-rose-300 focus:ring-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500'
              }`}
            />
            {errors.dueDate && (
              <p className="text-xs text-rose-600 mt-1">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        {/* Assign To & Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assign Follow-up To
            </label>
            <select
              {...register('assignedToId')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">(Self / Default)</option>
              {users?.map((usr) => (
                <option key={usr.id} value={usr.id}>
                  {usr.name} ({usr.userRight === 1 ? 'Super Admin' : 'Agent'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Due Time (Optional)
            </label>
            <input
              type="time"
              {...register('dueTime')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description / Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Add details about what needs to be covered..."
            {...register('description')}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditing ? 'Save Changes' : 'Schedule Reminder'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
