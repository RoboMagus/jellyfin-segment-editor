import { defineStore, storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useApiStore } from './api';
import { usePluginEdlApi } from 'src/composables/pluginEdlApi';
import { usePluginChapterApi } from 'src/composables/pluginChapterApi';
import { usePluginMediaSegmentsApi } from 'src/composables/pluginMediaSegmentsApi';
import { useAppStore } from './app';
import { PluginInfo, PluginStatus } from '@jellyfin/sdk/lib/generated-client';
import { useApi } from 'src/composables/api';


export const usePluginStore = defineStore(
  'plugin',
  () => {
    const apiStore = useApiStore();
    const appStore = useAppStore();
    const { getPlugins } = useApi();
    const { getChapterPluginMeta } = usePluginChapterApi();
    const { getEdlPluginMeta } = usePluginEdlApi();
    const { getMediaSegmentsApiPluginMeta } = usePluginMediaSegmentsApi();
    const { validAuth } = storeToRefs(apiStore);
    const { enableEdl } = storeToRefs(appStore);
    const { enableChapter } = storeToRefs(appStore);

    const pluginSegmentsApiInstalled = ref(false);
    const pluginSegmentsApiVersion = ref('0.0.0');

    const pluginIntroSkipperInstalled = ref(false);
    const pluginIntroSkipperVersion = ref('0.0.0');

    const pluginEdlInstalled = ref(false);
    const pluginEdlVersion = ref('0.0.0');

    const pluginChapterInstalled = ref(false);
    const pluginChapterVersion = ref('0.0.0');

    // Test for installed server Plugins
    const testServerPlugins = async () => {
      testMediaSegmentsApi();
      testIntroSkipper();
      testEdl();
      testChapter();
    };

    const testMediaSegmentsApi = async () => {
      let response;
      try {
        response = await getMediaSegmentsApiPluginMeta();
      } catch (error) {
        console.error('testPluginSegmentsApi Error', error);
        return false;
      }
      if (response && response.version) {
        pluginSegmentsApiInstalled.value = true;
        pluginSegmentsApiVersion.value = response.version;
        return;
      }
      pluginSegmentsApiInstalled.value = false;
      pluginSegmentsApiVersion.value = '0.0.0';
    };

    const testIntroSkipper = async () => {
      try {
        const plugins = await getPlugins();
        const introSkipper = plugins.find((plugin: PluginInfo) => plugin.Name === 'Intro Skipper');
        const isActive = introSkipper?.Status === PluginStatus.Active;

        pluginIntroSkipperInstalled.value = isActive;
        pluginIntroSkipperVersion.value = isActive ? (introSkipper.Version ?? '0.0.0') : '0.0.0';
      } catch (error) {
        console.error('testIntroSkipper Error:', error);
        pluginIntroSkipperInstalled.value = false;
        pluginIntroSkipperVersion.value = '0.0.0';
      }
    };

    const testEdl = async () => {
      let response;
      try {
        response = await getEdlPluginMeta();
      } catch (error) {
        console.error('testEdl Error', error);
        return false;
      }
      if (response && response.version) {
        pluginEdlInstalled.value = true;
        pluginEdlVersion.value = response.version;
        return;
      }
      pluginEdlInstalled.value = false;
      pluginEdlVersion.value = '0.0.0';
    };

    const testChapter = async () => {
      let response;
      try {
        response = await getChapterPluginMeta();
      } catch (error) {
        console.error('testChapter Error', error);
        return false;
      }
      if (response && response.version) {
        pluginChapterInstalled.value = true;
        pluginChapterVersion.value = response.version;
        return;
      }
      pluginChapterInstalled.value = false;
      pluginChapterVersion.value = '0.0.0';
    };

    // check if we should show edl handling
    const showEdlBtn = () => {
      return pluginEdlInstalled.value && enableEdl.value;
    };

    // check if we should show chapter handling
    const showChapterBtn = () => {
      return pluginChapterInstalled.value && enableChapter.value;
    };

    // When auth changed check for server plugins state
    watch([validAuth], ([auth]) => {
      if (auth) {
        testServerPlugins();
      }
    });

    return {
      pluginSegmentsApiInstalled,
      pluginSegmentsApiVersion,
      pluginIntroSkipperInstalled,
      pluginIntroSkipperVersion,
      pluginEdlInstalled,
      pluginEdlVersion,
      showEdlBtn,
      pluginChapterInstalled,
      pluginChapterVersion,
      showChapterBtn,
      testServerPlugins,
    };
  },
  {
    persist: {
      storage: sessionStorage,
    },
  },
);
