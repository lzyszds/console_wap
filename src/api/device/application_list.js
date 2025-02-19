import request from '@/utils/request'

export function getApplicationLlist(lang) {
  return request({
    url: 'api/application_list?lang=' + lang,
    method: 'get',
  })
}