<template>
  <div class="text-h6">Plugins</div>

  <div class="q-mt-sm">
    <q-toggle :label="t('plugin.edl.enable')" v-model="appStore.enableEdl" />
    <q-toggle :label="t('plugin.chapter.enable')" v-model="appStore.enableChapter" />

    <div class="row">
      <div class="q-mt-sm">{{ t('app.plugins.title') }} </div>
      <q-btn flat dense round color="primary" @click="pluginStore.testServerPlugins"
        class="q-ml-auto"><q-icon><i-mdi-reload /></q-icon></q-btn>
    </div>

    <div class="q-ma-sm">
      <a href="https://github.com/intro-skipper/jellyfin-plugin-ms-api?tab=readme-ov-file#jellyfin-plugin-mediasegments-api"
        target="_blank">
        <q-badge :color="pluginStore.pluginSegmentsApiInstalled ? 'green' : 'red'" rounded
          class="q-mr-sm" />MediaSegments
        API
        {{
      pluginStore.pluginSegmentsApiInstalled ? `(${pluginStore.pluginSegmentsApiVersion})` : '' }}
      </a>
    </div>
    <div class="q-ma-sm">
      <a href="https://github.com/intro-skipper/jellyfin-plugin-edl?tab=readme-ov-file#jellyfin-plugin-edl" target="_blank">
        <q-badge :color="pluginStore.pluginEdlInstalled ? 'green' : 'orange'" rounded class="q-mr-sm" />Edl
        {{
      pluginStore.pluginEdlInstalled ? `(${pluginStore.pluginEdlVersion})` : '' }}
      </a>
    </div>
    <div class="q-ma-sm">
      <a href="https://github.com/intro-skipper/jellyfin-plugin-ms-chapter?tab=readme-ov-file#chapter-creator-for-jellyfin-mediasegments" target="_blank">
        <q-badge :color="pluginStore.pluginChapterInstalled ? 'green' : 'orange'" rounded class="q-mr-sm" />Chapter Creator
        {{
      pluginStore.pluginChapterInstalled ? `(${pluginStore.pluginChapterVersion})` : '' }}
      </a>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { useAppStore } from 'src/stores/app';
import { usePluginStore } from 'stores/plugin';
import { useI18n } from 'vue-i18n';

const appStore = useAppStore();
const pluginStore = usePluginStore()
const { t } = useI18n();

</script>
