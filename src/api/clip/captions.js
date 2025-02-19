import request from '@/utils/request'


export function addCaptions(params) {
  return request({
    url: '/api/video/writingType',
    method: 'post',
    data: params
  })
}

export function getCaptionsList(params) {
  return request({
    url: '/api/video/writingTypeList',
    method: 'post',
    data: params
  })
}

export function editCaptions(params) {
  return request({
    url: '/api/video/writingTypeUp',
    method: 'post',
    data: params
  })
}

