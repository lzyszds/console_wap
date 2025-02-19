import request from '@/utils/request'


export function addData(params) {
  return request({
    url: '/api/snapchat/postingTasks',
    method: 'post',
    data: params
  })
}

export function editData(params) {
  return request({
    url: '/api/snapchat/postingTasksUp',
    method: 'post',
    data: params
  })
}

export function deleteData(params) {
  return request({
    url: '/api/snapchat/postingTasksDel',
    method: 'post',
    data: params
  })
}

export function getDataList(params) {
  return request({
    url: '/api/snapchat/postingTasksList',
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
