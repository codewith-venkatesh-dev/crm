import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { ActivityType } from '../../types/crm';
import { useToast } from '../common/Toast';
import { Loader2 } from 'lucide-react';

const noteSchema = z.object({
  type: z.enum(['NOTE', 'CALL', 'EMAIL', 'MEETING', 'WHATSAPP']),
  content: z.string().min(1, 'Note content cannot be empty'),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, leadId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      type: 'NOTE',
      content: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: NoteFormData) => api.createActivity(leadId, data),
    onSuccess: (newActivity) => {
      queryClient.setQueryData(['lead', leadId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          activities: [newActivity, ...(old.activities || [])],
        };
      });

      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast('Note recorded in activity timeline');
      onClose();
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to record note', 'error');
    },
  });

  const onSubmit = (data: NoteFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Interaction Note"
      subtitle="Log a call summary, email update, meeting outcome, or general note"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Interaction Type <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="NOTE">General Note</option>
            <option value="CALL">Phone Call</option>
            <option value="EMAIL">Email Exchange</option>
            <option value="MEETING">Meeting Summary</option>
            <option value="WHATSAPP">WhatsApp Message</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Note Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Type key discussion points, requirements, or next steps..."
            {...register('content')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              errors.content
                ? 'border-rose-300 focus:ring-rose-500'
                : 'border-slate-300 focus:ring-indigo-500'
            }`}
          />
          {errors.content && (
            <p className="text-xs text-rose-600 mt-1">{errors.content.message}</p>
          )}
        </div>

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
            <span>Log Interaction</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
