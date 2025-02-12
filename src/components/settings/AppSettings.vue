<template>
  <div class="text-h6">App (v0.5.0)</div>

  <div class="q-mt-sm">
    <div>{{ t('app.theme.title') }}</div>
    <q-option-group v-model="appStore.themeIndex" :options="themeList" inline />
  </div>

  <div class="q-mt-sm">{{ t('app.locale.title') }}</div>
  <q-select
    v-model="appStore.selectedLang"
    :options="langList"
    emit-value
    map-options
  />
  <div class="q-mt-sm"></div>

  <q-toggle
    :label="t('app.showVideoPlayer')"
    v-model="appStore.showVideoPlayer"
  />

  <div class="q-mt-sm">{{ t('provider.title') }}</div>
  <q-select v-model="appStore.providerIndex" :options="providers" />

  <!--
  <div class="q-mt-sm">{{ t('app.service') }}</div>
  <div class="q-gutter-md q-ma-none">
    <q-btn color="red" :label="t('app.service.deleteAppdata')" @click="clear" />
  </div>
  -->
</template>

<script lang="ts" setup>
import { useAppStore } from 'stores/app';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const appStore = useAppStore();
const { t, locale } = useI18n();

const langList = computed(() => {
  locale.value;
  return appStore.SUPPORTED_LOCALES.map((l) => {
    return { label: t(`app.locale.${l}`), value: l };
  });
});
const themeList = computed(() => {
  locale.value;
  return ['system', 'dark', 'light'].map((th, idx) => {
    return { label: t(`app.theme.${th}`), value: idx };
  });
});
const providers = computed(() => {
  locale.value;
  return ['default', 'skipper', 'chapter'].map((pr, idx) => {
    return { label: t(`provider.${pr}`), value: idx };
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const clear = () => {
  sessionStorage.clear();
  localStorage.clear();
  location.reload();
};
</script>
