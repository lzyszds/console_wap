import request from '@/utils/request'


export function addData(params) {
    return request({
        url: '/api/whatsapp/messageFriend',
        method: 'post',
        data: params
    })
}

export function editData(params) {
    return request({
        url: '/api/whatsapp/messageFriendUp',
        method: 'post',
        data: params
    })
}

export function deleteData(params) {
    return request({
        url: '/api/whatsapp/messageFriendDel',
        method: 'post',
        data: params
    })
}

export function getDataList(params) {
    return request({
        url: '/api/whatsapp/messageFriendList',
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
