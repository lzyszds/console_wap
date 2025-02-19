import { initI18n, setMessage } from '@/utils';
import request from '@/utils/request'
import { Modal } from 'ant-design-vue';

import { useStore } from "@/store";
const store = useStore();
let timer = 0

export function taskRun(params) {

  const { publicString, btnString } = initI18n()

  // 防止频繁点击 3秒内
  if (Date.now() - timer < 3000) {
    return setMessage('warning', publicString.message.frequently)
  }

  timer = Date.now()


  if (store.taskRunStatusData.length > 0) {
    for (let key in store.taskRunStatusData) {
      const item = store.taskRunStatusData[key]

      if (item.taskId == params.taskId && item.status == 2) {
        return setMessage('warning', publicString.message.taskRuning)
      }
    }
  }




  if (params.taskType == 'startUp') {
    return request({
      url: '/api/run',
      method: 'post',
      data: params
    })
  }

  Modal.confirm({
    title: publicString.operation,
    content: publicString.message.stopDetermine1 + publicString.message.stopDetermine2,
    okText: btnString.determine,
    cancelText: btnString.close,
    onOk: async () => {
      await request({
        url: '/api/stop',
        method: 'post',
        data: params
      })
    }
  })

}
