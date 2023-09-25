import apolloClient from './client';
import { REFRESH_TOKEN } from './mutations';

let isGettingNewToken = false;

type refreshTokenV2Type = {
  access_token: string;
};

export async function getNewToken(): Promise<refreshTokenV2Type> {
  if (isGettingNewToken) {
    return Promise.reject('');
  }

  isGettingNewToken = true;
  const response = await apolloClient.mutate({
    mutation: REFRESH_TOKEN
  });

  return response.data.refreshTokenV2;
}
