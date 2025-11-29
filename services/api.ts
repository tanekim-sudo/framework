import axios, { AxiosInstance } from 'axios';

// Use relative URL when served from same origin, or absolute for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // ==================== Authentication ====================
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  register: async (email: string, password: string, name: string, organizationName?: string) => {
    const response = await axiosInstance.post('/auth/register', {
      email,
      password,
      name,
      organization_name: organizationName,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  switchTeam: async (teamId: string) => {
    const response = await axiosInstance.post('/auth/switch-team', { team_id: teamId });
    return response.data;
  },

  joinTeam: async (inviteCode: string) => {
    const response = await axiosInstance.post('/auth/join-team', { invite_code: inviteCode });
    return response.data;
  },

  createInvite: async (teamId: string) => {
    const response = await axiosInstance.post('/auth/create-invite', { team_id: teamId });
    return response.data;
  },

  // ==================== Blocks API ====================
  listBlocks: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        const value = typeof filters[key] === 'boolean' 
          ? (filters[key] ? 'true' : 'false')
          : filters[key];
        params.append(key, String(value));
      }
    });
    const response = await axiosInstance.get(`/smooth/blocks?${params.toString()}`);
    return response.data;
  },

  getBlock: async (blockId: string) => {
    const response = await axiosInstance.get(`/smooth/blocks/${blockId}`);
    return response.data;
  },

  createBlock: async (blockData: any) => {
    const response = await axiosInstance.post('/smooth/blocks', blockData);
    return response.data;
  },

  updateBlock: async (blockId: string, blockData: any) => {
    const response = await axiosInstance.put(`/smooth/blocks/${blockId}`, blockData);
    return response.data;
  },

  saveBlockAsCopy: async (blockId: string, blockData: any) => {
    const response = await axiosInstance.post(`/smooth/blocks/${blockId}/save-as-copy`, blockData);
    return response.data;
  },

  deleteBlock: async (blockId: string) => {
    const response = await axiosInstance.delete(`/smooth/blocks/${blockId}`);
    return response.data;
  },

  getBlockCategories: async () => {
    const response = await axiosInstance.get('/smooth/blocks/categories');
    return response.data;
  },

  copyBlockToPersonal: async (blockId: string) => {
    const response = await axiosInstance.post(`/smooth/blocks/${blockId}/copy-to-personal`, {});
    return response.data;
  },

  uploadBlockToTeam: async (blockId: string, teamId?: string) => {
    const response = await axiosInstance.post(`/smooth/blocks/${blockId}/upload-to-team`, { team_id: teamId });
    return response.data;
  },

  getTeamMembers: async () => {
    const response = await axiosInstance.get('/smooth/blocks/team-members');
    return response.data;
  },

  // ==================== Frameworks API ====================
  listFrameworks: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, String(filters[key]));
      }
    });
    const response = await axiosInstance.get(`/smooth/frameworks?${params.toString()}`);
    return response.data;
  },

  getFramework: async (frameworkId: string) => {
    const response = await axiosInstance.get(`/smooth/frameworks/${frameworkId}`);
    return response.data;
  },

  createFramework: async (frameworkData: any) => {
    const response = await axiosInstance.post('/smooth/frameworks', frameworkData);
    return response.data;
  },

  updateFramework: async (frameworkId: string, frameworkData: any) => {
    const response = await axiosInstance.put(`/smooth/frameworks/${frameworkId}`, frameworkData);
    return response.data;
  },

  saveFrameworkAsCopy: async (frameworkId: string, frameworkData: any) => {
    const response = await axiosInstance.post(`/smooth/frameworks/${frameworkId}/save-as-copy`, frameworkData);
    return response.data;
  },

  deleteFramework: async (frameworkId: string) => {
    const response = await axiosInstance.delete(`/smooth/frameworks/${frameworkId}`);
    return response.data;
  },

  // ==================== Flowise API ====================
  getFlowiseStatus: async () => {
    const response = await axiosInstance.get('/flowise/status');
    return response.data;
  },

  getFlowiseChatflows: async () => {
    const response = await axiosInstance.get('/flowise/chatflows');
    return response.data;
  },

  getFlowiseChatflow: async (chatflowId: string) => {
    const response = await axiosInstance.get(`/flowise/chatflows/${chatflowId}`);
    return response.data;
  },

  createFlowiseChatflow: async (chatflowData: any) => {
    const response = await axiosInstance.post('/flowise/chatflows', chatflowData);
    return response.data;
  },

  updateFlowiseChatflow: async (chatflowId: string, chatflowData: any) => {
    const response = await axiosInstance.put(`/flowise/chatflows/${chatflowId}`, chatflowData);
    return response.data;
  },

  executeFlowiseChatflow: async (chatflowId: string, inputs: Record<string, any> = {}, streaming = false) => {
    const response = await axiosInstance.post(`/flowise/chatflows/${chatflowId}/execute`, {
      inputs,
      stream: streaming,
    });
    return response.data;
  },

  cloneFlowiseChatflow: async (chatflowId: string, name?: string) => {
    const response = await axiosInstance.post(`/flowise/chatflows/${chatflowId}/clone`, { name });
    return response.data;
  },

  getFlowiseSSOToken: async (teamIds?: string[], role?: string) => {
    const response = await axiosInstance.post('/flowise/sso-token', { team_ids: teamIds, role });
    return response.data;
  },

  // ==================== Data Sources API ====================
  fetchDataSources: async (sources: string[] = ['gdrive', 'fireflies']) => {
    const response = await axiosInstance.post('/smooth/data/fetch', { sources });
    return response.data;
  },

  // ==================== Workflows API ====================
  listWorkflows: async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, String(filters[key]));
      }
    });
    const response = await axiosInstance.get(`/smooth/workflows?${params.toString()}`);
    return response.data;
  },

  getWorkflow: async (workflowId: string) => {
    const response = await axiosInstance.get(`/smooth/workflows/${workflowId}`);
    return response.data;
  },

  createWorkflow: async (workflowData: any) => {
    const response = await axiosInstance.post('/smooth/workflows', workflowData);
    return response.data;
  },

  updateWorkflow: async (workflowId: string, workflowData: any) => {
    const response = await axiosInstance.put(`/smooth/workflows/${workflowId}`, workflowData);
    return response.data;
  },

  deleteWorkflow: async (workflowId: string) => {
    const response = await axiosInstance.delete(`/smooth/workflows/${workflowId}`);
    return response.data;
  },

  executeWorkflow: async (workflowId: string, inputs: Record<string, any> = {}, projectId?: string) => {
    const response = await axiosInstance.post(`/smooth/workflows/${workflowId}/execute`, {
      inputs,
      project_id: projectId,
    });
    return response.data;
  },

  getExecution: async (executionId: string) => {
    const response = await axiosInstance.get(`/smooth/executions/${executionId}`);
    return response.data;
  },

  listExecutions: async (workflowId?: string, filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflow_id', workflowId);
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, String(filters[key]));
      }
    });
    const response = await axiosInstance.get(`/smooth/executions?${params.toString()}`);
    return response.data;
  },

  // ==================== Configuration API ====================
  getConfig: async () => {
    const response = await axiosInstance.get('/config');
    return response.data;
  },

  updateConfig: async (config: Record<string, any>) => {
    const response = await axiosInstance.post('/config', config);
    return response.data;
  },

  // ==================== Outputs API ====================
  listOutputs: async () => {
    const response = await axiosInstance.get('/outputs');
    return response.data;
  },

  getOutput: async (filename: string) => {
    const response = await axiosInstance.get(`/outputs/${filename}`);
    return response.data;
  },

  downloadOutput: (filename: string) => {
    window.open(`${API_BASE_URL}/outputs/${filename}/download`, '_blank');
  },

  clearOutputs: async () => {
    const response = await axiosInstance.delete('/outputs');
    return response.data;
  },

  uploadInput: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await axiosInstance.post('/inputs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ==================== AI Execution API ====================
  executeAI: async (prompt: string, contextData: string = '') => {
    const response = await axiosInstance.post('/ai/execute', {
      prompt,
      context_data: contextData,
    });
    return response.data;
  },

  generateBlock: async (intent: string) => {
    const response = await axiosInstance.post('/ai/generate-block', {
      intent,
    });
    return response.data;
  },
};

export default api;

