import React from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { useOnUpdatedCallSubscription } from '../hooks';
import { PAGINATED_CALLS } from '../gql/queries';
import {
  Grid,
  Icon,
  Typography,
  Spacer,
  Box,
  DiagonalDownOutlined,
  DiagonalUpOutlined,
  Pagination
} from '@aircall/tractor';
import { useToast, Dropdown, DropdownButton, Menu, MenuItem } from '@aircall/tractor';
import { formatDate, formatDuration } from '../helpers/dates';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const PaginationWrapper = styled.div`
  > div {
    width: inherit;
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
`;

export const StyledSpacer = styled(Spacer)`
  max-height: 500px;
  overflow-y: auto;
`;

export const StyledMenu = styled(Menu)`
  display: flex;
  flex-direction: column;

  ${MenuItem.Content} {
    text-transform: capitalize;
    &:hover {
      background-color: var(--xstyled-colors-neutral-100);
      cursor: pointer;
    }
  }
`;

export const StyledMenuItemContent = styled(MenuItem.Content)<{ isSelected: boolean }>`
  background-color: ${({ isSelected }) => (isSelected ? 'var(--xstyled-colors-neutral-100)' : '')};
`;

const DEFAULT_CALLS_PER_PAGE = 5;

const CALL_TYPES = {
  MISSED: 'missed',
  ANSWERED: 'answered',
  VOICEMAIL: 'voicemail'
};
const CALL_DIRECTIONS = {
  OUTBOUND: 'outbound',
  INBOUND: 'inbound'
};

type FilterType = {
  direction: string | null;
  type: string | null;
};

