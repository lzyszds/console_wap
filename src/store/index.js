import { defineStore } from 'pinia'
import dayjs from 'dayjs';
import { map } from 'lodash';

export const useStore = defineStore('main', {
  state: () => {
    return {
      componentIndex: "group",
      sendData: {},
      imagesResourceCache: new Map(),
      isPhone: false,
      taskRunStatusData: []
    }
  },
  /**
     * 类似组件的 computed, 用来封装计算属性, 具有缓存特性
     */
  getters: {
    //时间格式化处理
    setTime: (state) => dayjs.unix(state.time).format('YYYY-MM-DD')
  },
  /**
   * 类似组件的 methods, 封装业务逻辑, 修改state
   * 注意: 里面的函数不能定义成箭头函数(函数体中会用到this)
   */
  actions: {
    // 使用 patch，更安全
    updateTaskStatusPatch(data) {
      this.taskRunStatusData = new Map(map(data, (item) => [item.taskId, {
        status: item.status,
        details: item.details,
      }]));
    }
  },

})
