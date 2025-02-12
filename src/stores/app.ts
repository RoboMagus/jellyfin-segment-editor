// Utilities
import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { useQuasar, Notify } from 'quasar';
import { useLocales } from 'src/composables/locales';

export const useAppStore = defineStore('app', () => {
  const $q = useQuasar();
  const { handleLocaleChange, SUPPORTED_LOCALES } = useLocales();

  const selectedLocale = ref('auto');
  const themeIndex = ref(1);
  const providerIndex = ref(1);
  const showVideoPlayer = ref(true);
  const enableEdl = ref(true);
  const enableChapter = ref(true);

  const providerId = computed(() => {
    let providerName;
    switch (providerIndex.value) {
      case 0:
        return 'MediaSegments API';
      case 1:
        return 'Intro Skipper';
      case 2:
        providerName = 'Chapter Segments Provider';
        break;
      default:
        providerName = 'Intro Skipper';
    }
    return providerName;
  });

  const setTheme = () => {
    if (!themeIndex.value) {
      $q.dark.set('auto');
    } else {
      $q.dark.set(themeIndex.value == 1);
    }
  };

  // watch user theme changes
  watch(themeIndex, setTheme);

  // locale handling
  const setLocale = () => {
    handleLocaleChange(selectedLocale.value);
  };
  // watch user lang changes
  watch(selectedLocale, setLocale);

  const notify = (options: { type: string; message: string }) => {
    Notify.create({
      type: options.type, // e.g., 'positive', 'negative', 'info', 'warning'
      message: options.message,
      timeout: 3000, // Duration in milliseconds
      position: 'top-right', // Position of the notification
    });
  };

  return {
    selectedLang: selectedLocale,
    themeIndex,
    showVideoPlayer,
    providerIndex,
    enableEdl,
    enableChapter,
    providerId,
    setTheme,
    setLocale,
    SUPPORTED_LOCALES,
    notify,
  };
});
