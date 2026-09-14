import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatusBadge, SourceBadge } from '../components/common/Badge';
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
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboardSummary(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500 font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg">
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
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
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
      color: 'bg-purple-50 text-purple-600 border-purple-100',
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
      color: summary.overdueFollowUps > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200',
    },
    {
      label: 'Due Today',
      value: summary.dueTodayFollowUps,
      icon: Clock,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold tracking-tight">CRM Command Center</h2>
          <p className="text-slate-300 text-sm mt-1">
            Track lead progression, manage follow-up reminders, and execute deals efficiently.
          </p>
        </div>
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all shrink-0 active:scale-95"
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
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Leads & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Leads</h3>
                <p className="text-xs text-slate-500">Latest additions to your lead directory</p>
              </div>
              <Link
                to="/leads"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No recent leads found.</p>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                      >
                        {lead.name}
                      </Link>
                      {lead.companyName && (
                        <p className="text-xs text-slate-500">{lead.companyName}</p>
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

        {/* Upcoming Follow-ups Widget */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Upcoming & Overdue Tasks</h3>
                <p className="text-xs text-slate-500">Pending action items for active prospects</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingFollowUps.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No upcoming follow-ups scheduled.
                </p>
              ) : (
                upcomingFollowUps.map((item) => {
                  const isOverdue = new Date(item.dueDate) < new Date(new Date().setHours(0,0,0,0));

                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                          <span className="text-xs text-slate-400">({item.type})</span>
                        </div>
                        {item.lead && (
                          <Link
                            to={`/leads/${item.lead.id}`}
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            Lead: {item.lead.name} {item.lead.companyName ? `(${item.lead.companyName})` : ''}
                          </Link>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {format(new Date(item.dueDate), 'MMM d')}
                        </span>
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
    </div>
  );
};
