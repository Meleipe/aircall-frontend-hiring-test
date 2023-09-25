import { gql } from '@apollo/client';

import { CALL_FIELDS } from '../fragments';

export const CALL_SUBSCRIPTION = gql`
  ${CALL_FIELDS}
  subscription OnUpdatedCall {
    onUpdatedCall {
      ...CallFields
    }
  }
`;
