import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, extractErrorMessage } from '@/utils/axios';
import { BoatMeta } from '@/types/trips.types';

export const boatMetaKeys = {
  all: ['boatsMeta'] as const,
  lists: () => [...boatMetaKeys.all, 'list'] as const,
  list: () => [...boatMetaKeys.lists(), 'list'] as const,
};

async function fetchBoatsMeta(): Promise<BoatMeta[]> {
  const { data } = await api.get<{ data: BoatMeta[] }>('/boats/meta');
  return data.data;
}

export function useBoatsMeta(
  options?: Omit<UseQueryOptions<BoatMeta[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<BoatMeta[], Error>({
    queryKey: boatMetaKeys.list(),
    queryFn: () => fetchBoatsMeta().catch((err) => { throw new Error(extractErrorMessage(err)); }),
    staleTime: 5 * 60 * 1000, // 5 minutes — combobox data changes rarely
    ...options,
  });
}


