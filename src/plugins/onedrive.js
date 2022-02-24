import Axios from 'axios';

import { appStateStore } from '@/stores/states.js';
import { azureStore } from '@/stores/azure.js';

async function uploadLargeFile(file, path) {
  let azure = azureStore()
  let appState = appStateStore()
  let token = await azure.getToken()
  appState.uploadProgress = 0

  let uploadURLResponse = await Axios({
    method: 'POST',
    url: `https://graph.microsoft.com/v1.0/drive/special/approot:/${path}:/createUploadSession`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  let uploadUrl = uploadURLResponse.data.uploadUrl

  console.log(uploadUrl)

  return Axios({
    method: 'PUT',
    url: uploadUrl,
    data: file,
    headers: {
      'Content-Range': `bytes 0-${file.size - 1}/${file.size}`,
    },
    onUploadProgress: (progress) => {
      appState.uploadProgress = Math.round(progress.loaded / progress.total * 100)
    }
  });
}
async function uploadTinyFile(file, path) {
  let azure = azureStore()
  let appState = appStateStore()
  let token = await azure.getToken()
  appState.uploadProgress = 0

  return Axios({
    method: 'PUT',
    url: `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${path}:/content`,
    data: file,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (progress) => {
      appState.uploadProgress = Math.round(progress.loaded / progress.total * 100)
    }
  });

}
async function uploadFile(file) {
  try {
    let path = `onedrive-share/${Date.now()}/${file.name}`
    let ans = null;
    if (file.size > 4 * 1000 * 1000) {
      ans = await uploadLargeFile(file, path)
    } else {
      ans = await uploadTinyFile(file, path)
    }
    return ans
  } catch (error) {
    console.error(error)
  }
}

async function shareFile(file) {
  let azure = azureStore()
  let token = await azure.getToken()
  let cloudId = (await uploadFile(file)).data.id
  let shareResponse = Axios({
    method: 'POST',
    url: `https://graph.microsoft.com/v1.0/me/drive/items/${cloudId}/createLink`,
    data: {
      type: 'view',
      scope: 'anonymous',
    },
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  let shareId = (await shareResponse).data.shareId
  let shareUrl = `https://api.onedrive.com/v1.0/shares/${shareId}/root/content`
  return shareUrl
}

export default shareFile;