export const CallsListPage = () => {
  const [pageSize, setPageSize] = React.useState(DEFAULT_CALLS_PER_PAGE);
  const [search] = useSearchParams();
  const [callsList, setCallsList] = React.useState<Call[] | null>();
  const [filteredCallsList, setFilteredCallsList] = React.useState<Call[]>([]);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [filters, setFilters] = React.useState<FilterType>({ direction: null, type: null });
  const { showToast } = useToast();
  const navigate = useNavigate();
  const pageQueryParams = search.get('page');
  const activePage = !!pageQueryParams ? parseInt(pageQueryParams) : 1;

  const isFilterActive = filters.type || filters.direction;

  const { loading, error } = useQuery(PAGINATED_CALLS, {
    variables: {
      offset: (activePage - 1) * DEFAULT_CALLS_PER_PAGE,
      limit: pageSize
    },
    onError: error => {
      showToast({
        variant: 'warning',
        dismissIn: 2000,
        message:
          'Something went wrong! Updates will not work. Please try again by refreshing the page'
      });
    },
    onCompleted: ({ paginatedCalls }) => {
      if (paginatedCalls.nodes.length > 0) {
        setCallsList(paginatedCalls.nodes);
        setTotalCount(paginatedCalls.totalCount);
      }
    }
  });

  const { updatedCall } = useOnUpdatedCallSubscription();

  React.useEffect(() => {
    if (callsList && updatedCall) {
      const newCallsList = callsList.reduce(
        (acc, currentCall) =>
          currentCall.id === updatedCall.id ? [...acc, updatedCall] : [...acc, currentCall],
        [] as Call[]
      );
      setCallsList(newCallsList);
    }
  }, [updatedCall]);

  React.useEffect(() => {
    const { direction: fDirection, type } = filters;
    if (callsList && type && !fDirection) {
      setFilteredCallsList(callsList.filter(({ call_type }) => type === call_type));
    } else if (callsList && fDirection && !type) {
      setFilteredCallsList(callsList.filter(({ direction }) => fDirection === direction));
    } else if (callsList && type && fDirection) {
      setFilteredCallsList(
        callsList.filter(
          ({ call_type, direction }) => fDirection === direction && type === call_type
        )
      );
    }
  }, [filters]);

  if (loading)
    return (
      <Typography variant="displayM" textAlign="center" py={3}>
        Loading calls...
      </Typography>
    );
  if (error)
    return (
      <Typography variant="displayM" textAlign="center" py={3}>
        ERROR
      </Typography>
    );
  if (!callsList)
    return (
      <Typography variant="displayM" textAlign="center" py={3}>
        Not found
      </Typography>
    );

  const handleCallOnClick = (callId: string) => {
    navigate(`/calls/${callId}`);
  };

  const handlePageChange = (page: number) => {
    navigate(`/calls/?page=${page}`);
  };

  const setDirectionFilter = (callDirection: string) => {
    const { type, direction } = filters;
    setFilters({ type, direction: direction === callDirection ? null : callDirection });
  };

  const setTypeFilter = (callType: string) => {
    const { direction, type } = filters;
    setFilters({ type: type === callType ? null : callType, direction });
  };

  return (
    <>
      <Typography variant="displayM" textAlign="center" py={3}>
        Calls History
      </Typography>
      <Dropdown trigger={<DropdownButton variant="primary">Filter By Direction</DropdownButton>}>
        <StyledMenu>
          {Object.values(CALL_DIRECTIONS).map(callDirection => (
            <StyledMenuItemContent
              isSelected={callDirection === filters.direction}
              key={callDirection}
              p={4}
              onClick={() => {
                setDirectionFilter(callDirection);
              }}
            >
              {callDirection}
            </StyledMenuItemContent>
          ))}
        </StyledMenu>
      </Dropdown>
      <Dropdown trigger={<DropdownButton variant="primary">Filter By Type</DropdownButton>}>
        <StyledMenu>
          {Object.values(CALL_TYPES).map(callType => (
            <StyledMenuItemContent
              isSelected={callType === filters.type}
              key={callType}
              p={4}
              onClick={() => {
                setTypeFilter(callType);
              }}
            >
              {callType}
            </StyledMenuItemContent>
          ))}
        </StyledMenu>
      </Dropdown>
      {isFilterActive && filteredCallsList.length === 0 && (
        <Box>
          <Typography variant="body">Your filters didn't produce any results</Typography>
        </Box>
      )}
      <StyledSpacer space={3} direction="vertical">
        {(isFilterActive ? filteredCallsList : callsList).map((call: Call) => {
          const icon = call.direction === 'inbound' ? DiagonalDownOutlined : DiagonalUpOutlined;
          const title =
            call.call_type === 'missed'
              ? 'Missed call'
              : call.call_type === 'answered'
              ? 'Call answered'
              : 'Voicemail';
          const subtitle = call.direction === 'inbound' ? `from ${call.from}` : `to ${call.to}`;
          const duration = formatDuration(call.duration / 1000);
          const date = formatDate(call.created_at);
          const notes = call.notes ? `Call has ${call.notes.length} notes` : <></>;

          return (
            <Box
              key={call.id}
              bg="black-a30"
              borderRadius={16}
              cursor="pointer"
              onClick={() => handleCallOnClick(call.id)}
              data-test-id="listedCallBox"
            >
              <Grid
                gridTemplateColumns="32px 1fr max-content"
                columnGap={2}
                borderBottom="1px solid"
                borderBottomColor="neutral-700"
                alignItems="center"
                px={4}
                py={2}
              >
                <Box>
                  <Icon component={icon} size={32} />
                </Box>
                <Box>
                  <Typography variant="body">{title}</Typography>
                  <Typography variant="body2">{subtitle}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" textAlign="right">
                    {duration}
                  </Typography>
                  <Typography variant="caption">{date}</Typography>
                </Box>
              </Grid>
              <Box px={4} py={2}>
                <Typography variant="caption">{notes}</Typography>
              </Box>
            </Box>
          );
        })}
      </StyledSpacer>

      {totalCount && (
        <PaginationWrapper>
          <Pagination
            activePage={activePage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            recordsTotalCount={totalCount}
            onPageSizeChange={newPageSize => {
              setPageSize(newPageSize);
            }}
          />
        </PaginationWrapper>
      )}
    </>
  );
};
