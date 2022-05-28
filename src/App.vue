<template>
  <v-app>
    <AppBar />
    <SideBar />

    <v-main>
      <v-container fill-height>
        <div style="margin: auto">

          <v-stepper v-model="step" vertical style="max-width: 500px;">
            <v-stepper-step :complete="step > 1" step="1">
              登录
              <small class="mt-1">使用 OneDrive 登录</small>
            </v-stepper-step>

            <v-stepper-content step="1">
              <v-card elevation="0">
                <v-card-text>
                   一个以 OneDrive 为存储介质, 为文件生成直链的应用. 
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn text>隐私条款</v-btn>
                  <v-btn color="primary" @click="azure.login">
                    <span class="mr-2">使用 OneDrive 登录</span>
                    <v-icon x-small>mdi-open-in-new</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <v-stepper-step :complete="step > 2" step="2">上传文件</v-stepper-step>
            <v-stepper-content step="2">
              <v-card elevation="0">
                <v-card-text>
                  <v-file-input v-model="file"></v-file-input>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="error" @click="azure.logout" text>注销</v-btn>
                  <v-spacer />
                  <v-btn color="primary" @click="upload">
                    上传
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <v-stepper-step :complete="step > 3" step="3">上传中</v-stepper-step>
            <v-stepper-content step="3">
              <v-card elevation="0">
                <v-card-text>
                  <div style="min-height: 4px;">
                    <v-progress-linear
                      v-model="progressValue"
                      :indeterminate="progressQuery"
                    ></v-progress-linear>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="error">
                    放弃
                  </v-btn>
                  <v-spacer />
                </v-card-actions>
              </v-card>
            </v-stepper-content>
            
            <v-stepper-step :complete="step > 4" step="4">获取分享链接</v-stepper-step>
            <v-stepper-content step="4">
              <v-card elevation="0">
                <v-card-text>
                  <v-text-field
                    ref="linkbox"
                    readonly
                    class="m-5"
                    v-model="shareUrl"
                    :loading="appState.uploadProgress < 101"
                    :color="this.copyed? 'green' : null"
                    append-outer-icon="mdi-content-copy"
                    @click:append-outer="copySharedUrl()"
                  >
                    <template v-slot:progress>
                      <v-progress-linear
                        v-if="appState.uploadProgress < 101"
                        :value="appState.uploadProgress"
                        absolute
                        height="2"
                      ></v-progress-linear>
                    </template>
                  </v-text-field>
                </v-card-text>
                <v-card-actions>
                  <v-btn text>继续上传</v-btn>
                  <v-spacer />
                  <QRCode :value="shareUrl" />
                  <v-btn color="primary" @click="copySharedUrl">
                    复制链接
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>
          </v-stepper>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { azureStore } from '@/stores/azure.js';
import { appStateStore } from '@/stores/states.js';

import shareFile from "@/plugins/onedrive"

import AppBar from './components/AppBar.vue';
import SideBar from './components/SideBar.vue';
import QRCode from './components/QRCode.vue';

export default {
  name: 'App',

  components: {
    AppBar,
    SideBar,
    QRCode
},

  data: () => ({
    file: null,
    isUploading: false,
    shareUrl: '',
    copyed: false,
    appState: appStateStore(),
    azure: azureStore()
  }),

  methods: {
    loginCodeCheck() {
      if (location.search) {
        let params = new URLSearchParams(location.search)
        if (params.has("code")) {
          // localStorage.code = params.get("code")
          localStorage.code = params.get("code")
          window.close()
        }
      } else {
        this.azure.refresh()
      }
    },
    async upload() {
      this.isUploading = true
      this.shareUrl = await shareFile(this.file)
      console.log(this.shareUrl)
    },
    copySharedUrl() {
      const clipboardObj = navigator.clipboard;
      if (clipboardObj) {
        clipboardObj.writeText(this.shareUrl)
          .then(()=>{
            this.copyed = true
            this.$refs.linkbox.focus()
            setTimeout(()=>{this.copyed = false}, 1000)
          })
      }
    }
  },
  computed: {
    step: function () {
      if (!this.azure.isLogined) {
        return 1
      }
      if (!this.isUploading) {
        return 2
      }
      if (!this.shareUrl) {
        return 3
      }
      return 4
    },
    progressValue: function() {
      if (this.progressQuery) {
        return 0
      } else {
        return Math.max(0, Math.min(100, this.appState.uploadProgress))
      }
    },
    progressQuery: function() {
      let progress = this.appState.uploadProgress
      if (progress >= 0 && progress <= 100) {
        return false
      }
      return true
    },
    // 
    // v-model="progressValue"
    // :active="progressActive"
    // :indeterminate="progressQuery"
  },

  mounted() {
    this.loginCodeCheck()
  }
};
</script>
