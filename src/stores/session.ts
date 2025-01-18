import { defineStore } from 'pinia';
import { MediaSegmentDto } from '@jellyfin/sdk/lib/generated-client';
import { ref } from 'vue';

export const useSessionStore = defineStore(
  'session',
  () => {
    const users = ref(undefined);
    const openOptions = ref(false);
    const seriesAccordionInd = ref(0);
    const segmentClipboard = ref<MediaSegmentDto>();

    const saveSegmentToClipboard = (seg: MediaSegmentDto) => {
      segmentClipboard.value = JSON.parse(JSON.stringify(seg));
    };

    const getFromSegmentClipboard = () => {
      if (segmentClipboard.value)
        return JSON.parse(JSON.stringify(segmentClipboard.value));
      return undefined;
    };

    return {
      users,
      openOptions,
      seriesAccordionInd,
      saveSegmentToClipboard,
      getFromSegmentClipboard,
    };
  },
  {
    persist: false,
  },
);
