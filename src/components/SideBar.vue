<template>
  <v-navigation-drawer
    v-model="appState.sideBar"
    app
  >
    <v-sheet
      class="pa-4"
    >
    <div style="display: flex;"> 
      <v-avatar size="32" class="mx-1">
        <img src="/favicon.ico" :alt="`Cytusol ${title}`" />
      </v-avatar>
      <v-toolbar-title v-text="title" class="mx-3"/>
    </div>
    </v-sheet>

    <v-divider></v-divider>

    <v-list>
      <v-list-item
        draggable="false"
      >
        <v-list-item-icon>
          <v-icon>mdi-information</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{version}}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        link
        :href="env.VITE_APP_GITHUB" target="_blank"
        draggable="false"
      >
        <v-list-item-icon>
          <v-icon>mdi-github</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>View on GitHub</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <!-- <v-list-item
        link
        href="https://cytoid.io" target="_blank"
        draggable="false"
      >
        <v-list-item-icon>
          <v-icon>mdi-open-in-new</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Cytoid.io</v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->
    </v-list>

  </v-navigation-drawer>
</template>

<script>
import { appStateStore } from '@/stores/states.js';
export default {
  name: "SideBar",
  data: () => ({
    appState: appStateStore()
  }),
  computed: {
    title: ()=>{
      return import.meta.env.VITE_APP_TITLE
    },
    version: ()=>{
      return import.meta.env.VITE_APP_VERSION
    },
    env: ()=>{
      return import.meta.env
    }
  }
}
</script>

<style>

</style>