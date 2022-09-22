export const bitMovinPlayerKey = '@bitMovinPlayer';
export const bitMovinPlayerSelectedBitrateKey =
  '@bitMovinPlayerSelectedBitrate';
export const continueWatchingRailTitle = 'Continue Watching';
export const minResumeTime = 5;
export const resumeRollbackTime = 2;
export enum ESeekOperations {
  'fastForward',
  'rewind',
}

export const playerBitratesFilter = Object.freeze({
  high: Object.freeze({
    key: 'high',
    title: 'Best',
    value: -1,
    type: 'hq',
  }),
  medium: Object.freeze({
    key: 'medium',
    title: 'Good',
    value: 5500000,
    type: 'hd',
  }),
  normal: Object.freeze({
    key: 'normal',
    title: 'Low bandwidth',
    value: 1500000,
    type: 'sd',
  }),
});

export const defaultPlayerBitrateKey = playerBitratesFilter.normal.key;
