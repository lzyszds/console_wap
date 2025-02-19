import request from '@/utils/request'


export function getCourseList() {
  return request({
    url: '/api/article/category/list',
    method: 'get',
  })
}

export function getCourseDetail(id) {
  return request({
    url: '/api/article/categorydetails/' + id,
    method: 'get',
  })
}

