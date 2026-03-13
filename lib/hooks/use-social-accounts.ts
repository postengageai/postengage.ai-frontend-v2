import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SocialAccountsApi,
  ListSocialAccountsParams,
} from '../api/social-accounts';
import { queryKeys } from './query-keys';

export function useSocialAccounts(params?: ListSocialAccountsParams) {
  return useQuery({
    queryKey: queryKeys.socialAccounts.list(
      params as Record<string, unknown> | undefined
    ),
    queryFn: async () => {
      const res = await SocialAccountsApi.list(params);
      return res.data;
    },
    staleTime: 2 * 60 * 1_000,
  });
}

export function useSetPrimarySocialAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SocialAccountsApi.setPrimary(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.socialAccounts.all });
    },
  });
}
