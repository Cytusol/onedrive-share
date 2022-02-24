<template>
  <v-row class="text-center">
    <v-col cols="12">
      <v-img
        :src="require('../assets/logo.svg')"
        class="my-3"
        contain
        height="64"
      />
    </v-col>

    <v-col
      class="mb-5"
      cols="12"
    >
      <h2 class="headline font-weight-bold mb-3">
        这是什么? 
      </h2>

      <v-row justify="center">
        一个以 OneDrive 为存储介质, 为文件生成直链的应用. 
      </v-row>
    </v-col>

    <v-col
      class="mb-5"
      cols="12"
    >

      <!-- <v-row justify="center">
        None
      </v-row> -->
    </v-col>

    <v-col
      class="mb-5"
      cols="12"
    >
      <h2 class="headline font-weight-bold mb-3">
        开始使用
      </h2>
      <v-row justify="center" class="my-5">
        <v-btn class="mx-3">
          <span class="mr-2">使用条款</span>
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>

        <v-btn class="mx-3" color="primary" @click="azure.login">
          <span class="mr-2">使用 OneDrive 登录</span>
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { azureStore } from '@/stores/azure.js';
export default {
  name: 'LoginPage',
  data: () => ({
    azure: azureStore()
  })
}
</script>
