export const rootStackScreensNames = Object.freeze({
  content: 'Content',
  player: 'Player',
});

export const contentScreenNames = Object.freeze({
  home: 'Home',
  operaMusic: 'OperaMusic',
  balletDance: 'BalletDance',
  search: 'Search',
  myList: 'MyList',
  settings: 'Settings',
  eventDetails: 'EventDetails',
  exit: 'Exit',
  liveStream: 'LiveStream',
});

export const eventDetailsScreenNames = Object.freeze({
  general: 'General',
  cast: 'Cast',
  creatives: 'Creatives',
  synopsis: 'Synopsis',
  info: 'Info',
  extras: 'Extras',
});

export type TContentStackScreensNames = typeof contentScreenNames;
export type TEventDetailsStackScreensNames = typeof eventDetailsScreenNames;

export type TContentScreenReverseNames = Capitalize<
  keyof TContentStackScreensNames
>;
export type TEventDetailsScreenReverseNames = Capitalize<
  keyof TEventDetailsStackScreensNames
>;

interface Cast {
  role: string;
  name: string;
}

export type TExtrasVideo = {
  previewImageUrl: string;
  title: string;
  descrription: string;
  participant_details: string;
  id: string;
  lastPublicationDate: string;
};

export type TRoutes = Array<TRoute>;

export type TRoute = {
  navMenuScreenName: TContentScreenReverseNames;
  SvgIconActiveComponent: any | undefined;
  SvgIconInActiveComponent: any | undefined;
  navMenuTitle: string | undefined;
  position: number;
  isDefault: boolean;
  ScreenComponent: React.FC<any>;
  initialParams: { [key: string]: any } | undefined;
};

export type TEventDetailsSection = {
  key: TEventDetailsScreenReverseNames;
  currentSectionTitle: string;
  position: number;
};

export type TNavMenuItem = Omit<TRoute, 'ScreenComponent' | 'initialParams'>;

export type TEventContainer = {
  id: string;
  last_publication_date: string;
  data: TEvent;
};

export type TEvent = {
  vs_title: Array<TVSTitle>;
  vs_videos: Array<TVSVideo>;
  vs_event_details: TVSEventDetails;
  vs_start_time: string;
  vs_end_time: string;
  vs_event_card_primary_cta_text: null | any; // need better type;
  vs_event_card_primary_cta_link: {
    link_tytpe: string;
  };
  vs_description: Array<TVSDescription>;
  vs_price_details: null | any; // need better type;
  vs_guidance: null | any; // need better type;
  vs_guidance_details: Array<any>; // need better type;
  vs_running_time_summary: null | any; // need better type;
  vs_recorded_date: null | any; // need better type;
  vs_support_text: Array<any>; // need better type;
  vs_short_creatives_summary: Array<TVSShortCreativesSummary>;
  vs_background: Array<{
    vs_background_text: Array<any>;
    vs_background_image: TVSBackgroundImage;
  }>;
  vs_background_bottom_image: TVSBackgroundImage;
  vs_subtags: Array<{ tag: string }>; //example Popular opera
  vs_labels: Array<{ tag: string }>; //example Available soon
  vs_genres: Array<{ tag: string }>; //example Romance
  vs_behind_the_scenes: Array<any>; // need better type;
  diese_activity: TDieseActivity | null;
  tags: Array<{ tag: string | null }>;
  vs_tray_image: TVSTrayImage;
  vs_short_description: Array<TVSDescription>;
  vs_synopsis: Array<TVSSynops>;
  vs_sponsors: Array<TVSSponsor>;
};

export type TVSTitle = {
  type: string;
  text: string;
  spans: Array<any>; // need better type;
};

export type TVSVideo = {
  video: {
    data: any;
    id: string;
    link_type: string;
    isBroken: boolean;
    type: string;
    tags: Array<any>;
    slug: string;
    lang: string;
    first_publication_date: string;
    last_publication_date: string;
  };
};

