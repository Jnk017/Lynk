import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../../src/constants/api';
import { api } from '../../src/services/api';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, SearchField } from '../../src/components/premium';
import { SafetyScreen, safetyStyles } from '../../src/components/safety/SafetyScreen';
import { ReportStatus, SafetyReport } from '../../src/types/api';
import { theme } from '../../src/design-system';
import { useAuth } from '../../src/providers/AuthProvider';
import { trackFrontendEvent } from '../../src/services/observability';

type AdminReport = SafetyReport & { reporter?: { displayName?: string }; reportedUser?: { displayName?: string } };
type AdminUser = { id:string; displayName?:string; email?:string; verificationStatus:string; isBanned:boolean };
type VerificationUser = { id:string; displayName?:string; updatedAt:string };
const filters: Array<['all'|ReportStatus,string]> = [['all','All'],['pending','Submitted'],['reviewing','Under Review'],['resolved','Resolved'],['dismissed','Dismissed']];
export default function AdminModerationScreen() {
  const {user}=useAuth(); const client=useQueryClient(); const [status,setStatus]=useState<'all'|ReportStatus>('all'); const [search,setSearch]=useState('');
  const users=useQuery({queryKey:['admin-users',search],queryFn:()=>api.get<AdminUser[]>(API_ENDPOINTS.admin.users,{params:{search}}),enabled:search.trim().length>=2});
  const reports=useQuery({queryKey:['admin-reports',status],queryFn:()=>api.get<AdminReport[]>(API_ENDPOINTS.admin.reports,{params:status==='all'?{}:{status}})});
  const verifications=useQuery({queryKey:['admin-verifications'],queryFn:()=>api.get<VerificationUser[]>(API_ENDPOINTS.admin.verifications)});
  const review=useMutation({mutationFn:(id:string)=>api.patch(API_ENDPOINTS.admin.reportReview(id)),onSuccess:()=>client.invalidateQueries({queryKey:['admin-reports']})});
  const resolve=useMutation({mutationFn:({id,next}:{id:string;next:'resolved'|'dismissed'})=>api.patch(API_ENDPOINTS.admin.reportResolve(id),{status:next,resolution:next==='resolved'?'Lynk reviewed this report and took appropriate action.':'Lynk reviewed the available information and closed this report.'}),onSuccess:()=>client.invalidateQueries({queryKey:['admin-reports']})});
  const verify=useMutation({mutationFn:({id,next}:{id:string;next:'verified'|'rejected'})=>api.patch(API_ENDPOINTS.admin.verificationReview(id),{status:next}),onSuccess:async(_,input)=>{if(user)void trackFrontendEvent('verification_reviewed',user.id,{userId:input.id,status:input.next});await client.invalidateQueries({queryKey:['admin-verifications']});}});
  const visible=(reports.data||[]).filter((r)=>!search.trim()||`${r.reportedUser?.displayName||''} ${r.reporter?.displayName||''} ${r.reason}`.toLowerCase().includes(search.toLowerCase()));
  return <SafetyScreen title="Moderation" subtitle="Alpha operations: review reports and the verification queue with clear, auditable actions.">
    <SearchField value={search} onChangeText={setSearch} accessibilityHint="Searches members and filters visible reports" />
    <Text style={safetyStyles.sectionTitle}>User search</Text>
    {search.trim().length < 2 ? <Text style={safetyStyles.note}>Enter at least two characters to search members.</Text> : users.isLoading ? <LoadingState label="Searching members" /> : users.isError ? <ErrorState onRetry={() => void users.refetch()} /> : !users.data?.length ? <EmptyState title="No results" description="No members match this search." /> : <View style={safetyStyles.stack}>{users.data.map((member) => <Card key={member.id}><View style={styles.row}><View style={{flex:1}}><Text style={styles.title}>{member.displayName || 'Lynk member'}</Text><Text style={safetyStyles.note}>{member.email || member.id}</Text></View><Badge label={member.isBanned ? 'Suspended' : member.verificationStatus} tone={member.isBanned ? 'danger' : member.verificationStatus === 'verified' ? 'success' : 'neutral'} /></View></Card>)}</View>}

    <View style={styles.filters}>{filters.map(([value,label])=><Pressable key={value} accessibilityRole="button" accessibilityState={{selected:status===value}} onPress={()=>setStatus(value)} style={[styles.filter,status===value&&styles.filterActive]}><Text style={styles.filterText}>{label}</Text></Pressable>)}</View>
    <Text style={safetyStyles.sectionTitle}>Reports</Text>
    {reports.isLoading?<LoadingState label="Loading moderation activity"/>:reports.isError?<ErrorState onRetry={()=>void reports.refetch()}/>:!visible.length?<EmptyState title="No moderation activity" description="No reports match this filter."/>:<View style={safetyStyles.stack}>{visible.map((report)=><Card key={report.id}><View style={safetyStyles.stack}><View style={styles.row}><Text style={styles.title}>{report.reason.replaceAll('_',' ')}</Text><Badge label={report.status}/></View><Text style={safetyStyles.note}>Reported member: {report.reportedUser?.displayName||report.reportedUserId}</Text><View style={styles.actions}>{report.status==='pending'?<Button label="Review" variant="outline" onPress={()=>review.mutate(report.id)}/>:null}{report.status==='reviewing'?<><Button label="Resolve" onPress={()=>resolve.mutate({id:report.id,next:'resolved'})}/><Button label="Dismiss" variant="outline" onPress={()=>resolve.mutate({id:report.id,next:'dismissed'})}/></>:null}</View></View></Card>)}</View>}
    <Text style={safetyStyles.sectionTitle}>Verification queue</Text>
    {verifications.isLoading?<LoadingState label="Loading verification requests"/>:verifications.isError?<ErrorState onRetry={()=>void verifications.refetch()}/>:!verifications.data?.length?<EmptyState title="No verification requests" description="New requests will appear here for manual review."/>:<View style={safetyStyles.stack}>{verifications.data.map((member)=><Card key={member.id}><View style={styles.row}><View style={{flex:1}}><Text style={styles.title}>{member.displayName||'Lynk member'}</Text><Text style={safetyStyles.note}>Submitted {new Date(member.updatedAt).toLocaleDateString()}</Text></View><Button label="Review" variant="outline" onPress={()=>Alert.alert('Verification decision','Confirm only after reviewing the submitted materials.',[{text:'Cancel',style:'cancel'},{text:'Reject',style:'destructive',onPress:()=>verify.mutate({id:member.id,next:'rejected'})},{text:'Verify',onPress:()=>verify.mutate({id:member.id,next:'verified'})}])}/></View></Card>)}</View>}
  </SafetyScreen>;
}
const styles=StyleSheet.create({filters:{flexDirection:'row',flexWrap:'wrap',gap:8},filter:{minHeight:44,justifyContent:'center',paddingHorizontal:12,borderRadius:18,borderWidth:1,borderColor:theme.colors.border},filterActive:{borderColor:theme.colors.lightGold,backgroundColor:'rgba(212,166,58,.14)'},filterText:{color:theme.colors.textSecondary,fontSize:12,fontWeight:'700'},row:{flexDirection:'row',alignItems:'center',gap:10},title:{color:theme.colors.textPrimary,fontSize:16,fontWeight:'700',textTransform:'capitalize'},actions:{flexDirection:'row',flexWrap:'wrap',gap:10}});
