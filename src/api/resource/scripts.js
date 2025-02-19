import request from '@/utils/request'


export function addScript(params) {
  return request({
    url: '/api/user/script',
    method: 'post',
    data: params
  })
}

export function editScript(params) {
  return request({
    url: '/api/user/scriptUp',
    method: 'post',
    data: params
  })
}


export function getScriptList(params) {
  return request({
    url: '/api/user/scriptListTotal',
    method: 'post',
    data: params
  })
}


export function deleteScript(params) {
  return request({
    url: '/api/user/scriptDel',
    method: 'post',
    data: params
  })
}



//分类
export function addScriptType(params) {
  return request({
    url: '/api/user/scriptGrouping',
    method: 'post',
    data: params
  })
}

export function editScriptType(params) {
  return request({
    url: '/api/user/scriptGroupingUp',
    method: 'post',
    data: params
  })
}


export function getScriptTypeList(params) {
  return request({
    url: '/api/user/scriptGroupingList',
    method: 'post',
    data: params
  })
}


export function deleteScriptType(params) {
  return request({
    url: '/api/user/scriptGroupingDel',
    method: 'post',
    data: params
  })
}
