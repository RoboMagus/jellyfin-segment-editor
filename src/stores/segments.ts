import { useSegmentApi } from 'src/composables/segmentApi';
import {
  BaseItemDto,
  MediaSegmentDto,
} from '@jellyfin/sdk/lib/generated-client';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSegmentsStore = defineStore('segments', () => {
  const sapi = useSegmentApi();
  const localSegments = ref<Array<MediaSegmentDto>>([]);

  /**
   *  Gather new segments by id from server, deletes local cached ones
   */
  const getNewSegmentsById = async (itemId: BaseItemDto['Id']) => {
    const segments = await sapi.getSegmentsById(itemId);
    // simply filter and replace array
    localSegments.value = localSegments.value.filter(
      (seg: MediaSegmentDto) => seg.ItemId != itemId,
    );
    // push new segments
    localSegments.value.push(...segments.Items);
  };

  /**
   * Save/update segments local and server
   * @param segment MediaSegment to save
   */
  const saveSegment = async (segment: MediaSegmentDto) => {
    // update local and server
    localSegments.value.push(segment);
    // stringify and parse (seconds to ticks creates reactivity)
    const offseg = JSON.parse(JSON.stringify(segment));
    // remove id
    //offseg.Id = undefined;
    sapi.createSegment(offseg);

    // FIXME: Returned elements have 0000000000000 as Id. When you fetch it's correct. EF Core doesn't seem to return the id after save?!
    // Solution: When a segment is created we generate a new uuid, the database accepts them as long they are unique
  };

  /**
   * Update segment
   * @param segment Modified segment
   */
  const saveUpdatedSegment = (segment: MediaSegmentDto) => {
    // check if segment is already available, if so remove it
    const found = localSegments.value.findIndex(
      (seg: MediaSegmentDto) => seg.Id,
    );
    if (found > -1) {
      localSegments.value.splice(found, 1);
    }
    saveSegment(segment);
  };

  /**
   * New segment to save
   * @param segment New segment
   */
  const saveNewSegment = (segment: MediaSegmentDto) => {
    saveSegment(segment);
  };

  /**
   * New segments to save
   * @param segments New segments
   */
  const saveNewSegments = (segments: MediaSegmentDto[]) => {
    for (const seg of segments) {
      saveNewSegment(seg);
    }
  };

  /**
   * Delete segment
   * @param segment segment to delete
   */
  const deleteSegment = (segment: MediaSegmentDto) => {
    // check if segment is available, if so remove it
    const found = localSegments.value.findIndex(
      (seg: MediaSegmentDto) => seg.Id == segment.Id,
    );
    if (found > -1) {
      localSegments.value.splice(found, 1);
    }
    sapi.deleteSegment(segment);
  };

  /**
   * Delete all segments with itemid
   * @param itemId itemid of segments
   */
  const deleteSegments = (itemId: BaseItemDto['Id']) => {
    const found = localSegments.value.filter(
      (seg: MediaSegmentDto) => seg.ItemId == itemId,
    );
    // simply filter and replace array
    localSegments.value = localSegments.value.filter(
      (seg: MediaSegmentDto) => seg.ItemId != itemId,
    );

    found.forEach((el) => {
      sapi.deleteSegment(el);
    });
  };

  return {
    saveUpdatedSegment,
    saveNewSegment,
    saveNewSegments,
    deleteSegment,
    deleteSegments,
    getNewSegmentsById,
    localSegments,
  };
});
