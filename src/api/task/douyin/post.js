import request from '@/utils/request'


export function addData(params) {
  return request({
    url: '/api/dy/postingTasks',
    method: 'post',
    data: params
  })
}

export function editData(params) {
  return request({
    url: '/api/dy/postingTasksUp',
    method: 'post',
    data: params
  })
}

export function deleteData(params) {
  return request({
    url: '/api/dy/postingTasksDel',
    method: 'post',
    data: params
  })
}

export function getDataList(params) {
  return request({
    url: '/api/dy/postingTasksList',
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
