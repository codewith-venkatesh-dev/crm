import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { Lead, LeadSource, LeadStatus } from '../../types/crm';
import { useToast } from '../common/Toast';
import { Loader2 } from 'lucide-react';

const leadSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  companyName: z.string().optional().nullable(),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .nullable(),
  phone: z.string().optional().nullable(),
  source: z.enum(
    [
      'WEBSITE',
      'REFERRAL',
      'LINKEDIN',
      'COLD_EMAIL',
      'WHATSAPP',
      'PHONE_CALL',
      'ADVERTISEMENT',
      'OTHER',
    ],
    { required_error: 'Lead source is required' }
  ),
  status: z.enum(['NEW', 'CONTACTED', 'NEGOTIATING', 'CLOSED', 'LOST'], {
    required_error: 'Lead status is required',
  }),
  notes: z.string().optional().nullable(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  const isEditing = Boolean(lead);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: lead?.name || '',
      companyName: lead?.companyName || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      source: (lead?.source as LeadSource) || 'WEBSITE',
      status: (lead?.status as LeadStatus) || 'NEW',
      notes: lead?.notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: LeadFormData) => {
      if (isEditing && lead) {
        return api.updateLead(lead.id, data as Partial<Lead>);
      }
      return api.createLead(data as Partial<Lead>);
    },
    onSuccess: (updatedLead) => {
      queryClient.setQueryData(['lead', updatedLead.id], (old: any) => {
        if (!old) return updatedLead;
        return {
          ...old,
          ...updatedLead,
        };
      });

      queryClient.setQueriesData({ queryKey: ['leads'] }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData.data)) return oldData;
        const exists = oldData.data.some((l: any) => l.id === updatedLead.id);
        if (exists) {
          return {
            ...oldData,
            data: oldData.data.map((l: any) =>
              l.id === updatedLead.id ? { ...l, ...updatedLead } : l
            ),
          };
        }
        return {
          ...oldData,
          data: [updatedLead, ...oldData.data],
        };
      });

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', updatedLead.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast(
        isEditing
          ? `Lead "${updatedLead.name}" updated successfully`
          : `Lead "${updatedLead.name}" created successfully`
      );
      onClose();
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to save lead', 'error');
    },
  });

  const onSubmit = (data: LeadFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Lead Information' : 'Add New Lead'}
      subtitle={
        isEditing
          ? 'Update the lead details and pipeline status'
          : 'Enter new potential customer contact details'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Sarah Jenkins"
            {...register('name')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-rose-300 focus:ring-rose-500'
                : 'border-slate-300 focus:ring-indigo-500'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Company Name
          </label>
          <input
            type="text"
            placeholder="e.g. Apex Technologies"
            {...register('companyName')}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Contact info grid: Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. sarah@apex.io"
              {...register('email')}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-300 focus:ring-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. +1 (555) 000-0000"
              {...register('phone')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Select Grid: Source & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Lead Source <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('source')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="COLD_EMAIL">Cold Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PHONE_CALL">Phone Call</option>
              <option value="ADVERTISEMENT">Advertisement</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Pipeline Stage <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="CLOSED">Closed</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes / Initial Context
          </label>
          <textarea
            rows={3}
            placeholder="Add any specific context or notes..."
            {...register('notes')}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Actions */}
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
            <span>{isEditing ? 'Save Changes' : 'Create Lead'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
