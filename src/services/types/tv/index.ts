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

export interface SearchHistory {
  [text: string]: SearchItem | undefined;
}
