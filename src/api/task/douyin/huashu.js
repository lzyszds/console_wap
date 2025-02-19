import request from '@/utils/request'


export function addHuaShu(params) {
    return request({
        url: 'api/user/deviceBindingGrouping',
        method: 'post',
        data: params
    })
}

export function editHuaShu(params) {
    return request({
        url: '/api/user/deviceBindingGroupingUp',
        method: 'post',
        data: params
    })
}


export function getHuaShuList(params) {
    return request({
        url: '/api/user/scriptList',
        method: 'post',
        data: params
    })
}



export function getHuaShuTypeList(params) {
    return request({
        url: '/api/user/scriptGroupingList',
        method: 'post',
        data: params
    })
}


export function deleteHuaShu(params) {
    return request({
        url: '/api/user/groupingDel',
        method: 'post',
        data: params
    })
}

//==============================================


