import { useCallback, useEffect, useRef, useState } from "react";
import { eventDetailsSectionsConfig, TEventDetailsSectionItem } from "@navigations/eventDetailsRoutes";
import { useAppSelector } from "@hooks/redux";
import type {
  TDieseActitvityCreatives,
  TDieseActivityCast,
  TEvent,
  TExtrasVideo,
  TVSSynops
} from "@services/types/models";
import { getEventById } from "@services/store/events/Selectors";
import { isProductionEvironmentSelector } from "services/store/settings/Selectors";
import { ECellItemKey } from "@components/EventDetailsComponents/commonControls/MultiColumnAboutProductionList";
import { getVideoDetails } from "@services/prismicApiClient";
import * as Prismic from "@prismicio/client";
import { PrismicDocument } from "@prismicio/types";
import get from "lodash.get";
import type { TEventDetailsScreensParamContextProps } from "@configs/screensConfig";
import { getBitMovinSavedPosition, getSelectedBitrateId } from "@services/bitMovinPlayer";
import useAsyncEffect from "use-async-effect";
import { defaultPlayerBitrateKey, playerBitratesFilter } from "@configs/bitMovinPlayerConfig";
import { customerIdSelector } from "services/store/auth/Selectors";

type TUseEventDetails = (obj: { eventId: string }) => {
  extrasLoading: boolean;
  sectionsCollection: Array<TEventDetailsSectionItem>;
  sectionsParams: Partial<TEventDetailsScreensParamContextProps>;
};

export const useEventDetails: TUseEventDetails = ({ eventId }) => {
  const { event } = useAppSelector(getEventById(eventId)); //ZEZjyBQAAMFmsoNu
  const sectionsParams: Partial<TEventDetailsScreensParamContextProps> = {};
  const isProduction = useAppSelector(isProductionEvironmentSelector);
  const {
    publishingDate,
    title,
    shortDescription,
    snapshotImageUrl,
    vs_guidance,
    vs_guidance_details,
  } = getGeneralInfo(event);
  const { castList, isCastListAvailable } = getCastList(event);
  const { creatives, isCreativesAvailable } = getCreatives(event);
  const { synopsis, isSynopsisAvailable } = getSynopsis(event);
  const { aboutProduction, isAboutProductionAvailable } =
    getAboutProduction(event);
  aboutProduction.push({
    content: shortDescription,
    type: ECellItemKey.description,
    key: 'description',
  });
  const {
    videosInfo,
    loading,
    performanceInfo,
    trailerInfo,
    performanceVideoTimePosition,
    setPerformanceVideoTimePositionCB,
    videoQualityBitrate,
    videoQualityId,
  } = useGetExtras(event, isProduction, eventId);

  const sectionsCollection = Object.values(eventDetailsSectionsConfig)
    .sort((itemA, itemB) => itemA.position - itemB.position)
    .filter(item => {
      switch (item.key) {
        case 'Cast': {
          return isCastListAvailable;
        }
        case 'Creatives': {
          return isCreativesAvailable;
        }
        case 'Synopsis': {
          return isSynopsisAvailable;
        }
        case 'Info': {
          return isAboutProductionAvailable;
        }
        case 'Extras': {
          return Boolean(videosInfo.length);
        }
        default:
          return true;
      }
    });
  sectionsCollection.forEach((item, index, items) => {
    type sectionName = typeof item.key;
    let params: Partial<TEventDetailsScreensParamContextProps[sectionName]>;
    switch (item.key) {
      case 'General': {
        params = {
          publishingDate,
          title,
          shortDescription,
          snapshotImageUrl,
          vs_guidance,
          vs_guidance_details,
          performanceInfo,
          trailerInfo,
          eventId,
          performanceVideoTimePosition,
          setPerformanceVideoTimePositionCB,
          videoQualityBitrate,
          videoQualityId,
        };
        break;
      }
      case 'Cast': {
        params = {
          castList,
        };
        break;
      }
      case 'Creatives': {
        params = {
          creatives,
        };
        break;
      }
      case 'Synopsis': {
        params = {
          synopsis,
        };
        break;
      }
      case 'Info': {
        params = {
          aboutProduction,
        };
        break;
      }
      case 'Extras': {
        params = {
          videosInfo,
          eventId,
          videoQualityBitrate,
          videoQualityId,
        };
        break;
      }
      default:
        params = {};
        break;
    }
    if (items.length === 1) {
      sectionsParams[item.key] = params;
      return;
    }
    if (index === items.length - 1) {
      params.nextSectionTitle = items[0].currentSectionTitle;
      params.prevScreenName = items[index - 1].key;
      params.nextScreenName = items[0].key;
      sectionsParams[item.key] = params;
      return;
    }
    if (item.key !== 'General') {
      params.prevScreenName = items[index - 1].key;
    }
    params.nextScreenName = items[index + 1].key;
    params.nextSectionTitle = items[index + 1].currentSectionTitle;
    sectionsParams[item.key] = params;
    return;
  });
  return {
    extrasLoading: loading,
    sectionsCollection,
    sectionsParams,
  };
};

