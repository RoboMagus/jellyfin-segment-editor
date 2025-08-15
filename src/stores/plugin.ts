import { defineStore, storeToRefs } from 'pinia';
import { Ref, ref, watch } from 'vue';
import { useApiStore } from './api';
import { useAppStore } from './app';
import { PluginInfo, PluginStatus } from '@jellyfin/sdk/lib/generated-client';
import { useApi } from 'src/composables/api';


export const usePluginStore = defineStore(
  'plugin',
  () => {
    const apiStore = useApiStore();
    const appStore = useAppStore();
    const { getPlugins } = useApi();
    const { validAuth } = storeToRefs(apiStore);
    const { enableEdl } = storeToRefs(appStore);
    const { enableChapter } = storeToRefs(appStore);

    const pluginIntroSkipperInstalled = ref(false);
    const pluginIntroSkipperVersion = ref('0.0.0');

    const pluginEdlInstalled = ref(false);
    const pluginEdlVersion = ref('0.0.0');

    const pluginChapterInstalled = ref(false);
    const pluginChapterVersion = ref('0.0.0');

    interface PluginCheck {
      name: string;
      installedRef: Ref<boolean>;
      versionRef: Ref<string>;
    }

    const testServerPlugins = async () => {
      const pluginChecks: PluginCheck[] = [
        {
          name: 'EDL Creator',
          installedRef: pluginEdlInstalled,
          versionRef: pluginEdlVersion
        },
        {
          name: 'Chapter Creator',
          installedRef: pluginChapterInstalled,
          versionRef: pluginChapterVersion
        },
        {
          name: 'Intro Skipper',
          installedRef: pluginIntroSkipperInstalled,
          versionRef: pluginIntroSkipperVersion
        }
      ];

      try {
        const plugins = await getPlugins();

        for (const { name, installedRef, versionRef } of pluginChecks) {
          const plugin = plugins.find((p: PluginInfo) => p.Name === name);
          const isActive = plugin?.Status === PluginStatus.Active;

          installedRef.value = isActive;
          versionRef.value = isActive ? (plugin?.Version ?? '0.0.0') : '0.0.0';
        }
      } catch (error) {
        console.error('Failed to test plugins:', error);
        appStore.notify({ type: 'negative', message: 'Failed to test plugins: ' + error });
      }
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
);
