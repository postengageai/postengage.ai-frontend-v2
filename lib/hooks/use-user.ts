import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserApi, UpdateUserRequest } from '../api/user';
import { useUserStore } from '../user/store';
import { queryKeys } from './query-keys';

// ── Current user ───────────────────────────────────────────────────────────────

export function useCurrentUser() {
  const { setUser } = useUserStore(state => state.actions);

  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const res = await UserApi.getProfile();
      const user = res.data;
      // Keep Zustand store in sync so legacy code still works
      setUser(user);
      return user;
    },
    staleTime: 5 * 60 * 1_000, // User profile changes infrequently — 5 min
  });
}

// ── Update profile ─────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore(state => state.actions);

  return useMutation({
    mutationFn: (updates: UpdateUserRequest) => UserApi.updateProfile(updates),
    onSuccess: res => {
      const user = res.data;
      setUser(user);
      queryClient.setQueryData(queryKeys.user.profile(), user);
    },
  });
}
