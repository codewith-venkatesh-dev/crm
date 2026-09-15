import React from 'react';
import { LeadStatus, LeadSource, FollowUpType } from '../../types/crm';
import {
  Globe,
  Users,
  Linkedin,
  Mail,
  MessageSquare,
  Phone,
  Megaphone,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
    NEW: {
      label: 'New',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    CONTACTED: {
      label: 'Contacted',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    NEGOTIATING: {
      label: 'Negotiating',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    LOST: {
      label: 'Lost',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
  };

  const config = styles[status] || styles.NEW;
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {config.label}
    </span>
  );
};

interface SourceBadgeProps {
  source: LeadSource;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const getSourceIcon = (src: LeadSource) => {
    switch (src) {
      case 'WEBSITE':
        return <Globe className="w-3 h-3 mr-1 text-slate-500" />;
      case 'REFERRAL':
        return <Users className="w-3 h-3 mr-1 text-slate-500" />;
      case 'LINKEDIN':
        return <Linkedin className="w-3 h-3 mr-1 text-slate-500" />;
      case 'COLD_EMAIL':
        return <Mail className="w-3 h-3 mr-1 text-slate-500" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3 h-3 mr-1 text-slate-500" />;
      case 'PHONE_CALL':
        return <Phone className="w-3 h-3 mr-1 text-slate-500" />;
      case 'ADVERTISEMENT':
        return <Megaphone className="w-3 h-3 mr-1 text-slate-500" />;
      default:
        return <HelpCircle className="w-3 h-3 mr-1 text-slate-400" />;
    }
  };

  const formatSource = (src: string) => {
    return src
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
      {getSourceIcon(source)}
      {formatSource(source)}
    </span>
  );
};

interface FollowUpStateBadgeProps {
  dueDate: string;
  isCompleted: boolean;
}

export const FollowUpStatusBadge: React.FC<FollowUpStateBadgeProps> = ({
  dueDate,
  isCompleted,
}) => {
  if (isCompleted) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Completed
      </span>
    );
  }

  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  if (dueDay < startOfToday) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Overdue
      </span>
    );
  }

  if (dueDay.getTime() === startOfToday.getTime()) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3 mr-1" />
        Due Today
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      <Calendar className="w-3 h-3 mr-1" />
      Upcoming
    </span>
  );
};

interface FollowUpTypeBadgeProps {
  type: FollowUpType;
}

export const FollowUpTypeBadge: React.FC<FollowUpTypeBadgeProps> = ({ type }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
      {type}
    </span>
  );
};
