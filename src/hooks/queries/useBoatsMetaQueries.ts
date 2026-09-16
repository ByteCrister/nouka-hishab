import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, extractErrorMessage } from '@/utils/axios';
import { BoatMeta } from '@/types/sand/trips.types';

export const boatMetaKeys = {
  all: ['boatsMeta'] as const,
  lists: () => [...boatMetaKeys.all, 'list'] as const,
  list: (sector?: string) => [...boatMetaKeys.lists(), { sector }] as const,
};

async function fetchBoatsMeta(sector?: string): Promise<BoatMeta[]> {
  const params = sector ? { sector } : {};
  const { data } = await api.get<{ data: BoatMeta[] }>('/boats/meta', { params });
  return data.data;
}

export function useBoatsMeta(
  sector?: string,
  options?: Omit<UseQueryOptions<BoatMeta[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<BoatMeta[], Error>({
    queryKey: boatMetaKeys.list(sector),
    queryFn: () => fetchBoatsMeta(sector).catch((err) => { throw new Error(extractErrorMessage(err)); }),
    staleTime: 5 * 60 * 1000, // 5 minutes — combobox data changes rarely
    ...options,
  });
}
