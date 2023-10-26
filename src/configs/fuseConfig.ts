export const detailEventsSearchOptions = {
  minMatchCharLength: 1,
  shouldSort: true,
  isCaseSensitive: false,
  useExtendedSearch: true,
  findAllMatched: true,
  keys: [
    {
      name: 'data.vs_title.text',
      weight: 0.5,
    },
    {
      name: 'data.vs_event_details.title',
      weight: 1,
    },
  ],
};
