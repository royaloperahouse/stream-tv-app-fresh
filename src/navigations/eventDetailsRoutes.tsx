import { TEventDetailsSection } from '@services/types/models';

//EventDetails Screens
import {
  General,
  Cast,
  Creatives,
  Synopsis,
  AboutProduction,
  Extras,
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
    currentSectionTitle: 'EVENT DETAILS & MORE',
    Component: General,
    position: 1,
  },
  cast: {
    key: 'Cast',
    currentSectionTitle: 'CAST & MORE',
    Component: Cast,
    position: 2,
  },
  creatives: {
    key: 'Creatives',
    currentSectionTitle: 'CREATIVES & MORE',
    Component: Creatives,
    position: 3,
  },
  synopsis: {
    key: 'Synopsis',
    currentSectionTitle: 'SYNOPSIS & MORE',
    Component: Synopsis,
    position: 4,
  },
  info: {
    key: 'Info',
    currentSectionTitle: 'INFO & MORE',
    Component: AboutProduction,
    position: 5,
  },
  extra: {
    key: 'Extras',
    currentSectionTitle: 'EXTRAS',
    Component: Extras,
    position: 6,
  },
};
