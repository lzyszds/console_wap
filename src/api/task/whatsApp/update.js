import request from '@/utils/request'


export function addData(params) {
  console.log(`lzy  params:`, params)
  return request({
    url: '/api/whatsapp/updateInformation',
    method: 'post',
    data: params
  })
}

export function editData(params) {
  return request({
    url: '/api/whatsapp/updateInformationUp',
    method: 'post',
    data: params
  })
}


export function getDataList(params) {
  return request({
    url: '/api/whatsapp/updateInformationList',
    method: 'post',
    data: params
  })
}

export function deleteData(params) {
  return request({
    url: '/api/whatsapp/updateInformationDel',
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
