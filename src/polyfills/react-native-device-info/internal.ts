import { Platform } from 'react-native';
import {
  GetSupportedPlatformInfoAsyncParams,
  GetSupportedPlatformInfoFunctionsParams,
  GetSupportedPlatformInfoSyncParams,
  Getter,
  MemoType,
  PlatformArray,
} from './types';

// centralized memo object
export let memo: MemoType = {};

export function clearMemo() {
  memo = {};
}

export function getSupportedFunction<T>(
  supportedPlatforms: PlatformArray,
  getter: Getter<T>,
  defaultGetter: Getter<T>,
): Getter<T> {
  let supportedMap: any = {};
  supportedPlatforms
    .filter(key => Platform.OS == key)
    .forEach(key => (supportedMap[key] = getter));
  return Platform.select({
    ...supportedMap,
    default: defaultGetter,
  });
}

export function getSupportedPlatformInfoSync<T>({
  getter,
  supportedPlatforms,
  defaultValue,
  memoKey,
}: GetSupportedPlatformInfoSyncParams<T>): T {
  if (memoKey && memo[memoKey] != undefined) {
    return memo[memoKey];
  } else {
    const output = getSupportedFunction(
      supportedPlatforms,
      getter,
      () => defaultValue,
    )();
    if (memoKey) {
      memo[memoKey] = output;
    }
    return output;
  }
}

export async function getSupportedPlatformInfoAsync<T>({
  getter,
  supportedPlatforms,
  defaultValue,
  memoKey,
}: GetSupportedPlatformInfoAsyncParams<T>): Promise<T> {
  if (memoKey && memo[memoKey] != undefined) {
    return memo[memoKey];
  } else {
    const output = await getSupportedFunction(supportedPlatforms, getter, () =>
      Promise.resolve(defaultValue),
    )();
    if (memoKey) {
      memo[memoKey] = output;
    }

    return output;
  }
}

export function getSupportedPlatformInfoFunctions<T>({
  syncGetter,
  ...asyncParams
}: GetSupportedPlatformInfoFunctionsParams<T>): [
  Getter<Promise<T>>,
  Getter<T>,
] {
  return [
    () => getSupportedPlatformInfoAsync(asyncParams),
    () => getSupportedPlatformInfoSync({ ...asyncParams, getter: syncGetter }),
  ];
}
