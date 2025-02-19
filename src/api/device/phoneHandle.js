import request from '@/utils/request'

// 单击
export function singleClickApi(data) {
  return request({
    url: '/api/click',
    method: 'post',
    data
  })
}

// 滑动
export function swipeApi(data) {
  return request({
    url: '/api/swipe',
    method: 'post',
    data
  })
}

