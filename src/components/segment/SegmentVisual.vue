<template>
  <div
    :class="'absolute full-height bg-' + getColorByType(props.segment.Type)"
    :style="getStyle"
  ></div>
</template>

<script setup lang="ts">
import {
  BaseItemDto,
  MediaSegmentDto,
} from '@jellyfin/sdk/lib/generated-client';
import { computed } from 'vue';
import { useUtils } from 'src/composables/utils';

const { getColorByType, ticksToMs } = useUtils();

interface Props {
  parentWidth: number;
  segment: MediaSegmentDto;
  duration: BaseItemDto['RunTimeTicks'];
}
const props = defineProps<Props>();
const durationSecs = ticksToMs(props.duration) / 1000;

const getStyle = computed(() => {
  return {
    left:
      Math.round(
        (props.parentWidth / durationSecs) * (props.segment.StartTicks ?? 0),
      ) + 'px',
    width:
      Math.max(
        8,
        Math.round(
          (props.parentWidth / durationSecs) *
            ((props.segment.EndTicks ?? 0) - (props.segment.StartTicks ?? 0)),
        ),
      ) + 'px',
  };
});
</script>
