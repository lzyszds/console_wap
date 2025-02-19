import request from '@/utils/request'
export function getAppList(params) {
    return request({
        url: '/api/application_type',
        method: 'post',
        data: params
    })
}



