import { defineStore } from 'pinia';

export type DrawerTypes = 'sidebar-mobile';

export interface IState {
  showDrawer: DrawerTypes | null
  data: unknown
}

export const useDrawerStore = defineStore('drawer', {
  state: (): IState => ({
    showDrawer: null,
    data: null,
  }),
  getters: {},
  actions: {
    close() {
      this.showDrawer = null;
      this.data = null;
    },
  },
});
