<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click="appState.sideBar = !appState.sideBar"/>

      <div 
        v-show="!appState.sideBar"
        style="display: contents;"
      >
        <v-avatar size="32" class="mx-2">
          <img src="/favicon.ico" :alt="`Cytusol ${title}`" />
        </v-avatar>
        <v-toolbar-title v-text="title" class="mx-2"/>
        <v-badge :content="version" v-if="!$vuetify.breakpoint.xs"></v-badge>
      </div>

    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script>
import { appStateStore } from '@/stores/states.js';
import { azureStore } from '@/stores/azure.js';
export default {
  name: 'AppBar',
  data: () => ({
    appState: appStateStore(),
    azure: azureStore()
  }),
  computed: {
    title: ()=>{
      return import.meta.env.VITE_APP_TITLE
    },
    version: ()=>{
      return import.meta.env.VITE_APP_VERSION
    },
  }
}
</script>
