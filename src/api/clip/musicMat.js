import request from '@/utils/request'


export function addAudioType(params) {
  return request({
    url: '/api/video/audioType',
    method: 'post',
    data: params
  })
}

export function getAudioTypeList(params) {
  return request({
    url: '/api/video/audioTypeList',
    method: 'post',
    data: params
  })
}

export function editAudioType(params) {
  return request({
    url: '/api/video/audioTypeUp',
    method: 'post',
    data: params
  })
}

export function uploadAudio(data, config) {
  return request({
    url: '/api/video/audiosImage',
    method: 'post',
    file: true,
    data,
    ...config
  })
}

export function getAudioList(params) {
  return request({
    url: '/api/video/audioTypeVideoList',
    method: 'post',
    data: params
  })
}

export function delAudio(params) {
  return request({
    url: '/api/video/audiosImageDel',
    method: 'post',
    data: params
  })
}
