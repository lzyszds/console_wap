import request from '@/utils/request'


export function addDeviceList(params) {
    return request({
        url: 'api/equipment/add',
        method: 'post',
        data: params
    })
}

export function editDeviceList(params) {
    return request({
        url: '/api/equipment/up',
        method: 'post',
        data: params
    })
}


export function getDeviceList(params) {
    return request({
        url: '/api/equipment/list',
        method: 'post',
        data: params
    })
}


export function deleteDeviceList(params) {
    return request({
        url: '/api/equipment/del',
        method: 'post',
        data: params
    })
}



export function getDeviceBackUpLog(params) {
    return request({
        url: '/api/equipment/log',
        method: 'post',
        data: params
    })
}

export function getControllerDeviceIdList() {
    return request({
        url: '/api/de_list',
        method: 'get',
    })
}


export function sendDeviceBackUp(params) {
    return request({
        url: '/api/backUp',
        method: 'post',
        data: params
    })
}


// 查询设备是否在线
export function getDeviceIsOnline(params) {
    return request({
        url: '/api/equipmentCheckOnLine',
        method: 'post',
        data: params
    })
}

