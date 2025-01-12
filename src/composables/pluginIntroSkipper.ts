import { useApiStore } from 'stores/api'

export function usePluginIntroSkipper() {
  const { fetchWithAuthJson } = useApiStore()
  async function getIntroSkipperPluginMeta() {

    const response = await fetchWithAuthJson('IntroSkipper')
    return response
  }

  return { getIntroSkipperPluginMeta }
}
