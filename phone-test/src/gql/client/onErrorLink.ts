import { onError } from '@apollo/client/link/error';
import { fromPromise } from '@apollo/client';
import { getNewToken } from '../authToken';

export const onErrorLink = onError(({ graphQLErrors, operation, forward, response }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.message === 'Unauthorized') {
        window.localStorage.setItem(
          'access_token',
          window.localStorage.getItem('refresh_token') || ''
        );

        return fromPromise(
          getNewToken().catch(reason => {
            if (reason && reason.toString().includes('Unauthorized')) {
              window.localStorage.clear();
            }
            return {} as any;
          })
        ).flatMap(({ access_token }) => {
          if (access_token && access_token !== '') {
            window.localStorage.setItem('access_token', JSON.stringify(access_token));
          }
          return forward(operation);
        });
      }
    }
  }
});
