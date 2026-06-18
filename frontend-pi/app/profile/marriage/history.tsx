import React, { useEffect } from 'react';
import { ErrorState, LoadingState } from '../../../src/components/premium';
import { HistoryTimeline, SectionHeading } from '../../../src/features/commitment/CommitmentExperience';
import { CommitmentScreen } from '../../../src/features/commitment/screen';
import { useProfile } from '../../../src/features/profile/useProfile';
import { trackFrontendEvent } from '../../../src/services/observability';

export default function CommitmentHistoryScreen() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  useEffect(() => { if (profile) void trackFrontendEvent('commitment_history_opened', profile.id, { entryCount: profile.marriageCommitment?.history?.length ?? 0 }); }, [profile]);
  if (isLoading) return <CommitmentScreen title="Commitment History"><LoadingState label="Preparing your commitment history" /></CommitmentScreen>;
  if (isError || !profile) return <CommitmentScreen title="Commitment History"><ErrorState title="We could not load your history" description="Your commitment record is safe. Please try again." onRetry={() => void refetch()} /></CommitmentScreen>;
  return <CommitmentScreen title="Commitment History">
    <SectionHeading eyebrow="PRIVATE RECORD" title="Your journey over time" description="Created, active, proof submitted, released and cancelled states appear here when supplied by your existing commitment record." />
    <HistoryTimeline entries={profile.marriageCommitment?.history ?? []} />
  </CommitmentScreen>;
}
