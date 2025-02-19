import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const userestStore = defineStore("userestStore", () => {
  const explore = ref("");
  const search = ref("");
  const tag = ref("");
  const price = ref("");
  const pages = ref("");
  return { explore, search, tag, price, pages };
});
