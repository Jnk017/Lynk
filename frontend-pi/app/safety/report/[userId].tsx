import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, TextField, Toast } from '../../../src/components/premium';
import { SafetyScreen, safetyStyles } from '../../../src/components/safety/SafetyScreen';
import { ReportReason } from '../../../src/types/api';
import { safetyService } from '../../../src/services/safety';
import { trackFrontendEvent } from '../../../src/services/observability';
import { useAuth } from '../../../src/providers/AuthProvider';
import { theme } from '../../../src/design-system';

const reasons: Array<[ReportReason,string]> = [['fake_profile','Fake profile'],['scam_attempt','Scam attempt'],['harassment','Harassment'],['inappropriate_content','Inappropriate content'],['impersonation','Impersonation'],['underage_concern','Underage concern'],['spam','Spam'],['other','Other']];
export default function ReportUserScreen() {
  const { userId, name } = useLocalSearchParams<{userId:string;name?:string}>(); const {user}=useAuth();
  const [reason,setReason]=useState<ReportReason>(); const [details,setDetails]=useState(''); const [evidenceNote,setEvidenceNote]=useState('');
  const mutation=useMutation({mutationFn:safetyService.createReport,onSuccess:(report)=>{if(user){void trackFrontendEvent('report_created',user.id,{reportId:report.id,reason:report.reason});void trackFrontendEvent('report_submitted',user.id,{reportId:report.id});} Alert.alert('Report submitted','Thank you. Our safety team will review the information fairly and carefully.',[{text:'View my reports',onPress:()=>router.replace('/safety/reports')}]);}});
  const submit=()=>{if(!reason)return; mutation.mutate({reportedUserId:userId,reason,details:details.trim()||undefined,evidenceNote:evidenceNote.trim()||undefined});};
  return <SafetyScreen title="Report a Member" subtitle={`Tell us what happened${name ? ` with ${name}` : ''}. Reports are confidential and reviewed with context.`}>
    <Text style={safetyStyles.sectionTitle}>Reason</Text><View style={styles.grid}>{reasons.map(([value,label])=><Pressable key={value} accessibilityRole="radio" accessibilityState={{selected:reason===value}} accessibilityLabel={label} accessibilityHint="Selects this report reason" onPress={()=>setReason(value)} style={[styles.reason,reason===value&&styles.selected]}><Text style={[styles.reasonText,reason===value&&styles.selectedText]}>{label}</Text></Pressable>)}</View>
    <TextField label="Optional details" accessibilityLabel="Optional report details" accessibilityHint="Describe what happened without including passwords or financial credentials" multiline value={details} onChangeText={setDetails} maxLength={1500} style={styles.multiline}/>
    <TextField label="Evidence note" accessibilityLabel="Evidence note" accessibilityHint="Note where relevant evidence can be found; file uploads are not required" multiline value={evidenceNote} onChangeText={setEvidenceNote} maxLength={500} style={styles.evidence}/>
    <Card accessibilityLabel="Reporting privacy note"><Text style={safetyStyles.body}>Your report does not automatically punish anyone. We review available context, protect moderator identities, and share only appropriate resolution information.</Text></Card>
    {mutation.isError?<Toast tone="danger" message="We could not submit your report. Please try again."/>:null}<Button label="Submit report" onPress={submit} disabled={!reason} loading={mutation.isPending} accessibilityHint="Sends this confidential report to Lynk safety reviewers" />
  </SafetyScreen>;
}
const styles=StyleSheet.create({grid:{flexDirection:'row',flexWrap:'wrap',gap:10},reason:{minHeight:48,justifyContent:'center',paddingHorizontal:14,borderRadius:16,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surfaceSoft},selected:{borderColor:theme.colors.lightGold,backgroundColor:'rgba(212,166,58,0.16)'},reasonText:{color:theme.colors.textSecondary,fontWeight:'600'},selectedText:{color:theme.colors.lightGold},multiline:{minHeight:120,textAlignVertical:'top',paddingTop:14},evidence:{minHeight:88,textAlignVertical:'top',paddingTop:14}});
