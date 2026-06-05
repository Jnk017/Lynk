import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../../constants/api';
import { api } from '../../services/api';
import { LynkProfile } from './types';

export const profileQueryKey = ['profile', 'me'] as const;

export function useProfile() {
  return useQuery<LynkProfile>({
    queryKey: profileQueryKey,
    queryFn: () => api.get<LynkProfile>(API_ENDPOINTS.users.me),
  });
}