//helpers

const getGeneralInfo = (
  event: TEvent,
): {
  publishingDate: string;
  title: string;
  shortDescription: string;
  snapshotImageUrl: string;
  vs_guidance: string;
  vs_guidance_details: string;
} => {
  const publishingDate = get(
    event,
    ['diese_activity', 'asset_availability_window', 'startDateTime'],
    '',
  );
  const title: string =
    get(event, ['vs_title', '0', 'text'], '').replace(/(<([^>]+)>)/gi, '') ||
    get(event, ['vs_event_details', 'title'], '').replace(/(<([^>]+)>)/gi, '');

  const shortDescription: string = (
    event.vs_description.reduce((acc, description) => {
      acc += description.text + '\n';
      return acc;
    }, '') || get(event, ['vs_event_details', 'description'], '')
  ).replace(/(<([^>]+)>)/gi, '');

  const snapshotImageUrl: string = get(
    event,
    ['vs_event_image', 'high_event_image', 'url'],
    '',
  );
  const vs_guidance: string = get(event, 'vs_guidance', '');
  const vs_guidance_details: string =
    get(event, 'vs_guidance_details', [])?.reduce(
      (acc: string, guidance_detail: any, i: number) => {
        if (guidance_detail.text) {
          acc +=
            guidance_detail.type === 'paragraph'
              ? guidance_detail.text + '\n'
              : i > 0
              ? ' ' + guidance_detail.text
              : guidance_detail.text;
        }
        return acc;
      },
      '',
    ) || '';

  return {
    publishingDate,
    title,
    shortDescription,
    snapshotImageUrl,
    vs_guidance,
    vs_guidance_details,
  };
};

const getCastList = (
  event: TEvent,
): {
  castList: Array<{ role: string; name: string }>;
  isCastListAvailable: boolean;
} => {
  const castList: Array<TDieseActivityCast> =
    get(event, ['diese_activity', 'cast']) || [];
  const listOfEvalableCasts = castList.reduce<{ [key: string]: string }>(
    (acc, cast) => {
      const role = cast.role_title;
      const name =
        (cast.contact_firstName ? cast.contact_firstName + ' ' : '') +
          cast.contact_lastName || '';
      if (!name) {
        return acc;
      }
      if (role && role in acc) {
        acc[role] += `, ${name}`;
      } else {
        acc[role] = name;
      }
      return acc;
    },
    {},
  );
  const data: Array<{ role: string; name: string }> = Object.entries(
    listOfEvalableCasts,
  ).map(([role, name]) => ({ role, name }));
  return { castList: data, isCastListAvailable: Boolean(data.length) };
};

