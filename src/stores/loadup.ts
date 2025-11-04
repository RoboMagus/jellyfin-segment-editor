import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadStore = defineStore('loadup', () => {
  const hasLoaded = ref('');

  return {
    hasLoaded
  }
},
{
  persist: false
});