export type TVSEventDetails = {
  slug: string;
  title: string; // can be with HTML Tags
  startTime: string;
  endTime: string;
  shortDescription: string;
  tags: Array<TVSEventDetailsTag>;
  runningTimeSummary: null | any; // need better type;
  guidance: null | any; //need better type;
  guidanceDetails: string;
  cast: Array<TVSEventDetailsCast>;
  creatives: Array<TVSEventDetailsCreative>;
  productions: Array<TVSEventDetailsProduction>;
  reviews: Array<any>; // need better type;
  ticketPriceDetails: null | any; //need better type
};

export type TVSEventDetailsTag = {
  id: string;
  type: string;
  attributes: Array<{ title: string }>;
  relationships: Partial<{}>; // need better type;
};

export type TVSEventDetailsCast = {
  id: string; // example <h4>cendrillon-(cinderella)-(2011)<h4>-cast-0
  type: string;
  attributes: {
    role: string;
    name: string;
    slug: null | any; //need better type;
    isHiddenOnEventDetails: boolean;
    relationships: {
      production: {
        data: {
          id: string; //example "<h4>cendrillon-(cinderella)-(2011)<h4>"
          type: string;
        };
      };
    };
  };
};

export type TVSEventDetailsCreative = {
  id: string; //example "<h4>cendrillon-(cinderella)-(2011)<h4>-creative-0
  type: string;
  attributes: {
    id: string; //example "<h4>cendrillon-(cinderella)-(2011)<h4>-creative-0
    role: string;
    name: string;
    slug: null | any; // need better type;
    isHiddenOnEventDetails: boolean;
    relationships: Partial<{}>; // need better type;
  };
};

export type TVSEventDetailsProduction = {
  id: string; //"<h4>cendrillon-(cinderella)-(2011)<h4>"
  type: string;
  attributes: {
    title: string; // can be with HTML tags;
    language: string;
    synopsis: string; // can be with HTML tags;
    galleryImages: Array<Partial<{}>>; // need better type;
    synopsisImage: {
      desktopPath: string | null; //img url
      mobilePath: string | null; // img url;
      thumbPath: string | null; // img url;
      altText: string | null; // need better type;
      caption: string | null; // need better type;
    };
    castListCreditsTitle: string; // example CREDITS
    castListCastTitle: string; // example CAST
    castListSynopsisTitle: string; // example SYNOPSIS;
    castListSynopsisText: string; //can be with HTML tags
    castListProductionCreditsTitle: string; //example PRODUCTION CREDITS
    castListProductionExtraDetails: string;
    castListCastDetails: string;
  };
  realtionships: {
    cast: {
      data: Array<{
        id: string;
        type: string;
      }>;
    };
    creatives: {
      data: Array<{
        id: string;
        type: string;
      }>;
    };
    tags: {
      data: Array<Partial<{}>>; // need better type;
    };
  };
};

export type TVSDescription = {
  type: string;
  text: string;
  spans: Array<{ start: number; end: number; type: string }>;
};

export type TVSShortCreativesSummary = {} & TVSDescription;

export type TVSBackgroundImage = {
  dimensions: {
    width: number;
    height: number;
  };
  alt: null | any; // need better type;
  copyright: null | any; // need better type;
  url: string;
};

export type TBitMovinPlayerSavedPosition = {
  id: string;
  position: string;
  eventId: string;
};

export type TEventVideo = {
  id: string;
  video_type: 'performance' | 'trailer' | 'behind_the_scenes';
  performanceVideoURL: string;
};

export type TDieseActivity = {
  activity_id: number;
  start: string;
  end: string;
  activity_type: string;
  activity_status: 'Confirmed';
  activity_venue: string;
  activity_production: string;
  production_id: number;
  cast: Array<TDieseActivityCast>;
  creatives: Array<TDieseActitvityCreatives>;
};

export type TDieseActivityCast = {
  contact_lastName: string;
  contact_firstName: string;
  role_title: string;
  role_order: number;
  roleCategory_title: string;
  attendingArtist_isCover: number;
};

