import request from '@/utils/request'


export function addScflType(params) {
  return request({
    url: '/api/video/scflType',
    method: 'post',
    data: params
  })
}

export function getScflTypeList(params) {
  return request({
    url: '/api/video/scflTypeList',
    method: 'post',
    data: params
  })
}

export function editScflType(params) {
  return request({
    url: '/api/video/scflTypeUp',
    method: 'post',
    data: params
  })
}

export function uploadScfl(data, config) {
  return request({
    url: '/api/video/scflImage',
    method: 'post',
    file: true,
    data,
    ...config
  })
}

export function getScflList(params) {
  return request({
    url: '/api/video/scflTypeVideoList',
    method: 'post',
    data: params
  })
}

export function delScfls(params) {
  return request({
    url: '/api/video/scflImageDel',
    method: 'post',
    data: params
  })
}
