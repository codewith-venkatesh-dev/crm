import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatusBadge, SourceBadge } from '../components/common/Badge';
import { FollowUpOutcomeModal } from '../components/leads/FollowUpOutcomeModal';
import { useToast } from '../components/common/Toast';
import { FollowUp } from '../types/crm';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  PhoneCall,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { LeadFormModal } from '../components/leads/LeadFormModal';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [completingFollowUp, setCompletingFollowUp] = useState<FollowUp | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboardSummary(),
  });

  const toggleFollowUpMutation = useMutation({
    mutationFn: ({ followUpId, completionNote }: { followUpId: string; completionNote?: string }) =>
      api.toggleFollowUpCompletion(followUpId, completionNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast('Follow-up marked as completed');
      setCompletingFollowUp(null);
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to complete follow-up', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin mb-2" />
        <p className="text-sm text-[#64748B] font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
        Failed to load dashboard metrics: {(error as Error)?.message || 'Server connection error'}
      </div>
    );
  }

  const { summary, recentLeads, upcomingFollowUps } = data;

  const statCards = [
    {
      label: 'Total Leads',
      value: summary.totalLeads,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'New Leads',
      value: summary.newLeads,
      icon: UserPlus,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Contacted',
      value: summary.contactedLeads,
      icon: PhoneCall,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Negotiating',
      value: summary.negotiatingLeads,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Closed Deals',
      value: summary.closedLeads,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Overdue Follow-ups',
      value: summary.overdueFollowUps,
      icon: AlertCircle,
      color: summary.overdueFollowUps > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
    },
    {
      label: 'Due Today',
      value: summary.dueTodayFollowUps,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Neutral Banner Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E293B] text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">CRM Command Center</h2>
          <p className="text-slate-400 text-sm mt-1">
            Track lead progression, manage follow-up reminders, and execute deals efficiently.
          </p>
        </div>
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${card.color} bg-white shadow-sm flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1E293B] tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Leads & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div>
                <h3 className="font-bold text-[#1E293B] text-base">Recent Leads</h3>
                <p className="text-xs text-[#64748B]">Latest additions to your lead directory</p>
              </div>
              <Link
                to="/leads"
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-[#64748B] py-6 text-center">No recent leads found.</p>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-semibold text-[#1E293B] text-sm hover:text-[#4F46E5] transition-colors"
                      >
                        {lead.name}
                      </Link>
                      {lead.companyName && (
                        <p className="text-xs text-[#64748B]">{lead.companyName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <SourceBadge source={lead.source} />
                      <StatusBadge status={lead.status} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups Widget with Direct Mark Complete Button */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div>
                <h3 className="font-bold text-[#1E293B] text-base">Upcoming & Overdue Tasks</h3>
                <p className="text-xs text-[#64748B]">Pending action items for active prospects</p>
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {upcomingFollowUps.length === 0 ? (
                <p className="text-sm text-[#64748B] py-6 text-center">
                  No upcoming follow-ups scheduled.
                </p>
              ) : (
                upcomingFollowUps.map((item) => {
                  const isOverdue = new Date(item.dueDate) < new Date(new Date().setHours(0,0,0,0));

                  return (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1E293B] text-sm truncate">{item.title}</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] uppercase">
                            {item.type}
                          </span>
                        </div>
                        {item.lead && (
                          <Link
                            to={`/leads/${item.lead.id}`}
                            className="text-xs text-[#4F46E5] hover:underline block truncate mt-0.5"
                          >
                            Lead: {item.lead.name} {item.lead.companyName ? `(${item.lead.companyName})` : ''}
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded border ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {format(new Date(item.dueDate), 'MMM d')}
                        </span>

                        {/* Direct Mark Completed Button */}
                        <button
                          onClick={() => setCompletingFollowUp(item)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg flex items-center gap-1 transition-all shadow-xs active:scale-95"
                          title="Mark Completed & Record Outcome Note"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddLeadModalOpen && (
        <LeadFormModal
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
        />
      )}

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
    </div>
  );
};
