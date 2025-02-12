import { BaseItemDto } from '@jellyfin/sdk/lib/generated-client';
import { useApiStore } from 'stores/api';

export function usePluginChapterApi() {
  const { fetchWithAuthJson, postJson } = useApiStore();

  async function getChapterById(id: BaseItemDto) {
    // const response = await fetchWithAuthJson(`PluginChapter/Chapter/${id}`)
    const response = await fetchWithAuthJson(`PluginChapter/Chapter/${id}`);
    return response;
  }

  async function createChapterById(id: string[]) {
    const response = await postJson('PluginChapter/Chapter', id);
    return response;
  }

  return { getChapterById, createChapterById };
}
