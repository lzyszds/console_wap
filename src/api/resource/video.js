import request from '@/utils/request'

import axios from 'axios'
import { baseurl } from '@/config/config'
/**
 * @description 上传
 * @param {Object} param data {Object} 传值参数
 */
export function upload(data, config) {
    return request({
        url: '/api/uidvideo/image',
        method: 'post',
        file: true,
        data
    })
}

export function uploadUrl(params) {
    return request({
        url: '/api/user/uidVideoIns',
        method: 'post',
        data: params
    })
}

export function getVideoList(params) {
    return request({
        url: '/api/user/uidVideoList',
        method: 'post',
        data: params
    })
}


export function deleteVideo(params) {
    return request({
        url: '/api/user/uidVideoDel',
        method: 'post',
        data: params
    })
}

//下载视频
export function downloadVideo(url, mediaIds) {
    if (mediaIds) {
        return axios({
            //转换代理地址
            url: baseurl + url,
            method: 'get',
            responseType: 'arraybuffer',
            baseURL: '',
            timeout: 0
        })
    }

    return axios({
        //转换代理地址
        url: baseurl + '/api/getfiles',
        method: 'post',
        responseType: 'arraybuffer',
        data: {
            files_path: url
        },
        timeout: 0
    })
}
