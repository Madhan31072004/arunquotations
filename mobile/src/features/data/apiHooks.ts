import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_URL } from '@/lib/constants';

// --- Clients ---
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients');
      return data;
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientData: any) => {
      const { data } = await api.post('/clients', clientData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/clients/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/clients/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// --- Materials ---
export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data } = await api.get('/materials');
      return data;
    },
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (materialData: any) => {
      const { data } = await api.post('/materials', materialData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/materials/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

// --- Quotations ---
export const useQuotations = () => {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data } = await api.get('/quotations');
      return data;
    },
  });
};

export const useQuotation = (id: string) => {
  return useQuery({
    queryKey: ['quotations', id],
    queryFn: async () => {
      const { data } = await api.get(`/quotations/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationData: any) => {
      const { data } = await api.post('/quotations', quotationData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/quotations/${id}`, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', data._id] });
    },
  });
};

export const useSendQuotationEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { html: string; toEmail: string } }) => {
      const res = await api.post(`/quotations/${id}/send-email`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', variables.id] });
    },
  });
};

// --- Dashboard ---
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Simulate dashboard stats from various endpoints for now
      const [quotesRes, clientsRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/clients')
      ]);
      const quotes = quotesRes.data;
      const clients = clientsRes.data;
      
      const totalRevenue = clients.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0);
        
      const totalQuotes = quotes.length;
      const pendingQuotes = quotes.filter((q: any) => q.status === 'sent' || q.status === 'pending' || q.status === 'revised').length;
      const approvedQuotes = quotes.filter((q: any) => q.status === 'approved').length;
      const draftQuotes = quotes.filter((q: any) => q.status === 'draft').length;
      
      return {
        totalRevenue,
        totalQuotes,
        pendingQuotes,
        approvedQuotes,
        draftQuotes,
        activeClients: clients.length,
        recentQuotations: quotes.slice(0, 5),
      };
    },
  });
};

// --- Company Profile ---
export const useCompanyProfile = () => {
  return useQuery({
    queryKey: ['companyProfile'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data;
    },
  });
};

export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/company', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
    },
  });
};

// --- User Profile ---
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/auth/me', data);
      return res.data;
    },
  });
};

// --- Sessions (Device Management) ---
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await api.get('/auth/sessions');
      return data;
    },
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.delete(`/auth/sessions/${sessionId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/auth/sessions/all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// --- Password Change ---
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.put('/auth/change-password', data);
      return res.data;
    },
  });
};

// --- Server-side Logout ---
export const useServerLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/logout');
      return data;
    },
  });
};

// --- Notifications ---
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// --- Settings Export ---
export const useExportData = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/export');
      return data;
    },
  });
};

// ==========================================
// PUBLIC API (NO AUTH REQUIRED)
// ==========================================

export const usePublicQuotation = (id: string) => {
  return useQuery({
    queryKey: ['publicQuotation', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`${API_URL}/public/quotations/${id}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    enabled: !!id,
  });
};

export const useAcceptPublicQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/public/quotations/${id}/accept`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to accept quotation');
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['publicQuotation', id] });
    },
  });
};
