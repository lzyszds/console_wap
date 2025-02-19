import request from '@/utils/request'


export function addCreditsType(params) {
  return request({
    url: '/api/video/creditsType',
    method: 'post',
    data: params
  })
}

export function getCreditsTypeList(params) {
  return request({
    url: '/api/video/creditsTypeList',
    method: 'post',
    data: params
  })
}

export function editCreditsType(params) {
  return request({
    url: '/api/video/creditsTypeUp',
    method: 'post',
    data: params
  })
}

export function uploadCredits(data, config) {
  return request({
    url: '/api/video/creditsImage',
    method: 'post',
    data,
    file: true,
    data,
    ...config
  })

}

export function getCreditsList(params) {
  return request({
    url: '/api/video/creditsTypeVideoList',
    method: 'post',
    data: params
  })
}

export function delCredits(params) {
  return request({
    url: '/api/video/creditsImageDel',
    method: 'post',
    data: params
  })
}

