import {
  Lead,
  LeadFilters,
  PaginatedLeads,
  FollowUp,
  Activity,
  DashboardData,
  User,
} from '../types/crm';

const API_BASE_URL = import.meta.env.BACKEND_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('crm_jwt_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    if (res.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('crm_jwt_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    const errorMsg =
      json.errors?.[0]?.message || json.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return json;
}

export const api = {
  // Auth APIs
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await fetchJson<{ success: boolean; data: { token: string; user: User } }>(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await fetchJson<{ success: boolean; data: User }>(`${API_BASE_URL}/auth/me`);
    return res.data;
  },

  // User Management APIs
  getUsers: async (): Promise<User[]> => {
    const res = await fetchJson<{ success: boolean; data: User[] }>(`${API_BASE_URL}/users`);
    return res.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    userRight: number;
  }): Promise<User> => {
    const res = await fetchJson<{ success: boolean; message: string; data: User }>(
      `${API_BASE_URL}/users`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  updateUser: async (id: string, data: Partial<User> & { password?: string }): Promise<User> => {
    const res = await fetchJson<{ success: boolean; message: string; data: User }>(
      `${API_BASE_URL}/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await fetchJson<{ success: boolean; message: string }>(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
  },

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
      assignedToId?: string | null;
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

  toggleFollowUpCompletion: async (
    id: string,
    completionNote?: string
  ): Promise<FollowUp> => {
    const res = await fetchJson<{ success: boolean; message: string; data: FollowUp }>(
      `${API_BASE_URL}/follow-ups/${id}/complete`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completionNote }),
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
