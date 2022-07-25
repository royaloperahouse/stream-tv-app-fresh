import * as Prismic from '@prismicio/client';
import {
  prismicApiEndpoint,
  prismicApiAccessToken as accessToken,
  documentTypes,
  getRefLabelOfPublishing,
} from '@configs/prismicApiConfig';
import * as prismicT from '@prismicio/types';

interface Ordering {
  field: string;
  direction?: 'asc' | 'desc';
}

type BuildQueryURLParams = {
  /**
   * Ref used to query documents.
   *
   * {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api#prismic-api-ref}
   */
  ref: string;
  /**
   * Ref used to populate Integration Fields with the latest content.
   *
   * {@link https://prismic.io/docs/core-concepts/integration-fields}
   */
  integrationFieldsRef?: string;
  /**
   * One or more predicates to filter documents for the query.
   *
   * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api}
   */
  predicates?: string | string[];
};

interface Route {
  /**
   * The Custom Type of the document.
   */
  type: string;
  /**
   * The resolved path of the document with optional placeholders.
   */
  path: string;
  /**
   * An object that lists the API IDs of the Content Relationships in the route.
   */
  resolvers?: Record<string, string>;
}

interface QueryParams {
  /**
   * The secure token for accessing the API (only needed if your repository is
   * set to private).
   *
   * {@link https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token}
   */
  accessToken?: string;
  /**
   * The `pageSize` parameter defines the maximum number of documents that the
   * API will return for your query.
   *
   * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#pagesize}
   */
  pageSize?: number;
  /**
   * The `page` parameter defines the pagination for the result of your query.
   *
   * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#page}
   */
  page?: number;
  /**
   * The `after` parameter can be used along with the orderings option. It will
   * remove all the documents except for those after the specified document in the list.
   *
   * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#after}
   */
  after?: string;
  /**
   * The `fetch` parameter is used to make queries faster by only retrieving the
   * specified field(s).
   *
   * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#fetch}
   */
  fetch?: string | string[];
  /**
   * The `fetchLinks` parameter allows you to retrieve a specific content field
   * from a linked document and add it to the document response object.
   *
   * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#fetchlinks}
   */
  fetchLinks?: string | string[];
  /**
   * The `graphQuery` parameter allows you to specify which fields to retrieve
   * and what content to retrieve from Linked Documents / Content Relationships.
   *
   * {@link https://prismic.io/docs/technologies/graphquery-rest-api}
   */
  graphQuery?: string;
  /**
   * The `lang` option defines the language code for the results of your query.
   *
   * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#lang}
   */
  lang?: string;
  /**
   * The `orderings` parameter orders the results by the specified field(s). You
   * can specify as many fields as you want.
   *
   * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#orderings}
   */
  orderings?: Ordering | string | (Ordering | string)[];
  /**
   * The `routes` option allows you to define how a document's `url` field is resolved.
   *
   * {@link https://prismic.io/docs/core-concepts/link-resolver-route-resolver#route-resolver}
   */
  routes?: Route | string | (Route | string)[];
}

type TQueryObj = {
  queryPredicates?: Array<string> | string;
  queryOptions?: QueryParams & BuildQueryURLParams;
  isProductionEnv: boolean;
};

type TCommonQueryOptions = Partial<{ ref: string }>;

const prismicApiClient = Prismic.createClient(prismicApiEndpoint, {
  accessToken,
});

const changeRef = async (
  prismicClient: Prismic.Client<
    prismicT.PrismicDocument<Record<string, any>, string, string>
  >,
  isProductionEnv: boolean,
): Promise<void> => {
  try {
    const ref = await prismicClient.getRefByLabel(
      getRefLabelOfPublishing(isProductionEnv),
    );
    if (ref?.ref) {
      await prismicClient.queryContentFromRef(ref.ref);
    }
  } catch (err: any) {}
};

const commonQuery = async function (
  queryObj: TQueryObj = {
    isProductionEnv: true,
  },
): Promise<prismicT.Query<prismicT.PrismicDocument>> {
  const {
    queryPredicates = '',
    queryOptions = {},
    isProductionEnv = true,
  } = queryObj;
  await changeRef(prismicApiClient, isProductionEnv);

  return prismicApiClient.get({
    predicates: queryPredicates,
    ...queryOptions,
  });
};

export const getDigitalEventDetails = (
  queryObj: TQueryObj = { isProductionEnv: true },
): Promise<prismicT.Query<prismicT.PrismicDocument>> =>
  commonQuery({
    queryPredicates: [
      Prismic.Predicates.at('document.type', documentTypes.digitalEventDetails),
      ...[
        ...(Array.isArray(queryObj.queryPredicates)
          ? queryObj.queryPredicates
          : []),
      ],
    ],
    queryOptions: queryObj.queryOptions,
    isProductionEnv: queryObj.isProductionEnv,
  });

export const getVideoDetails = (
  queryObj: TQueryObj = { isProductionEnv: true },
): Promise<prismicT.Query<prismicT.PrismicDocument>> =>
  commonQuery({
    queryPredicates: [
      Prismic.Predicates.at('document.type', documentTypes.digitalEventVideo),
      ...[
        ...(Array.isArray(queryObj.queryPredicates)
          ? queryObj.queryPredicates
          : []),
      ],
    ],
    queryOptions: queryObj.queryOptions,
    isProductionEnv: queryObj.isProductionEnv,
  });

export default prismicApiClient;
