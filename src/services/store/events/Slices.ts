import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { TEventContainer } from '@services/types/models';

interface EventsState {
  allDigitalEventsDetail: { [key: string]: TEventContainer };
  eventGroups: { [key: string]: { title: string; ids: string[] } };
  searchQueryString: string;
  eventsLoaded: boolean;
  ppvEventsIds: Array<string>;
  availablePPVEventsIds: Array<string>;
  availablePPVEventsDateOfUpdate: string | null;
}

const initialState: EventsState = {
  allDigitalEventsDetail: {},
  eventGroups: {},
  searchQueryString: '',
  eventsLoaded: false,
  ppvEventsIds: [],
  availablePPVEventsIds: [],
  availablePPVEventsDateOfUpdate: null,
};
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    getEventListLoopStart: state => state,
    getEventListSuccess: (
      state,
      action: PayloadAction<{
        digitalEventDetailsList: {
          allDigitalEventsDetail: EventsState['allDigitalEventsDetail'];
          eventGroups: EventsState['eventGroups'];
        };
      }>,
    ) => {
      const { payload } = action;
      state.allDigitalEventsDetail =
        payload.digitalEventDetailsList.allDigitalEventsDetail;
      state.eventGroups = payload.digitalEventDetailsList.eventGroups;
      state.eventsLoaded = true;
    },
    getEventListLoopStop: state => state,

    getPrismicisedRailsLoopStart: state => state,
    getPrismicisedRailsSuccess: (
      state,
      action: PayloadAction<{
        prismicisedRails: {
          allDigitalEventsDetail: EventsState['allDigitalEventsDetail'];
          eventGroups: EventsState['eventGroups'];
        };
      }>,
    ) => {
      const { payload } = action;
      state.allDigitalEventsDetail =
        payload.prismicisedRails.allDigitalEventsDetail;
      state.eventGroups = payload.prismicisedRails.eventGroups;
      state.eventsLoaded = true;
    },
    getPrismicisedRailsLoopStop: state => state,
    setSearchQuery: (
      state,
      action: PayloadAction<{ searchQuery: EventsState['searchQueryString'] }>,
    ) => {
      const { payload } = action;
      if (payload.searchQuery.length) {
        state.searchQueryString += payload.searchQuery;
      } else {
        state.searchQueryString = state.searchQueryString.length
          ? state.searchQueryString.substring(
              0,
              state.searchQueryString.length - 1,
            )
          : state.searchQueryString;
      }
    },
    setFullSearchQuery: (
      state,
      action: PayloadAction<{ searchQuery: EventsState['searchQueryString'] }>,
    ) => {
      const { payload } = action;
      state.searchQueryString = payload.searchQuery;
    },
    clearSearchQuery: state => {
      state.searchQueryString = { ...initialState }.searchQueryString;
    },
    saveSearchResultQuery: state => state,
    setPPVEventsIds: (
      state,
      action: PayloadAction<{ ppvEventsIds: EventsState['ppvEventsIds'] }>,
    ) => {
      const { payload } = action;
      state.ppvEventsIds = payload.ppvEventsIds;
    },
    clearPPVEventsIds: state => {
      state.ppvEventsIds = [...initialState.ppvEventsIds];
    },
    setAvailablePPVEventsIds: (
      state,
      action: PayloadAction<{
        availablePPVEventsIds: EventsState['availablePPVEventsIds'];
        availablePPVEventsDateOfUpdate: EventsState['availablePPVEventsDateOfUpdate'];
      }>,
    ) => {
      const { payload } = action;
      state.availablePPVEventsIds = payload.availablePPVEventsIds;
      state.availablePPVEventsDateOfUpdate =
        payload.availablePPVEventsDateOfUpdate;
    },
    clearAvailablePPVEventsIds: state => {
      state.availablePPVEventsIds = [...initialState.availablePPVEventsIds];
      state.availablePPVEventsDateOfUpdate =
        initialState.availablePPVEventsDateOfUpdate;
    },
    setAvailablePPVEventsDateOfUpdate: (
      state,
      action: PayloadAction<{
        availablePPVEventsDateOfUpdate: EventsState['availablePPVEventsDateOfUpdate'];
      }>,
    ) => {
      const { payload } = action;
      state.availablePPVEventsDateOfUpdate =
        payload.availablePPVEventsDateOfUpdate;
    },
    clearAvailablePPVEventsDateOfUpdate: state => {
      state.availablePPVEventsDateOfUpdate =
        initialState.availablePPVEventsDateOfUpdate;
    },
    clearEventState: () => ({ ...initialState }),
  },
});

export const {
  getEventListLoopStart,
  getEventListSuccess,
  getEventListLoopStop,
  setSearchQuery,
  clearSearchQuery,
  setFullSearchQuery,
  saveSearchResultQuery,
  clearEventState,
  setPPVEventsIds,
  clearPPVEventsIds,
  setAvailablePPVEventsIds,
  clearAvailablePPVEventsIds,
  getPrismicisedRailsLoopStart,
  getPrismicisedRailsSuccess,
  getPrismicisedRailsLoopStop,
  setAvailablePPVEventsDateOfUpdate,
  clearAvailablePPVEventsDateOfUpdate,
} = eventsSlice.actions;

export const { reducer, name } = eventsSlice;
