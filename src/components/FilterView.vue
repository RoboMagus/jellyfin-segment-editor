<template>
  <div class="row q-mb-sm flexible-menu">
    <div class="menu-collection">
      <q-select
        :label="$t('items.filter.collection')"
        dense
        :options="itemStore.collections"
        v-model="itemStore.selectedCol"
        emit-value
        map-options
        option-label="Name"
        option-value="ItemId"
      ></q-select>
    </div>
    <div class="q-ml-sm menu-search">
      <q-input
        :label="$t('items.filter.name')"
        dense
        v-model="itemStore.filterName"
      >
      </q-input>
    </div>
  </div>
  <div class="row items-left movie-row">
    <q-intersection
      v-for="item in itemStore.filteredItems"
      :key="item.Id"
      class="q-mx-auto movie-container cursor-pointer relative-position"
      @click="navigateTo(item)"
    >
      <ItemImage :width="133" :height="200" :item="item"> </ItemImage>
      <div class="text-ellipsis text-center absolute movie-container-subtext">
        {{ item.Name }}
      </div>
    </q-intersection>
  </div>
  <q-page-scroller
    position="bottom-right"
    :scroll-offset="150"
    :offset="[18, 18]"
  >
    <q-btn fab color="accent">
      <i-mdi-keyboard-arrow-up></i-mdi-keyboard-arrow-up>
    </q-btn>
  </q-page-scroller>
  <!--
  <q-intersection class="full-width row items-center justify-center" style="height:50px" @visibility="loadData">
    <div>Loading data!</div>
  </q-intersection>
  -->
</template>

<script lang="ts" setup>
import { BaseItemKind, BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import { useItemsStore } from 'stores/items';
import { useRouter } from 'vue-router';

const router = useRouter();
const itemStore = useItemsStore();
/*
const loadData = (isVisible: boolean) => {
  if (isVisible) {
    itemStore.getMoreItems()
  }
}
*/

const navigateTo = (item: BaseItemDto) => {
  let route = '';
  if (item.Type == BaseItemKind.Movie) {
    route = `/player/${item.Id}?fetchSegments=true`;
  } else if (item.Type == BaseItemKind.Series) {
    route = `/series/${item.Id}`;
  } else if (item.Type == BaseItemKind.MusicArtist) {
    route = `/artist/${item.Id}`;
  }
  router.push(route);
};
</script>

<style>
.flexible-menu {
  display: flex;
}
.menu-collection {
  width: 50vw;
}
.menu-search {
  flex-grow: 1;
}
.movie-row {
  justify-content: center;
}
.movie-container {
  width: 141px;
  height: 224px;
}

.movie-container-subtext {
  bottom: 0px;
  height: 20px;
  width: 133px;
}

.movie-container-hover {
  transition: 0.5s;
}

.movie-container-hover:hover {
  transform: scale(1.05);
}
</style>
