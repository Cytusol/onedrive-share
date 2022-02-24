import { defineStore } from "pinia";

export const appStateStore = defineStore({
  id: 'appState',
  state: ()=>({
    sideBar: false,
    uploadProgress: -1
  })
})