export type TDieseActitvityCreatives = {
  contact_lastName: string;
  contact_firstName: string;
  role_title: string;
  role_order: number;
  roleCategory_title: string;
};

export type TVSTrayImage = {
  dimensions: {
    width: number;
    height: number;
  };
  alt: string | null;
  copyright: string | null;
  url: string;
  large_tray_video: {
    dimensions: {
      width: number;
      height: number;
    };
    alt: string | null;
    copyright: string | null;
    url: string;
  };
};

export type TVSSynops = { type: string; text: string; spans: Array<any> };
export type TVSSponsor = {
  sponsor_title: Array<{
    type: string;
    text: string;
    spans: Array<any>;
  }>;
  sponsor_intro: Array<{
    type: string;
    text: string;
    spans: Array<any>;
  }>;
  sponsor_logo: {
    dimensions?: { width: number; height: number };
    alt?: string | null;
    copyright?: string | null;
    url?: string;
  };
  sponsor_logo_link: {
    link_type: string;
  };
  sponsor_description: Array<{ type: string; text: string; spans: Array<any> }>;
};

export type TStreamHomePageData = {
  header_image: {
    dimensions: {
      width: number;
      height: number;
    };
    alt: string | null;
    copyright: string | null;
    url: string;
  };
  title: string;
  sub_title: Array<{
    type: 'paragraph';
    text: string;
    spans: Array<any>;
  }>;
  banner_text: Array<{
    type: 'paragraph';
    text: string;
    spans: Array<any>;
  }>;
  above_button_text: Array<{
    type: 'paragraph';
    text: string;
    spans: Array<any>;
  }>;
  cta_text: string;
  cta_link: string;
  show_sponsor_logo: boolean;
  help_title: string;
  help_text: Array<{
    type: 'paragraph';
    text: string;
    spans: Array<any>;
  }>;
  help_cta_text: string;
  help_cta_link: string;
  proposition_page_elements: Array<TStreamHomePageElement>;
  explore_all_elements: Array<TStreamHomePageElement>;
  opera_and_music_section_title: null | string;
  opera_and_music_section_standfirst: null | string;
  opera_and_music_section_grid_title: null | string;
  opera_and_music_top_elements: Array<TStreamHomePageElement>;
  opera_and_music_bottom_elements: Array<TStreamHomePageElement>;
  ballet_and_dance_section_title: string | null;
  ballet_and_dance_section_standfirst: string | null;
  ballet_and_dance_section_grid_title: string | null;
  ballet_and_dance_top_elements: Array<TStreamHomePageElement>;
  ballet_and_dance_bottom_elements: Array<TStreamHomePageElement>;
  meta_title_unsubscribed_view: string | null;
  meta_description_unsubscribed_view: string | null;
  meta_title_subscribed_view: string | null;
  meta_description_subscribed_view: string | null;
};

export type TStreamHomePageRail = {
  title: string | null;
  isVisible: boolean;
  ids: Array<string>;
};

export type TStreamHomePageElement = {
  primary:
    | {
        block_title: Array<TelementBlock>;
        block_text: Array<TelementBlock>;
        cta_text: string;
        cta_link: string;
      }
    | {
        sticky_bar_title: Array<TelementBlock>;
        sticky_bar_link: string;
      }
    | {
        title: string;
        tray_type: 'Small';
        show_tray: boolean;
      };
  items: Array<{
    element: TPageElementItem;
  }>;
  id: string;
  slice_type:
    | 'proposition_page_information_block'
    | 'events_tray'
    | 'proposition_page_sticky_bar';
  slice_label: string | null;
};

type TelementBlock = {
  type: 'heading1' | 'paragraph';
  text: string;
  spans: Array<any>;
};

type TPageElementItem = {
  id: string;
  type: 'digital_event_details' | 'digital_event_video';
  tags: Array<any>;
  lang: 'en-gb';
  slug: string;
  first_publication_date: string;
  last_publication_date: string;
  uid?: string;
  link_type: Document;
  isBroken: boolean;
};
