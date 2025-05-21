import { TEventDetailsSection } from '@services/types/models';

//EventDetails Screens
import {
  General,
  Cast,
  Creatives,
  Synopsis,
  AboutProduction,
  Extras,
  Shop,
} from '@components/EventDetailsComponents/';

export type TEventDetailsSectionItem = {
  Component: React.FC<any>;
  defaultParams?: { [key: string]: any };
} & TEventDetailsSection;

export const eventDetailsSectionsConfig: {
  [key: string]: TEventDetailsSectionItem;
} = {
  general: {
    key: 'General',
    currentSectionTitle: 'Event Details and more',
    Component: General,
    position: 1,
  },
  cast: {
    key: 'Cast',
    currentSectionTitle: 'Cast and more',
    Component: Cast,
    position: 2,
  },
  creatives: {
    key: 'Creatives',
    currentSectionTitle: 'Creatives and more',
    Component: Creatives,
    position: 3,
  },
  synopsis: {
    key: 'Synopsis',
    currentSectionTitle: 'Synopsis and more',
    Component: Synopsis,
    position: 4,
  },
  info: {
    key: 'Info',
    currentSectionTitle: 'Info and more',
    Component: AboutProduction,
    position: 5,
  },
  extra: {
    key: 'Extras',
    currentSectionTitle: 'Extras and more',
    Component: Extras,
    position: 6,
  },
  shop: {
    key: 'Shop',
    currentSectionTitle: 'Shop and more',
    Component: Shop,
    position: 7,
  },
};
