import React from 'react';
import { useSubscription } from '@apollo/client';
import { CALL_SUBSCRIPTION } from '../gql/subscriptions';
import { useToast } from '@aircall/tractor';

export const useOnUpdatedCallSubscription = () => {
  const { showToast } = useToast();
  const [updatedCall, setUpdatedCall] = React.useState<Call | null>(null);

  useSubscription(CALL_SUBSCRIPTION, {
    onData: ({ data }: any) => {
      const {
        data: { onUpdatedCall }
      } = data;
      setUpdatedCall(onUpdatedCall);
    },
    onError: err => {
      showToast({
        variant: 'warning',
        dismissIn: 2000,
        message: 'Something went wrong! Updated will not work'
      });
    }
  });
  return { updatedCall };
};
