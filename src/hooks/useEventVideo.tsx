import { getVideoDetails } from 'services/prismicApiClient';
import * as Prismic from '@prismicio/client';
import useAsyncEffect from 'use-async-effect';
import { useState } from 'react';

export const useEventVideo = (videoId) => {
  const result = {};
  const [loading, setLoading] = useState(true);
  useAsyncEffect(async () => {
    if (loading) {
      const response = await getVideoDetails({
        queryPredicates: [Prismic.predicate.in('document.id', videoId)],
        isProductionEnv: true,
      });

      result.response = response.results[0].data;
      setLoading(false);
    }
  }, [loading]);
  if (result.response) {
    return {
      loading,
      result: result.response,
    };
  }
};
