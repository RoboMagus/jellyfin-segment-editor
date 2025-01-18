import { useApiStore } from 'stores/api';

import {
  ImageType,
  ItemsApiGetItemsRequest,
  TvShowsApiGetEpisodesRequest,
} from '@jellyfin/sdk/lib/generated-client';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getLibraryStructureApi } from '@jellyfin/sdk/lib/utils/api/library-structure-api';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import { Jellyfin } from '@jellyfin/sdk';
import { ItemFields, ItemSortBy } from '@jellyfin/sdk/lib/generated-client';

export function useApi() {
  const { fetchWithAuth, serverAddress, apiKey } = useApiStore();
  const jellyfin = new Jellyfin({
    clientInfo: {
      name: 'Jellyfin Segment Editor',
      version: '0.4.8',
    },
    deviceInfo: {
      name: 'Web Browser',
      id: 'segment-editor-browser',
    },
  });
  const api = jellyfin.createApi(serverAddress, apiKey);

  // Get the typed API client
  const itemsApi = getItemsApi(api);
  const libraryStructureApi = getLibraryStructureApi(api);
  const tvShowsApi = getTvShowsApi(api);
  /*
    type RequestBody = {
      userId: number
      title: string
      body: string
    }

    type ResponseBody = RequestBody & {
      id: string
    }

    const newPost = {
      userId: 1,
      title: 'my post',
      body: 'some content',
    }

    const response = await fetch.post<RequestBody, ResponseBody>(
      'https://jsonplaceholder.typicode.com/posts',
      newPost,
    )
  */

  // Get items for collection
  /*
  async function getItems(collectionId: string, index?: number) {
    const query: Map<string, any> = new Map();
    query.set('parentId', collectionId);
    query.set('fields', 'MediaStreams');
    query.set('sortBy', 'AiredEpisodeOrder,SortName');
    query.set('isMissing', 'false');
    if (index != undefined) {
      // TODO all broken?!?!
      //query.set('startIndex', index)
      //query.set('parentIndexNumber', index)
      //query.set('searchTerm', 'Ava')
      //query.set('limit', '5')
    }

    const items = await fetchWithAuthJson('Items', query)
    return items;
  }
  */

  async function getItems(collectionId: string, index?: number) {
    const params: ItemsApiGetItemsRequest = {
      parentId: collectionId,
      fields: [ItemFields.MediaStreams],
      sortBy: [ItemSortBy.AiredEpisodeOrder, ItemSortBy.SortName],
      isMissing: false,
    };
    const response = await itemsApi.getItems(params);
    return response.data;
  }

  // Get all collections
  async function getCollections() {
    const libraries = await libraryStructureApi.getVirtualFolders();
    return libraries.data;
  }

  // Get all episodes for a season
  async function getEpisodes(seriesId: string, seasonId: string) {
    const params: TvShowsApiGetEpisodesRequest = {
      seasonId: seasonId,
      seriesId: seriesId,
      fields: [ItemFields.MediaStreams],
      sortBy: ItemSortBy.AiredEpisodeOrder,
      isMissing: false,
    };
    const episodes = await tvShowsApi.getEpisodes(params);
    return episodes.data;
  }

  // Get Image for item
  async function getImage(
    itemId: string,
    width = 133,
    height = 200,
    type: ImageType = ImageType.Primary,
  ) {
    const query: Map<string, any> = new Map();

    query.set('tag', `segmenteditor_${itemId}_${type}`);
    query.set('width', width);
    query.set('height', height);

    const image = await fetchWithAuth(`Items/${itemId}/Images/${type}`);
    return image;
  }

  return { getItems, getEpisodes, getImage, getCollections };
}
