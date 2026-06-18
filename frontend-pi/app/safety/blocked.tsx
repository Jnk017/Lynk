import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Card, EmptyState, ErrorState, LoadingState, Toast } from '../../src/components/premium';
import { SafetyScreen, safetyStyles } from '../../src/components/safety/SafetyScreen';
import { safetyService } from '../../src/services/safety';
import { trackFrontendEvent } from '../../src/services/observability';
import { useAuth } from '../../src/providers/AuthProvider';
import { theme } from '../../src/design-system';

export default function BlockedMembersScreen() {
  const { user } = useAuth(); const client = useQueryClient();
  const query = useQuery({ queryKey:['blocked-members'], queryFn:safetyService.listBlocked });
  const mutation = useMutation({ mutationFn:safetyService.unblock, onSuccess:async(_,id) => { if(user) void trackFrontendEvent('user_unblocked',user.id,{unblockedUserId:id}); await client.invalidateQueries({queryKey:['blocked-members']}); } });
  const confirm = (id:string,name:string) => Alert.alert(`Unblock ${name}?`, 'They may be able to find, match, and message you again.', [{text:'Keep blocked',style:'cancel'},{text:'Unblock',onPress:()=>mutation.mutate(id)}]);
  return <SafetyScreen title="Blocked Members" subtitle="Blocking ends messaging, matching, and sensitive profile interactions. Members are not notified.">
    {mutation.isError ? <Toast tone="danger" message="We could not update this block. Please try again." /> : null}
    {query.isLoading ? <LoadingState label="Loading blocked members" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="No blocked users" description="Members you block will appear here. You stay in control of future access." /> : <View style={safetyStyles.stack}>{query.data.map((block) => { const name=block.blockedUser?.displayName||'Lynk member'; return <Card key={block.id}><View style={{flexDirection:'row',alignItems:'center',gap:12}}><Avatar label={name}/><View style={{flex:1,gap:4}}><Text style={{color:theme.colors.textPrimary,fontWeight:'700',fontSize:16}}>{name}</Text><Text style={safetyStyles.note}>Blocked {new Date(block.createdAt).toLocaleDateString()}</Text></View><Button label="Unblock" variant="outline" onPress={()=>confirm(block.blockedUserId,name)} loading={mutation.isPending&&mutation.variables===block.blockedUserId}/></View></Card>; })}</View>}
  </SafetyScreen>;
}
