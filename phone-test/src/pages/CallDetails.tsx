import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_CALL_DETAILS } from '../gql/queries/getCallDetails';
import { ARCHIVE_CALL } from '../gql/mutations';
import { Box, Typography } from '@aircall/tractor';
import { formatDate, formatDuration } from '../helpers/dates';
import { useToast } from '@aircall/tractor';
import { useOnUpdatedCallSubscription } from '../hooks';

export const CallDetailsPage = () => {
  const { callId } = useParams();
  const [call, setCall] = React.useState<Call | null>();
  const { showToast } = useToast();
  const { loading, error } = useQuery(GET_CALL_DETAILS, {
    onCompleted: ({ call: queryCall }) => {
      if (queryCall) {
        setCall(queryCall);
      }
    },
    variables: {
      id: callId
    }
  });

  const { updatedCall } = useOnUpdatedCallSubscription();
  React.useEffect(() => {
    if (updatedCall && updatedCall.id === callId) {
      setCall(updatedCall);
    }
  }, [updatedCall, setCall, callId]);

  const [
    archiveCall,
    { data: archiveCallData, loading: archiveCallLoading, error: archiveCallError, reset }
  ] = useMutation(ARCHIVE_CALL, {
    variables: {
      id: callId
    }
  });

  React.useEffect(() => {
    if (archiveCallLoading) {
      showToast({ variant: 'info', dismissIn: 2000, message: 'ARCHIVING' });
    }
    if (archiveCallError) {
      showToast({
        variant: 'warning',
        dismissIn: 2000,
        message: 'COULD NOT ARCHIVE MESSAGE, PLEASE TRY AGAIN LATER'
      });
    }
    if (archiveCallData) {
      showToast({
        variant: 'success',
        dismissIn: 2000,
        message: 'CALL ARCHIVED SUCCESSFULLY'
      });
    }
    reset();
  }, [archiveCallLoading, archiveCallError, archiveCallData, reset, showToast]);

  if (loading)
    return (
      <Typography variant="displayM2" textAlign="center" py={50}>
        Loading call details...
      </Typography>
    );
  if (error)
    return (
      <Typography variant="displayM2" textAlign="center" py={50}>
        Something went wrong, please refresh and try again. If the problem persists please contact
        your system admin
      </Typography>
    );
  if (!call)
    return (
      <Typography variant="displayM2" textAlign="center" py={50}>
        We can't find this call in our data. Are you sure it exists? If so, please contact your
        system administrator.
      </Typography>
    );

  const archiveCallClick = () => {
    archiveCall();
  };

  return (
    <>
      <Typography variant="displayM" textAlign="center" py={3}>
        Calls Details
      </Typography>
      <Box data-test-id="callDetailsBox" overflowY="auto" bg="black-a30" p={4} borderRadius={16}>
        <div>{`ID: ${call.id}`}</div>
        <div>{`Type: ${call.call_type}`}</div>
        <div>{`Created at: ${formatDate(call.created_at)}`}</div>
        <div>{`Direction: ${call.direction}`}</div>
        <div>{`From: ${call.from}`}</div>
        <div>{`Duration: ${formatDuration(call.duration / 1000)}`}</div>
        <div>
          {`Is archived: ${call.is_archived}`}
          <button onClick={archiveCallClick}>
            {call.is_archived ? 'Unarchive' : 'Archive'} this call
          </button>
        </div>
        <div>{`To: ${call.to}`}</div>
        <div>{`Via: ${call.via}`}</div>
        {call.notes?.map((note: Note, index: number) => {
          return <div key={note.id}>{`Note ${index + 1}: ${note.content}`}</div>;
        })}
      </Box>
    </>
  );
};
