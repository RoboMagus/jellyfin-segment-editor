import { ItemDto } from 'src/interfaces'
import { useApiStore } from 'stores/api'

export function usePluginChapterApi() {
  const { fetchWithAuthJson, postJson } = useApiStore()

  async function getChapterById(id: ItemDto) {

    // const response = await fetchWithAuthJson(`PluginChapter/Chapter/${id}`)
    const response = await fetchWithAuthJson(`PluginChapter/Chapter/${id}`)
    return response
  }

  async function createChapterById(id: string[]) {
    const response = await postJson('PluginChapter/Edl', id)
    return response
  }

  async function getChapterPluginMeta() {

    const response = await fetchWithAuthJson('PluginChapter')
    return response
  }

  return { getChapterById, createChapterById, getChapterPluginMeta }
}
