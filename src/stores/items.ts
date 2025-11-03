import { defineStore, storeToRefs } from 'pinia';
import { ref, watch, computed } from 'vue';
import { useApi } from 'src/composables/api';
import { useApiStore } from './api';
import {
  BaseItemDto,
  BaseItemKind,
  VirtualFolderInfo,
} from '@jellyfin/sdk/lib/generated-client';

export const useItemsStore = defineStore('items', () => {
  const { getItems, getCollections } = useApi();
  const apiStore = useApiStore();
  const { validConnection, validAuth } = storeToRefs(apiStore);

  const collections = ref<Array<VirtualFolderInfo>>([]);
  const localItems = ref<Array<BaseItemDto>>([]);

  const selectedCol = ref('');
  const TotalRecordCount = ref(0);
  const StartIndex = ref(0);
  const filterName = ref('');

  const getItemCollections = async () => {
    const coll = await getCollections();
    collections.value = coll;

    if (coll.length) selectedCol.value = coll[0].ItemId as string;
  };

  const initCollections = async () => {
    if (selectedCol == '') getItemCollections();
  };

  // reset localItems and get new one
  const getNewItems = async () => {
    const items = await getItems(selectedCol.value, 0);

    TotalRecordCount.value = items.TotalRecordCount as number;
    StartIndex.value = items.StartIndex as number;
    localItems.value.splice(0);
    localItems.value.push(...(items.Items ?? []));
  };

  // push more items to localItems
  const pushMoreItems = (items: BaseItemDto[]) => {
    for (const item of items) {
      if (localItems.value.findIndex((el) => item.Id == el.Id) == -1) {
        localItems.value.push(item);
      }
    }
  };

  /**
   * Get more items if possible
   */
  const getMoreItems = async () => {
    if (TotalRecordCount.value > localItems.value.length) {
      const items = await getItems(selectedCol.value, StartIndex.value);
      StartIndex.value += 1;
      localItems.value.push(...(items.Items as BaseItemDto[]));
    }
  };
  // Transform Collection Type to Item Type
  const collectionToType = computed(() => {
    const col = collections.value.find(
      (col: VirtualFolderInfo) => col.ItemId == selectedCol.value,
    );

    switch (col?.CollectionType) {
      case 'movies':
        return BaseItemKind.Movie;
      case 'tvshows':
        return BaseItemKind.Series;
      case 'mixed':
        return BaseItemKind.CollectionFolder;
      case 'music':
        return BaseItemKind.MusicArtist;
      default:
        return '';
    }
  });

  const isMixedType = (type: BaseItemKind): boolean => {
    return (
      collectionToType.value == BaseItemKind.CollectionFolder &&
      (type == BaseItemKind.Movie ||
        type == BaseItemKind.Series ||
        type == BaseItemKind.Season ||
        type == BaseItemKind.Episode)
    );
  };

  // apply items filter
  const filteredItems = computed(() =>
    localItems.value.filter(
      (item) =>
        (collectionToType.value == item.Type ||
          isMixedType(item.Type as BaseItemKind)) &&
        item.Name?.toLowerCase().includes(filterName.value.toLowerCase()),
    ),
  );

  // Get and reset items whenever connection is io or collection changed
  watch(
    [selectedCol, validConnection, validAuth],
    ([selcol, connection, auth]) => {
      if (connection && auth) {
        // on intial startup collections are empty. This is already in App.vue
        if (selcol == '') getItemCollections();

        getNewItems();
      }
    },
  );

  return {
    localItems,
    collections,
    selectedCol,
    filteredItems,
    filterName,
    getItemCollections,
    initCollections,
    getMoreItems,
    pushMoreItems,
  };
});
