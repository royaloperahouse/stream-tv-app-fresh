interface Event {
  id: string;
}

export interface WatchStatusItem {
  position: string;
}

export interface SearchItem {
  createdAt: Date;
}

export type MyList = Event[];

export interface WatchStatus {
  [videoId: string]: WatchStatusItem | undefined;
}

export type SearchHistory = (SearchItem & { text: string })[];