const getCreatives = (
  event: TEvent,
): {
  creatives: Array<{ role: string; name: string }>;
  isCreativesAvailable: boolean;
} => {
  const creativesList: Array<TDieseActitvityCreatives> = get(
    event,
    ['diese_activity', 'creatives'],
    [],
  );
  const listOfEvalableCreatives = creativesList.reduce<{
    [key: string]: string;
  }>((acc, creative) => {
    const role = creative.role_title;
    const name =
      (creative.contact_firstName ? creative.contact_firstName + ' ' : '') +
        creative.contact_lastName || '';
    if (!name) {
      return acc;
    }
    if (role && role in acc) {
      acc[role] += `, ${name}`;
    } else {
      acc[role] = name;
    }
    return acc;
  }, {});
  const data: Array<{ role: string; name: string }> = Object.entries(
    listOfEvalableCreatives,
  ).map(([role, name]) => ({ role, name }));
  return {
    creatives: data,
    isCreativesAvailable: Boolean(data.length),
  };
};

const getSynopsis = (
  event: TEvent,
): {
  synopsis: Array<{ key: string; text: string }>;
  isSynopsisAvailable: boolean;
} => {
  const synopsis: Array<TVSSynops> = event.vs_synopsis.filter(
    synops => synops.text.length,
  ).length
    ? event.vs_synopsis.filter(synops => synops.text.length)
    : (
        get<TEvent, 'vs_event_details', 'productions', any[]>(
          event,
          ['vs_event_details', 'productions'],
          [],
        ) || []
      ).reduce((acc: Array<TVSSynops>, production: any) => {
        if (production.attributes.synopsis) {
          acc.push(
            ...production.attributes.synopsis
              .split('</p>')
              .reduce((result: Array<TVSSynops>, item: string) => {
                result.push({
                  type: 'paragraph',
                  text: item.replace(/(<([^>]+)>)/gi, ''),
                  spans: [],
                });
                return result;
              }, []),
          );
        }
        return acc;
      }, []);
  const blocksOfSynopsis = synopsis
    .filter(synops => synops.text !== '')
    .map((synops, i) => ({
      key: i.toString(),
      text: synops.text,
    }));
  return {
    synopsis: blocksOfSynopsis,
    isSynopsisAvailable: Boolean(blocksOfSynopsis.length),
  };
};

