import { defineStore } from "pinia";
import axios from "axios";

import sha256 from "crypto-js/sha256";
import encBase64url from "crypto-js/enc-base64url";
import { useLocalStorage } from "@vueuse/core";

const azureData = {
  'client_id': import.meta.env.VITE_MS_CLIENT_ID,
  'redirect_uri': import.meta.env.VITE_MS_REDIRECT_URI,
  'client_secret': import.meta.env.VITE_MS_CLIENT_SECRET,
  scope: 'openid offline_access https://graph.microsoft.com/Files.ReadWrite.AppFolder'
}

export const azureStore = defineStore({
  id: 'azure',
  state: () => ({
    accessToken: useLocalStorage('accessToken', ''),
    refreshToken: useLocalStorage('refreshToken', ''),
    timestamp: useLocalStorage('timestamp', 0),
    pkceData: useLocalStorage('pkceData', {})
  }),
  actions: {
    async login() {
      this.refreshToken = ''
      this.accessToken = ''
      this.timestamp = 0
      this.pkceData = getPKCE()

      window.open((()=>{
        let params = new URLSearchParams({
          client_id: azureData.client_id,
          response_type: 'code',
          redirect_uri: azureData.redirect_uri,
          response_mode: 'query',
          scope: azureData.scope,
          code_challenge: this.pkceData.code_challenge,
          code_challenge_method: this.pkceData.code_challenge_method,
        })
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
      })())
      window.addEventListener('storage', async () => {
        await (async ()=>{
          let code = localStorage.code
          localStorage.removeItem('code')
          try {
            let tokens = await getToken(code, this.pkceData.code_verifier)
            this.accessToken = tokens.access
            this.refreshToken = tokens.refresh
            this.timestamp = tokens.expires * 1000 + (new Date().getTime())
            // console.log(this.timestamp)
            return true
          } catch (error) {
            console.error(error)
            return false
          }
        })();
      }, {once: true});

    },
    logout() {
      this.refreshToken = ''
      this.accessToken = ''
      this.timestamp = 0
    },
    async refresh() {
      try {
        let tokens = await refresh(this.refreshToken)
        this.accessToken = tokens.access
        this.refreshToken = tokens.refresh
        this.timestamp = tokens.expires * 1000 + (new Date().getTime())
        // console.log(this.timestamp)
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },
    async getToken() {
      if (this.timestamp < (new Date()).getTime()) {
        await this.refresh()
      }
      return this.accessToken
    }
  },
  getters: {
    isExpired() {
      return this.timestamp < (new Date()).getTime()
    },
    isLogined() {
      return this.timestamp > 1000
    }
  }
})

async function getToken(code, code_verifier) {
  let data = {
    'client_id': azureData.client_id,
    'scope': azureData.scope,
    'code': code,
    'redirect_uri': azureData.redirect_uri,
    'grant_type': 'authorization_code',
    "code_verifier": code_verifier,
    // 'client_secret': azureData.client_secret
  }
  let ans = (await axios({
    url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`, 
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams(data)
  })).data;
  // console.log(ans)
  return {
    access: ans.access_token,
    refresh: ans.refresh_token,
    expires: ans.expires_in
  }
}

async function refresh(refreshToken) {
  let data = {
    'client_id': azureData.client_id,
    'scope': azureData.scope,
    'refresh_token': refreshToken,
    'grant_type': 'refresh_token'
    // 'client_secret': azureData.client_secret
  }
  let ans = (await axios({
    url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`, 
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams(data)
  })).data;
  return {
    access: ans.access_token,
    refresh: ans.refresh_token,
    expires: ans.expires_in
  }
}

function getPKCE(length=32) {
  let code_verifier = randomStr(length)
  let code_challenge = sha256(code_verifier).toString(encBase64url).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  let code_challenge_method = 'S256'
  return {
    code_verifier,
    code_challenge,
    code_challenge_method
  }

  function randomStr(length, prev = '') {
    if (length <= 0) return prev

    let list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let newStr = prev + list[Math.floor(Math.random() * list.length)]
    return randomStr(length - 1, newStr)
  }
}