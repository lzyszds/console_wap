import request from '@/utils/request'


export function addGroup(params) {
    return request({
        url: 'api/user/deviceBindingGrouping',
        method: 'post',
        data: params
    })
}

export function editGroup(params) {
    return request({
        url: '/api/user/deviceBindingGroupingUp',
        method: 'post',
        data: params
    })
}


export function getGroupList(params) {
    return request({
        url: '/api/user/groupingList',
        method: 'post',
        data: params
    })
}


export function deleteGroup(params) {
    return request({
        url: '/api/user/groupingDel',
        method: 'post',
        data: params
    })
}


