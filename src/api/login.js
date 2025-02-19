import request from '@/utils/request'


export function login(params) {
    return request({
        url: '/api/web_login',
        method: 'post',
        data: params
    })
}




export function logout() {
    return request({
        url: '/index.php/Admin/Login/logout',
        method: 'get',
        params: {}
    })
}