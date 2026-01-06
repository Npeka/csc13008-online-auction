import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UpdateProfileData } from "@/lib/users-api";
import type { User } from "@/types";

export const PROFILE_QUERY_KEY = ["profile"] as const;

/**
 * Hook to fetch and cache the current user's profile using React Query
 */
export function useProfile() {
  return useQuery<User>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: usersApi.getProfile,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (formerly cacheTime)
    retry: 1, // Only retry once on failure
  });
}

/**
 * Hook to update the user's profile with optimistic updates
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => usersApi.updateProfile(data),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches to avoid optimistic update being overwritten
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<User>(PROFILE_QUERY_KEY);

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<User>(PROFILE_QUERY_KEY, {
          ...previousProfile,
          ...(newData.name && { fullName: newData.name }),
          ...(newData.address && { address: newData.address }),
          ...(newData.phone && { phone: newData.phone }),
          ...(newData.dateOfBirth && { dateOfBirth: newData.dateOfBirth }),
          ...(newData.avatar && { avatar: newData.avatar }),
          ...(newData.allowNewBidders !== undefined && { 
            allowNewBidders: newData.allowNewBidders 
          }),
        });
      }

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onError: (_err, _newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousProfile);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

/**
 * Hook to manually invalidate the profile cache (e.g., after login/logout)
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
  };
}

/**
 * Hook to set profile data in cache (e.g., after login)
 */
export function useSetProfileCache() {
  const queryClient = useQueryClient();

  return (user: User) => {
    queryClient.setQueryData(PROFILE_QUERY_KEY, user);
  };
}

