import { useApiStore } from 'stores/api';
import { useAppStore } from 'stores/app';
import {
  BaseItemDto,
  MediaSegmentDto,
} from '@jellyfin/sdk/lib/generated-client';
import { useUtils } from './utils';

export function useSegmentApi() {
  const { fetchWithAuthJson, postJson, deleteJson } = useApiStore();
  const { providerId } = useAppStore();
  const { secondsToTicks, ticksToMs } = useUtils();

  // Get segments. Convert ticks to seconds
  async function getSegmentsById(itemId: BaseItemDto['Id']) {
    const query: Map<string, string> = new Map();
    query.set('itemId', itemId as string);

    const items = await fetchWithAuthJson(`MediaSegments/${itemId}`, query);

    items.Items.forEach((seg: MediaSegmentDto) => {
      seg.StartTicks = ticksToMs(seg.StartTicks) / 1000;
      seg.EndTicks = ticksToMs(seg.EndTicks) / 1000;
    });

    return items;
  }

  /**
   * Create a media segment on server. Convert seconds to ticks
   * @param segment segment
   * @return The created segments
   */
  async function createSegment(segment: MediaSegmentDto) {
    const query: Map<string, string> = new Map();
    query.set('providerId', providerId());

    segment.StartTicks = secondsToTicks(segment.StartTicks);
    segment.EndTicks = secondsToTicks(segment.EndTicks);

    return postJson(`MediaSegmentsApi/${segment.ItemId}`, segment, query);
  }

  /**
   * Delte a media segment on server
   * @param segment segment
   */
  async function deleteSegment(segment: MediaSegmentDto) {
    deleteJson(`MediaSegmentsApi/${segment.Id}`);
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