const getAboutProduction = (
  event: TEvent,
): {
  aboutProduction: Array<{
    key: string;
    type: ECellItemKey;
    content: any;
  }>;
  isAboutProductionAvailable: boolean;
} => {
  const aboutProduction: Array<{
    key: string;
    type: ECellItemKey;
    content: any;
  }> = [];

  const language = get(event, 'vs_event_details.productions', []).reduce(
    (acc: string, item: any, index: number) => {
      if (item?.attributes?.language) {
        acc += (index !== 0 ? ', ' : '') + item.attributes.language;
      }
      return acc;
    },
    '',
  );

  const guidance: Array<string> = event.vs_guidance_details.reduce(
    (acc: Array<string>, item: any) => {
      if (item.text) {
        acc.push(item.text);
      }
      return acc;
    },
    event.vs_guidance ? [event.vs_guidance] : [],
  );

  const genres = event.vs_genres.reduce(
    (acc: string, item: any, index: number) => {
      if (item.tag) {
        acc += (index !== 0 ? ', ' : '') + item.tag;
      }
      return acc;
    },
    '',
  );

  const sponsors = event.vs_sponsors.reduce((acc: Array<any>, item) => {
    const sponsor: Partial<{
      img: { url: string; width: number; height: number };
      info: { title: string; description: string };
    }> = {};
    if (
      item?.sponsor_logo?.url &&
      item?.sponsor_logo?.dimensions?.width &&
      item?.sponsor_logo?.dimensions?.height
    ) {
      sponsor.img = {
        url: item.sponsor_logo.url,
        width: item.sponsor_logo.dimensions.width,
        height: item.sponsor_logo.dimensions.height,
      };
    }
    const sponsorTitle = item.sponsor_title.reduce(
      (title: string, titleItem) => {
        if (titleItem.text) {
          title += titleItem.text;
        }
        return title;
      },
      '',
    );

    const sponsorIntro = item.sponsor_intro.reduce(
      (intro: string, introItem) => {
        if (introItem.text) {
          intro += introItem.text;
        }
        return intro;
      },
      '',
    );

    const sponsorDesccription = item.sponsor_description.reduce(
      (description: string, descriptionItem) => {
        if (descriptionItem.text) {
          description += descriptionItem.text + '\n';
        }
        return description;
      },
      '',
    );
    const info = {
      title: sponsorTitle || sponsorIntro,
      description: sponsorDesccription,
    };
    if (info.title && info.description) {
      sponsor.info = info;
    }
    if (sponsor.img || sponsor.info) {
      acc.push(sponsor);
    }
    return acc;
  }, []);

  if (language) {
    aboutProduction.push({
      key: ECellItemKey.language,
      type: ECellItemKey.language,
      content: language,
    });
  }

  if (guidance.length) {
    aboutProduction.push({
      key: ECellItemKey.guidance,
      type: ECellItemKey.guidance,
      content: guidance.join('\n'),
    });
  }

  if (genres) {
    aboutProduction.push({
      key: ECellItemKey.genres,
      type: ECellItemKey.genres,
      content: genres,
    });
  }

  if (sponsors.length) {
    aboutProduction.push(
      ...sponsors.map((sponsor, index) => ({
        key: ECellItemKey.sponsor + index,
        type: ECellItemKey.sponsor,
        content: sponsor,
      })),
    );
  }

  return {
    aboutProduction,
    isAboutProductionAvailable: Boolean(aboutProduction.length),
  };
};

