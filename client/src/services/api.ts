import {
  Lead,
  LeadFilters,
  PaginatedLeads,
  FollowUp,
  Activity,
  DashboardData,
} from '../types/crm';

const API_BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const errorMsg =
      json.errors?.[0]?.message || json.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return json;
}

export const api = {
  // Dashboard API
  getDashboardSummary: async (): Promise<DashboardData> => {
    const res = await fetchJson<{ success: boolean; data: DashboardData }>(
      `${API_BASE_URL}/dashboard/summary`
    );
    return res.data;
  },

  // Lead APIs
  getLeads: async (filters: LeadFilters = {}): Promise<PaginatedLeads> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.source && filters.source !== 'ALL') params.append('source', filters.source);
    if (filters.followUpState && filters.followUpState !== 'all')
      params.append('followUpState', filters.followUpState);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return fetchJson<PaginatedLeads>(`${API_BASE_URL}/leads?${params.toString()}`);
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const res = await fetchJson<{ success: boolean; data: Lead }>(`${API_BASE_URL}/leads/${id}`);
    return res.data;
  },

  createLead: async (data: Partial<Lead>): Promise<Lead> => {
    const res = await fetchJson<{ success: boolean; message: string; data: Lead }>(
      `${API_BASE_URL}/leads`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const res = await fetchJson<{ success: boolean; message: string; data: Lead }>(
      `${API_BASE_URL}/leads/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  updateLeadStatus: async (id: string, status: string): Promise<Lead> => {
    const res = await fetchJson<{ success: boolean; message: string; data: Lead }>(
      `${API_BASE_URL}/leads/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return res.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await fetchJson<{ success: boolean; message: string }>(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Follow-up APIs
  getLeadFollowUps: async (leadId: string): Promise<FollowUp[]> => {
    const res = await fetchJson<{ success: boolean; data: FollowUp[] }>(
      `${API_BASE_URL}/leads/${leadId}/follow-ups`
    );
    return res.data;
  },

  createFollowUp: async (
    leadId: string,
    data: {
      title: string;
      description?: string | null;
      dueDate: string;
      dueTime?: string | null;
      type: string;
    }
  ): Promise<FollowUp> => {
    const res = await fetchJson<{ success: boolean; message: string; data: FollowUp }>(
      `${API_BASE_URL}/leads/${leadId}/follow-ups`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  updateFollowUp: async (id: string, data: Partial<FollowUp>): Promise<FollowUp> => {
    const res = await fetchJson<{ success: boolean; message: string; data: FollowUp }>(
      `${API_BASE_URL}/follow-ups/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  toggleFollowUpCompletion: async (id: string): Promise<FollowUp> => {
    const res = await fetchJson<{ success: boolean; message: string; data: FollowUp }>(
      `${API_BASE_URL}/follow-ups/${id}/complete`,
      {
        method: 'PATCH',
      }
    );
    return res.data;
  },

  deleteFollowUp: async (id: string): Promise<void> => {
    await fetchJson<{ success: boolean; message: string }>(`${API_BASE_URL}/follow-ups/${id}`, {
      method: 'DELETE',
    });
  },

  // Activity APIs
  getLeadActivities: async (leadId: string): Promise<Activity[]> => {
    const res = await fetchJson<{ success: boolean; data: Activity[] }>(
      `${API_BASE_URL}/leads/${leadId}/activities`
    );
    return res.data;
  },

  createActivity: async (
    leadId: string,
    data: { type: string; content: string }
  ): Promise<Activity> => {
    const res = await fetchJson<{ success: boolean; message: string; data: Activity }>(
      `${API_BASE_URL}/leads/${leadId}/activities`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },
};
