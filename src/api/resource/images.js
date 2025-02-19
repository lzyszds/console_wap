import request from '@/utils/request'

import axios from 'axios'
import { baseurl } from '@/config/config';

export function addImages(data) {
  return request({
    url: '/api/user/uidupload',
    method: 'post',
    file: true,
    data
  })
}

export function getImagesList(params) {
  return request({
    url: '/api/user/uidPictureList',
    method: 'post',
    data: params
  })
}


export function deleteImages(params) {
  return request({
    url: '/api/user/uidPictureDel',
    method: 'post',
    data: params
  })
}

//下载图片
export function downloadImages(url, mediaIds) {
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