const useGetExtras = (
  event: TEvent,
  isProduction: boolean,
  eventId: string,
): {
  videosInfo: Array<TExtrasVideo>;
  performanceInfo: { eventId: string; videoId: string; title?: string } | null;
  trailerInfo: { eventId: string; videoId: string; title?: string } | null;
  loading: boolean;
  loaded: boolean;
  performanceVideoTimePosition: string | undefined;
  setPerformanceVideoTimePositionCB: (time: string) => void;
  videoQualityBitrate: number;
  videoQualityId: 'high' | 'medium' | 'normal';
} => {
  const customerId = useAppSelector(customerIdSelector);
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);

  const [videosInfo, setVideosInfo] = useState<Array<TExtrasVideo>>([]);
  const [performanceVideoTimePosition, setPerformanceVideoTimePosition] =
    useState<string>('');
  const performanceInfo = useRef<{
    eventId: string;
    videoId: string;
    dieseId: string;
    title?: string;
  } | null>(null);
  const trailerInfo = useRef<{
    eventId: string;
    videoId: string;
    title?: string;
  } | null>(null);
  const bitrateValue = useRef<number>(
    playerBitratesFilter[defaultPlayerBitrateKey].value,
  );
  const eventIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const loaded = useRef<boolean>(false);

  const isMounted = useRef<boolean>(false);
  const videos = get(event, 'vs_videos', []).map(({ video }) => video.id);
  const videoQualityIdRef = useRef<'high' | 'medium' | 'normal'>(
    defaultPlayerBitrateKey,
  );
  const setPerformanceVideoTimePositionCB = useCallback((time: string) => {
    if (isMounted.current) {
      setPerformanceVideoTimePosition(time);
    }
  }, []);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (isMounted.current && eventIdRef.current !== eventId) {
      eventIdRef.current = eventId;
      loaded.current = false;
      setLoading(true);
    }
  }, [eventId]);

  useAsyncEffect(
    async isActive => {
      if (loaded.current || !isActive()) {
        return;
      }
      try {
        const videoQualityId: 'high' | 'medium' | 'normal' =
          await getSelectedBitrateId();
        const videoQualityBitrate: number =
          playerBitratesFilter[videoQualityId].value;
        bitrateValue.current = videoQualityBitrate;
        videoQualityIdRef.current = videoQualityId;
        const response = await getVideoDetails({
          queryPredicates: [Prismic.Predicates.in('document.id', videos)],
          isProductionEnv: isProduction,
        });
        const filteredResult = response.results.reduce(
          (
            acc: {
              performance: PrismicDocument<
                Record<string, any>,
                string,
                string
              >[];
              trailer: PrismicDocument<Record<string, any>, string, string>[];
              extras: PrismicDocument<Record<string, any>, string, string>[];
            },
            result,
          ) => {
            if (!result?.data?.video?.video_type) {
              return acc;
            }
            switch (result.data.video.video_type) {
              case 'performance':
                acc.performance.push(result);
                break;
              case 'trailer':
                acc.trailer.push(result);
                break;
              case 'hero':
                break;
              case 'insight':
                acc.performance.push(result);
                break;
              default:
                acc.extras.push(result);
                break;
            }
            return acc;
          },
          { performance: [], trailer: [], extras: [] },
        );
        if (isActive()) {
          trailerInfo.current = filteredResult.trailer.length
            ? {
                eventId,
                videoId: filteredResult.trailer[0].id,
                title:
                  filteredResult.trailer[0].data?.video_title[0]?.text || '',
              }
            : null;
          performanceInfo.current = filteredResult.performance.length
            ? {
                eventId,
                videoId: filteredResult.performance[0].id,
                dieseId: filteredResult.performance[0].data.video.video_key,
                title:
                  filteredResult.performance[0].data?.video_title[0]?.text ||
                  '',
              }
            : null;
          if (performanceInfo.current && customerId) {
            const videoPositionInfo = await getBitMovinSavedPosition(
              customerId,
              performanceInfo.current.dieseId,
              performanceInfo.current.eventId,
              isProductionEnv,
            );
            if (videoPositionInfo && videoPositionInfo.position) {
              setPerformanceVideoTimePosition(videoPositionInfo.position);
            }
          }
          setVideosInfo(
            filteredResult.extras.map(item => ({
              previewImageUrl: item.data.preview_image.url,
              title: item.data.video_title.reduce(
                (acc: string, title: any, i: number) => {
                  if (title.text) {
                    acc +=
                      title.type === 'paragraph'
                        ? title.text + '\n'
                        : i > 0
                        ? ' ' + title.text
                        : title.text;
                  }
                  return acc;
                },
                '',
              ),
              descrription: item.data.short_description.reduce(
                (acc: string, description: any, i: number) => {
                  if (description.text) {
                    acc +=
                      description.type === 'paragraph'
                        ? description.text + '\n'
                        : i > 0
                        ? ' ' + description.text
                        : description.text;
                  }
                  return acc;
                },
                '',
              ),
              participant_details: item.data.participant_details.reduce(
                (acc: string, participant_detail: any, i: number) => {
                  if (participant_detail.text) {
                    acc +=
                      participant_detail.type === 'paragraph'
                        ? participant_detail.text + '\n'
                        : i > 0
                        ? ' ' + participant_detail.text
                        : participant_detail.text;
                  }
                  return acc;
                },
                '',
              ),
              id: item.id,
              lastPublicationDate: item.last_publication_date,
            })),
          );
        }
      } catch (err) {
        if (isActive()) {
          setVideosInfo([]);
        }
      } finally {
        if (isActive()) {
          loaded.current = true;
          setLoading(false);
        }
      }
    },
    [isProduction, videos, eventId],
  );
  return {
    videosInfo,
    performanceInfo: performanceInfo.current,
    trailerInfo: trailerInfo.current,
    loading: loading,
    loaded: loaded.current,
    performanceVideoTimePosition,
    setPerformanceVideoTimePositionCB,
    videoQualityBitrate: bitrateValue.current,
    videoQualityId: videoQualityIdRef.current,
  };
};
