import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Lead, LeadFilters, LeadStatus, FollowUp } from '../types/crm';
import { StatusBadge, SourceBadge, FollowUpStatusBadge } from '../components/common/Badge';
import { LeadFormModal } from '../components/leads/LeadFormModal';
import { FollowUpOutcomeModal } from '../components/leads/FollowUpOutcomeModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building,
  Mail,
  Phone,
  Loader2,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

export const LeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'upcoming' | 'overdue' | 'none'>(
    'all'
  );
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [completingFollowUp, setCompletingFollowUp] = useState<FollowUp | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filterParams: LeadFilters = {
    search: debouncedSearch,
    status: statusFilter,
    source: sourceFilter,
    followUpState: followUpFilter,
    sortBy,
    sortOrder,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leads', filterParams],
    queryFn: () => api.getLeads(filterParams),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Lead deleted successfully');
      setDeletingLead(null);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to delete lead', 'error');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      api.updateLeadStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast(`Status updated to ${updated.status}`);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to update status', 'error');
    },
  });

  const toggleFollowUpMutation = useMutation({
    mutationFn: ({ followUpId, completionNote }: { followUpId: string; completionNote?: string }) =>
      api.toggleFollowUpCompletion(followUpId, completionNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Follow-up marked as completed');
      setCompletingFollowUp(null);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to complete follow-up', 'error');
    },
  });

  const resetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setSourceFilter('ALL');
    setFollowUpFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Leads Directory</h2>
          <p className="text-sm text-slate-500">
            Search, filter, and manage potential customer contacts
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, company, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="CLOSED">Closed</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Sources</option>
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

          {/* Follow-up State Filter */}
          <div>
            <select
              value={followUpFilter}
              onChange={(e) => {
                setFollowUpFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Follow-up States</option>
              <option value="upcoming">Has Upcoming Follow-up</option>
              <option value="overdue">Overdue Follow-up</option>
              <option value="none">No Follow-up Scheduled</option>
            </select>
          </div>
        </div>

        {/* Reset Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Showing results {data ? data.pagination.total : 0} leads
            </span>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Table Data Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Loading leads...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 text-sm">
            Error loading leads: {(error as Error)?.message}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-base">No leads match criteria</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Try adjusting your search terms or filter parameters to find existing prospects.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      <span>Lead Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Next Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data?.data.map((lead) => {
                  const nextFollowUp = lead.followUps?.find((f) => !f.isCompleted);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Name & Company */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {lead.name}
                        </Link>
                        {lead.companyName && (
                          <div className="flex items-center text-xs text-slate-500 mt-0.5">
                            <Building className="w-3 h-3 mr-1 text-slate-400" />
                            <span>{lead.companyName}</span>
                          </div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {lead.email ? (
                          <div className="flex items-center mb-0.5">
                            <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                            <a href={`mailto:${lead.email}`} className="hover:underline">
                              {lead.email}
                            </a>
                          </div>
                        ) : null}
                        {lead.phone ? (
                          <div className="flex items-center text-slate-500">
                            <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                            <span>{lead.phone}</span>
                          </div>
                        ) : null}
                        {!lead.email && !lead.phone && (
                          <span className="text-slate-400 italic">No contact info</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <SourceBadge source={lead.source} />
                      </td>

                      {/* Status dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: lead.id,
                              status: e.target.value as LeadStatus,
                            })
                          }
                          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="NEGOTIATING">Negotiating</option>
                          <option value="CLOSED">Closed</option>
                          <option value="LOST">Lost</option>
                        </select>
                      </td>

                      {/* Next Follow Up with Quick Complete Action */}
                      <td className="py-3.5 px-4">
                        {nextFollowUp ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col gap-1 min-w-0">
                              <FollowUpStatusBadge
                                dueDate={nextFollowUp.dueDate}
                                isCompleted={nextFollowUp.isCompleted}
                              />
                              <span className="text-xs text-slate-500 truncate max-w-[140px]">
                                {nextFollowUp.title} ({format(new Date(nextFollowUp.dueDate), 'MMM d')})
                              </span>
                            </div>
                            <button
                              onClick={() => setCompletingFollowUp(nextFollowUp)}
                              className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded flex items-center gap-1 transition-all shrink-0"
                              title="Mark Follow-up Completed & Record Outcome Note"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Complete</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None scheduled</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                            title="View Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, data?.pagination?.totalPages || 1))
                }
                disabled={page >= (data?.pagination?.totalPages || 1)}
                className="p-1.5 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {isAddModalOpen && (
        <LeadFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <LeadFormModal
          isOpen={Boolean(editingLead)}
          lead={editingLead}
          onClose={() => setEditingLead(null)}
        />
      )}

      {/* Complete Follow Up Outcome Modal */}
      {completingFollowUp && (
        <FollowUpOutcomeModal
          isOpen={Boolean(completingFollowUp)}
          onClose={() => setCompletingFollowUp(null)}
          onConfirm={(note) =>
            toggleFollowUpMutation.mutate({
              followUpId: completingFollowUp.id,
              completionNote: note,
            })
          }
          title={completingFollowUp.title}
          isLoading={toggleFollowUpMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingLead && (
        <ConfirmDialog
          isOpen={Boolean(deletingLead)}
          onClose={() => setDeletingLead(null)}
          onConfirm={() => deleteMutation.mutate(deletingLead.id)}
          title="Delete Lead"
          message={`Are you sure you want to permanently delete "${deletingLead.name}"? This action will remove all related follow-ups and activity timeline logs.`}
          confirmText="Delete Lead"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};
