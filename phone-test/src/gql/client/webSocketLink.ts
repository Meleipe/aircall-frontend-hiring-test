import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const websocketClient = new SubscriptionClient('wss://frontend-test-api.aircall.dev/websocket', {
  reconnect: true,
  lazy: true,
  connectionParams: () => {
    const token = JSON.parse(localStorage.getItem('access_token') || '');
    if (!token) {
      return {};
    }
    return {
      authorization: `Bearer ${token}`
    };
  }
});

const link = new WebSocketLink(websocketClient);

export const wsLink = link;
