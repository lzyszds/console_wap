import request from '@/utils/request'


export function addStickersType(params) {
  return request({
    url: '/api/video/stickersType',
    method: 'post',
    data: params
  })
}

export function getStickersTypeList(params) {
  return request({
    url: '/api/video/stickersTypeList',
    method: 'post',
    data: params
  })
}

export function editStickersType(params) {
  return request({
    url: '/api/video/stickersTypeUp',
    method: 'post',
    data: params
  })
}

export function uploadStickers(data, config) {
  return request({
    url: '/api/video/stickersImage',
    method: 'post',
    file: true,
    data,
    ...config
  })
}

export function getStickersList(params) {
  return request({
    url: '/api/video/stickersTypeVideoList',
    method: 'post',
    data: params
  })
}

export function delStickers(params) {
  return request({
    url: '/api/video/stickersImageDel',
    method: 'post',
    data: params
  })
}
