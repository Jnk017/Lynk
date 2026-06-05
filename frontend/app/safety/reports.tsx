import React from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Card, EmptyState, ErrorState, LoadingState, Badge } from '../../src/components/premium';
import { SafetyScreen, safetyStyles } from '../../src/components/safety/SafetyScreen';
import { safetyService } from '../../src/services/safety';
import { theme } from '../../src/design-system';

const reasonLabel: Record<string,string> = { fake_profile:'Fake profile', scam_attempt:'Scam attempt', harassment:'Harassment', inappropriate_content:'Inappropriate content', impersonation:'Impersonation', underage_concern:'Underage concern', spam:'Spam', other:'Other' };
const statusLabel: Record<string,string> = { pending:'Submitted', reviewing:'Under Review', resolved:'Resolved', dismissed:'Dismissed' };
export default function ReportsScreen() {
  const query = useQuery({ queryKey:['safety-reports'], queryFn:safetyService.listReports });
  return <SafetyScreen title="My Reports" subtitle="Your report history is private. Moderator identities are never shown.">
    {query.isLoading ? <LoadingState label="Loading your reports" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="No reports" description="Reports you submit will appear here with clear status updates." /> : <View style={safetyStyles.stack}>{query.data.map((report) => <Card key={report.id}><View style={{gap:10}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:12,alignItems:'center'}}><Text style={{color:theme.colors.textPrimary,fontWeight:'700',fontSize:16,flex:1}}>{reasonLabel[report.reason]}</Text><Badge label={statusLabel[report.status]} tone={report.status==='resolved'?'success':report.status==='dismissed'?'neutral':report.status==='reviewing'?'warning':'gold'} /></View><Text style={safetyStyles.note}>{new Date(report.createdAt).toLocaleDateString()}</Text>{report.resolutionNote ? <Text style={safetyStyles.body}>{report.resolutionNote}</Text> : null}</View></Card>)}</View>}
  </SafetyScreen>;
}
