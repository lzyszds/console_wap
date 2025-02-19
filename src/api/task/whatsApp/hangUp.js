import request from '@/utils/request'


export function addData(params) {
    return request({
        url: '/api/whatsapp/hangUp',
        method: 'post',
        data: params
    })
}

export function editData(params) {
    return request({
        url: '/api/whatsapp/hangUpUp',
        method: 'post',
        data: params
    })
}

export function deleteData(params) {
    return request({
        url: '/api/whatsapp/hangUpDel',
        method: 'post',
        data: params
    })
}

export function getDataList(params) {
    return request({
        url: '/api/whatsapp/hangUpList',
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



