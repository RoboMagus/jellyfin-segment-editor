import { useApiStore } from 'stores/api';
import { useAppStore } from 'stores/app';
import {
  BaseItemDto,
  MediaSegmentDto,
  MediaSegmentsApiGetItemSegmentsRequest,
} from '@jellyfin/sdk/lib/generated-client';
import { useUtils } from './utils';
import { getMediaSegmentsApi } from '@jellyfin/sdk/lib/utils/api/media-segments-api';

export function useSegmentApi() {
  const { postJson, deleteJson, toApi } = useApiStore();
  const appStore = useAppStore();
  const { secondsToTicks, ticksToMs } = useUtils();
  const mediaSegmentsApi = getMediaSegmentsApi(toApi());

  // Get segments. Convert ticks to seconds
  async function getSegmentsById(itemId: BaseItemDto['Id']) {
    if (!itemId) return [];
    const request: MediaSegmentsApiGetItemSegmentsRequest = {
      itemId: itemId,
    };

    const response = await mediaSegmentsApi.getItemSegments(request);

    response.data.Items?.forEach((seg: MediaSegmentDto) => {
      seg.StartTicks = ticksToMs(seg.StartTicks) / 1000;
      seg.EndTicks = ticksToMs(seg.EndTicks) / 1000;
    });

    return response.data.Items;
  }

  /**
   * Create a media segment on server. Convert seconds to ticks
   * @param segment segment
   * @return The created segments
   */
  async function createSegment(segment: MediaSegmentDto) {
    const query: Map<string, string> = new Map();
    const provider = appStore.providerId;
    if (provider === undefined) {
      appStore.notify({ type: 'negative', message: 'Provider ID is required' });
      return false;
    }
    query.set('providerId', provider);

    segment.StartTicks = secondsToTicks(segment.StartTicks);
    segment.EndTicks = secondsToTicks(segment.EndTicks);

    return postJson(`MediaSegmentsApi/${segment.ItemId}`, segment, query);
  }

  /**
   * Delte a media segment on server
   * @param segment segment
   */
  async function deleteSegment(segment: MediaSegmentDto) {
    // The server expects itemId and type as query parameters (FromQuery)
    const query: Map<string, string> = new Map();
    if (segment.ItemId) query.set('itemId', String(segment.ItemId));
    if (segment.Type !== undefined && segment.Type !== null) query.set('type', String(segment.Type));

    await deleteJson(`MediaSegmentsApi/${segment.Id}`, undefined, query);
  }

  /**
   * Delete all media segments for providerId on server
   * @param segment segment
   */
  async function deleteSegmentsByProviderId(itemId: BaseItemDto['Id']) {
    itemId;
    console.error('deleteSegmentsByProviderId not possible');
  }

  return {
    getSegmentsById,
    createSegment,
    deleteSegment,
    deleteSegmentsByProviderId,
  };
}
