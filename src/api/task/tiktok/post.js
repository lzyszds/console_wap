import request from '@/utils/request'


export function addData(params) {
  return request({
    url: '/api/user/postingTasks',
    method: 'post',
    data: params
  })
}

export function editData(params) {
  return request({
    url: '/api/user/postingTasksUp',
    method: 'post',
    data: params
  })
}

export function deleteData(params) {
  return request({
    url: '/api/user/postingTasksDel',
    method: 'post',
    data: params
  })
}

export function getDataList(params) {
  return request({
    url: '/api/user/postingTasksList',
    method: 'post',
    data: params
  })
}



export default {
  addData,
  editData,
  deleteData,
  getDataList,
}
