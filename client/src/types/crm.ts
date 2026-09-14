export type LeadStatus = 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'LOST';

export type LeadSource =
  | 'WEBSITE'
  | 'REFERRAL'
  | 'LINKEDIN'
  | 'COLD_EMAIL'
  | 'WHATSAPP'
  | 'PHONE_CALL'
  | 'ADVERTISEMENT'
  | 'OTHER';

export type FollowUpType = 'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'TASK' | 'OTHER';

export type ActivityType =
  | 'NOTE'
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'WHATSAPP'
  | 'STATUS_CHANGE'
  | 'SYSTEM';

export interface FollowUp {
  id: string;
  leadId: string;
  title: string;
  description?: string | null;
  dueDate: string;
  dueTime?: string | null;
  type: FollowUpType;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    companyName?: string | null;
    status: LeadStatus;
  };
}

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUps?: FollowUp[];
  activities?: Activity[];
  _count?: {
    followUps: number;
    activities: number;
  };
}

export interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  followUpState?: 'all' | 'upcoming' | 'overdue' | 'none';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardSummary {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  negotiatingLeads: number;
  closedLeads: number;
  lostLeads: number;
  overdueFollowUps: number;
  dueTodayFollowUps: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentLeads: Lead[];
  upcomingFollowUps: FollowUp[];
}

export interface PaginatedLeads {
  success: boolean;
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
