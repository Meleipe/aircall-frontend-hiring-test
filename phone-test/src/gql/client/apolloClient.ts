import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { authLink } from './authLink';
import { onErrorLink } from './onErrorLink';
import { wsLink } from './webSocketLink';

const httpLink = createHttpLink({
  uri: 'https://frontend-test-api.aircall.dev/graphql'
});

const splitLinks = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: from([onErrorLink, authLink, splitLinks]),
  cache: new InMemoryCache()
});
