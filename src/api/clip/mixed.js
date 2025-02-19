import request from '@/utils/request'


export function mixedVideo(params) {
  return request({
    url: '/api/user/mixedVideo',
    method: 'post',
    data: params,
    timeout: 60000
  })
}


export function mixedList(params) {
  return request({
    url: '/api/user/videoList',
    method: 'post',
    data: params
  })
}

export function mixedVideoDel(params) {
  return request({
    url: '/api/user/videoDel',
    method: 'post',
    data: params
  })
}

export function mixedVideoList(params) {
  return request({
    url: '/api/user/hunjianku',
    method: 'post',
    data: params
  })
}

export function mixedVideoListDel(params) {
  return request({
    url: '/api/user/hunjiankuDel',
    method: 'post',
    data: params
  })
}
