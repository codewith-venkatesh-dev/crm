import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatusBadge, SourceBadge, FollowUpStatusBadge } from '../components/common/Badge';
import { LeadFormModal } from '../components/leads/LeadFormModal';
import { FollowUpModal } from '../components/leads/FollowUpModal';
import { NoteModal } from '../components/leads/NoteModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import { LeadStatus, FollowUp } from '../types/crm';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  History,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingFollowUpId, setDeletingFollowUpId] = useState<string | null>(null);

  const { data: lead, isLoading, isError, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.getLeadById(id!),
    enabled: Boolean(id),
  });

  const deleteLeadMutation = useMutation({
    mutationFn: () => api.deleteLead(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Lead deleted successfully');
      navigate('/leads');
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to delete lead', 'error');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: LeadStatus) => api.updateLeadStatus(id!, newStatus),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast(`Status updated to ${updated.status}`);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to update status', 'error');
    },
  });

  const toggleFollowUpMutation = useMutation({
    mutationFn: (followUpId: string) => api.toggleFollowUpCompletion(followUpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Follow-up status updated');
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to toggle follow-up', 'error');
    },
  });

  const deleteFollowUpMutation = useMutation({
    mutationFn: (followUpId: string) => api.deleteFollowUp(followUpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Follow-up deleted');
      setDeletingFollowUpId(null);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to delete follow-up', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500 font-medium">Loading lead details...</p>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl">
        <h3 className="font-bold text-base mb-1">Lead Not Found</h3>
        <p className="text-sm mb-4">{(error as Error)?.message || 'The requested lead does not exist.'}</p>
        <Link
          to="/leads"
          className="inline-flex items-center gap-1 text-sm font-semibold text-rose-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Leads Directory</span>
        </Link>
      </div>
    );
  }

  const upcomingFollowUps = lead.followUps?.filter((f) => !f.isCompleted) || [];
  const completedFollowUps = lead.followUps?.filter((f) => f.isCompleted) || [];

  return (
    <div className="space-y-6">
      {/* Back Button & Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/leads"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leads</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{lead.name}</h2>
            <StatusBadge status={lead.status} size="lg" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Add Note</span>
          </button>
          <button
            onClick={() => {
              setEditingFollowUp(null);
              setIsFollowUpModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Add Follow-up</span>
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="w-4 h-4 text-slate-600" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Lead Info & Follow-ups, Right side Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Lead Info & Follow-ups) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Lead Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 uppercase tracking-wider text-slate-500">
              Lead Overview
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Company Name</span>
                <span className="font-medium text-slate-800 flex items-center mt-0.5">
                  <Building className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  {lead.companyName || <span className="text-slate-400 italic">Not provided</span>}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium">Email Address</span>
                <span className="font-medium text-slate-800 flex items-center mt-0.5">
                  <Mail className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium">Phone Number</span>
                <span className="font-medium text-slate-800 flex items-center mt-0.5">
                  <Phone className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                  {lead.phone || <span className="text-slate-400 italic">Not provided</span>}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium">Lead Source</span>
                <div className="mt-1">
                  <SourceBadge source={lead.source} />
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium">Stage Quick Selector</span>
                <select
                  value={lead.status}
                  onChange={(e) => statusMutation.mutate(e.target.value as LeadStatus)}
                  className="mt-1 w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="CLOSED">Closed</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Created: {format(new Date(lead.createdAt), 'MMM d, yyyy')}</span>
                <span>Updated: {format(new Date(lead.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>

            {lead.notes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 block font-medium mb-1">
                  Notes / Description
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          {/* Follow-up Reminders Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
                Follow-ups ({lead.followUps?.length || 0})
              </h3>
              <button
                onClick={() => {
                  setEditingFollowUp(null);
                  setIsFollowUpModalOpen(true);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {upcomingFollowUps.length === 0 && completedFollowUps.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No follow-ups scheduled for this lead.
                </p>
              ) : (
                <>
                  {/* Pending/Upcoming Follow-ups */}
                  {upcomingFollowUps.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleFollowUpMutation.mutate(item.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Mark Completed"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-xs">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingFollowUp(item);
                              setIsFollowUpModalOpen(true);
                            }}
                            className="text-slate-400 hover:text-amber-600 p-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingFollowUpId(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <FollowUpStatusBadge dueDate={item.dueDate} isCompleted={false} />
                        <span className="text-slate-500 font-medium">
                          {format(new Date(item.dueDate), 'MMM d, yyyy')}
                          {item.dueTime ? ` @ ${item.dueTime}` : ''}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Completed Follow-ups */}
                  {completedFollowUps.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 block mb-2">
                        Completed ({completedFollowUps.length})
                      </span>
                      {completedFollowUps.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs flex items-center justify-between mb-2 opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFollowUpMutation.mutate(item.id)}
                              className="text-emerald-600"
                              title="Re-open task"
                            >
                              <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                            </button>
                            <span className="line-through text-slate-600 font-medium">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-700">Done</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Activity Stream */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Activity Timeline</h3>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            {/* Timeline Stream */}
            {!lead.activities || lead.activities.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No activity recorded for this lead yet.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {lead.activities.map((act) => {
                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Bullet */}
                      <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-sm" />

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                            {act.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {format(new Date(act.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                          {act.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <LeadFormModal
          isOpen={isEditModalOpen}
          lead={lead}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isFollowUpModalOpen && (
        <FollowUpModal
          isOpen={isFollowUpModalOpen}
          leadId={lead.id}
          followUp={editingFollowUp}
          onClose={() => {
            setIsFollowUpModalOpen(false);
            setEditingFollowUp(null);
          }}
        />
      )}

      {isNoteModalOpen && (
        <NoteModal
          isOpen={isNoteModalOpen}
          leadId={lead.id}
          onClose={() => setIsNoteModalOpen(false)}
        />
      )}

      {isDeleteConfirmOpen && (
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => deleteLeadMutation.mutate()}
          title="Delete Lead"
          message={`Are you sure you want to permanently delete "${lead.name}"? This action cannot be undone.`}
          confirmText="Delete Lead"
          isLoading={deleteLeadMutation.isPending}
        />
      )}

      {deletingFollowUpId && (
        <ConfirmDialog
          isOpen={Boolean(deletingFollowUpId)}
          onClose={() => setDeletingFollowUpId(null)}
          onConfirm={() => deleteFollowUpMutation.mutate(deletingFollowUpId)}
          title="Delete Follow-up"
          message="Are you sure you want to delete this follow-up reminder?"
          confirmText="Delete"
          isLoading={deleteFollowUpMutation.isPending}
        />
      )}
    </div>
  );
};
