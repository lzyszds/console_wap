import request from '@/utils/request'


export function setLanguage(lang) {
  return request({
    url: '/api/user/bindLang',
    method: 'post',
    data: { lang }
  })
}



