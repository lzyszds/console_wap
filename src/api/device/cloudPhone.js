import request from '@/utils/request'

//获取云手机列表
export function getCloudPhoneList() {
  return request({
    url: 'api/cloud_phone_list',
    method: 'post',
  })
}


//重启云手机
export function restartCloudRebootMac() {
  return request({
    url: 'api/cloud_reboot_mac',
    method: 'post',
  })
}

//获取云手机root权限
export function getCloudPhoneRoot() {
  return request({
    url: 'api/cloud_root',
    method: 'post',
  })
}


//卸载云手机应用
export function uninstallCloudPhoneApp() {
  return request({
    url: 'api/cloud_uninstallapp',
    method: 'post',
  })
}

//安装云手机应用
export function installCloudPhoneApp() {
  return request({
    url: 'api/cloud_installapp',
    method: 'post',
  })
}

