import { defineStore } from "pinia";
import { $fetch } from 'ohmyfetch'
import deasync from "deasync";

import sha256 from "crypto-js/sha256";
import encBase64url from "crypto-js/enc-base64url";

const azureData = {
  'client_id': '94047eae-723e-43bd-ac33-b6353e98401f',
  'redirect_uri': 'http://localhost:3000',
  'client_secret': 'DG17Q~0wmCMiR2h0wtJ4bJZuGAK5llyQlPg8I',
  scope: 'openid offline_access https://graph.microsoft.com/Files.ReadWrite.AppFolder'
}

export const azureStore = defineStore({
  id: 'azure',
  state: () => ({
    accessToken: '',
    refreshToken: '',
    timestamp: 0,
    pkceData: {}
  }),
  actions: {
    async login(state) {
      state.refreshToken = ''
      state.accessToken = ''
      state.pkceData = getPKCE()

      window.open((()=>{
        let params = new URLSearchParams({
          client_id: azureData.client_id,
          response_type: 'code',
          redirect_uri: azureData.redirect_uri,
          response_mode: 'query',
          scope: azureData.scope,
          code_challenge: state.pkceData.code_challenge,
          code_challenge_method: state.pkceData.code_challenge_method,
        })
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
      })())
      window.addEventListener('storage', async () => {
        await regToken()
      }, {once: true});

      async function regToken() {
        let code = localStorage.code
        localStorage.removeItem('code')
        try {
          let tokens = await getToken(code, state.pkceData.code_verifier)
          state.accessToken = tokens.access
          state.refreshToken = tokens.refresh
          state.timestamp = tokens.expires * 1000 + (new Date().getTime())
          console.log(state.timestamp)
          return true
        } catch (error) {
          console.log(error)
          return false
        }
      }
    },
    logout(state) {
      state.refreshToken = ''
      state.accessToken = ''
    },
    async refresh(state) {
      try {
        let tokens = await refresh(state.refreshToken)
        state.accessToken = tokens.access
        state.refreshToken = tokens.refresh
        state.timestamp = tokens.expires * 1000 + (new Date().getTime())
        console.log(state.timestamp)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
    async token(state) {
      if (state.timestamp < (new Date()).getTime()) {
        await state.refresh()
      }
      return state.accessToken
    }
  },
  getters: {
  },
  // persist: import.meta.env.PROD ? {
  //   key: 'theKey'
  // } : true,
  persist: true
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
  let ans = await $fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data)
  });
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
  let ans = await $fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data)
  });
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