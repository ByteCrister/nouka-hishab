'use client';

import { useSandTripDetail } from '@/hooks/queries/useSandTripsQueries';
import { SandTripForm } from '@/components/sand/trips/new/SandTripForm';
import { FadeInUp } from '@/components/wrappers/motion-wrappers';
import { SandTripEditSkeleton } from './SandTripEditSkeleton';

interface Props {
  publicId: string;
}

export function EditSandTripClient({ publicId }: Props) {
  const { data, isLoading, error } = useSandTripDetail(publicId);

  if (isLoading) {
    return <SandTripEditSkeleton />;
  }

  if (error || !data?.trip) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center mt-6">
        <p className="text-lg font-semibold text-muted-foreground">Trip not found.</p>
      </div>
    );
  }

  return (
    <FadeInUp>
      <SandTripForm initialData={data.trip} />
    </FadeInUp>
  );
}
