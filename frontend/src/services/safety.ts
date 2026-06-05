import { API_ENDPOINTS } from '../constants/api';
import { api } from './api';
import { BlockedMember, CreateReportInput, SafetyReport } from '../types/api';

export const safetyService = {
  createReport: (input: CreateReportInput) => api.post<SafetyReport>(API_ENDPOINTS.safety.reports, input),
  listReports: () => api.get<SafetyReport[]>(API_ENDPOINTS.safety.myReports),
  listBlocked: () => api.get<BlockedMember[]>(API_ENDPOINTS.safety.blocks),
  block: (userId: string) => api.post<BlockedMember>(API_ENDPOINTS.safety.block(userId)),
  unblock: (userId: string) => api.delete<{ success: boolean }>(API_ENDPOINTS.safety.block(userId)),
};
