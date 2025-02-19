import { getGroupList } from "@/api/device/group";
import { message, Modal } from "ant-design-vue";
import { reactive } from "vue";
import { matchErrorTip } from './error';
import { isFunction } from "lodash";
import i18n from '@/locales';
import request from '@/utils/request'
import taskData from "@/utils/taskData";


export function initI18n() {
  const { messages, locale } = i18n.global
  let publicString, btnString
  publicString = messages[locale].navigation.public
  btnString = messages[locale].navigation.btn
  if (!publicString || !btnString) {
    publicString = messages["zh"].navigation.public
    btnString = messages["zh"].navigation.btn
  }
  return { publicString, btnString }
}

//睡眠阻塞
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//生成随机整数
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const speeding = (timer) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timer);
  });
};

export async function getResourceFiles(fse, folderPath, type) {
  try {
    // 读取文件夹内容
    const files = await fse.readdir(folderPath);

    // 定义资源文件扩展名
    let resourceExtensions = "";

    if (type == "video") {
      resourceExtensions = ["mp4", "avi", "mov", "mkv", "flv", "wmv"];
    } else if (type == "image") {
      resourceExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "svg"];
    } else if (type == "audio") {
      resourceExtensions = ["mp3", "wav", "ogg", "flac", "aac"];
    } else {
      resourceExtensions = [
        "mp4",
        "avi",
        "mov",
        "mkv",
        "flv",
        "wmv",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "tiff",
        "svg",
        "mp3",
        "wav",
        "ogg",
        "flac",
        "aac",
      ];
    }

    // 过滤资源文件
    const resourceFiles = files.filter((file) => {
      const ext = getFileExtension(file).toLowerCase();
      return resourceExtensions.includes(ext);
    });

    // 返回资源文件名列表
    return resourceFiles;
  } catch (error) {
    console.error("Error reading folder:", error);
    return [];
  }
}

//获取文件扩展名
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

//element 对话框关闭前的回调，会暂停 Dialog 的关闭. 回调函数内执行 done 参数方法的时候才是真正关闭对话框的时候.
export const handleClose = (done) => {
  const { publicString, btnString } = initI18n()
  console.log(btnString);
  console.log(btnString.determine, btnString.cancel);

  ElMessageBox.confirm(publicString.message.closeDialog, publicString.message.tips, {
    confirmButtonText: btnString.determine,
    cancelButtonText: btnString.cancel,
  })
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

export function setMessage(type = 'success', msg = '操作成功', arg) {
  return message[type](msg, arg)
}

//获取分组
export async function getGroupListUtils() {
  let groupList = [];
  let response = await getGroupList();
  if (response.data.status == 200) {
    groupList = response.data.data.list.map((item) => {
      return {
        label: item.cate_name,
        value: item.id,
        device_number_arr: item.device_number_arr,
      };
    });
  } else {
    ElMessage.error({
      message: response.data.msg,
      plain: true,
    });
  }
  return groupList;
}

//获取通用话术
export async function getHuaShuTypeListUtils(requestFn) {
  let huaShuTypeList = [];
  let response = await requestFn();
  if (response.data.status == 200) {
    huaShuTypeList = response.data.data.map((item) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
  } else {
    ElMessage.error({
      message: response.data.msg,
      plain: true,
    });
  }
  return huaShuTypeList
}

/**
 *  获取当前用户支持的应用列表
 *  @param {Function} requestFn 请求方法
 *  @param {Array} arg 请求参数
 *  使用方法在话术资源里面有用到
 */
export async function getAppListUtils(requestFn, ...arg) {
  let appList = [];
  let response = await requestFn(...arg);
  if (response.data.status == 200) {
    appList = response.data.data.map((item) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
  } else {
    ElMessage.error({
      message: response.data.msg,
      plain: true,
    });
  }
  return appList;
}

//校验设备参数是否为空
export const checkDeviceParams = (row) => {
  if (row.grouping_id == "" || row.device_number_arr == "") {
    const { publicString } = initI18n()
    setMessage("warning", publicString.message.group_device_name)

    return false;
  }
  return true;
};

//一键删除任务
export function handleDelFn(rowArr, deleteTaskRequest, handleGetTaskList,
  deleteParams = (val) => {
    return { id: val.id }
  }) {
  const { publicString, btnString } = initI18n()
  if (rowArr.length == 0) {
    setMessage("warning", publicString.message.lackDelect)
    return false;
  } else {

    Modal.confirm({
      title: publicString.operation,
      content: publicString.message.delectDetermine1 + rowArr.length + publicString.message.delectDetermine2,
      async onOk() {
        const res = await Promise.all(
          rowArr.map(async (item) => {
            return await deleteTaskRequest(deleteParams(item));
          })
        );
        const isPass = res.filter((item) => item.data.status != 200);
        if (isPass.length > 0) {
          setMessage("error", btnString.delectChild.fail)
        }
        setMessage("success", btnString.delectChild.success)
        handleGetTaskList();
      },
    });

  }
}

/**
 *  批量停止任务
 * @param {Object} params
 * @param {String} params.taskName 任务名称
 * @param {Function} params.taskData 参数
 * @param {Array} params.rowArr 多项数据
 * @param {Object} params.ipcRenderer ipcRenderer 对象
 * @param {Function} params.handleRun 执行任务
 */
export function allStopFn(params) {
  let { rowArr, platform, taskName } = params;
  const { publicString, btnString } = initI18n()

  if (rowArr.length === 0) {
    setMessage("warning", publicString.message.lackStop)
    return false;
  }

  ElMessageBox.confirm(publicString.message.stopDetermine1 + rowArr.length + publicString.message.stopDetermine2, publicString.operation, {
    confirmButtonText: btnString.determine,
    cancelButtonText: btnString.close,
    type: "warning",
    draggable: true,
  }).then(async () => {
    rowArr = rowArr.map(async res => {
      return {
        data: await taskData[platform][taskName]({
          ...params,
          taskType: "stop",
          row: res,
        }),
        platform: platform,
        taskName: taskName,
        taskType: "stop",
        taskId: res.id,
      }
    })


    const requestAll = rowArr.map(async (item) => {
      return await request({
        url: '/api/stop',
        method: 'post',
        data: await item
      })
    })
    await Promise.all(requestAll);
  });
}



export function useResetableForm(initialData) {
  const form = reactive({ ...initialData });

  const reset = (fields = Object.keys(initialData)) => {
    fields.forEach((field) => {
      if (field in initialData) {
        form[field] = initialData[field];
      }
    });
  };

  //如果有特定值直接写入即可，在tiktok中的更新资料中有用到
  const assign = (data, customAssignments = {}) => {
    Object.keys(form).forEach((key) => {
      if (key in data) {
        if (key in customAssignments) {
          if (isFunction(customAssignments[key])) {
            form[key] = customAssignments[key](data[key]);
          } else {
            form[key] = customAssignments[key];
          }
        } else {
          form[key] = data[key];
        }
      }
    });
  };

  return { form, reset, assign };
}

//获取任务列表
export async function getTaskListDataFn(fn, listQuery) {
  let response = await fn(listQuery);
  if (response.data.status == 200) {
    return response.data.data;
  } else {
    setMessage("error", response.data.msg);
    return null;
  }
}

/**
 *  提交表单
 * @param {Object} params
 * @param {Object} params.form 表单数据
 * @param {String} params.formID 指定当前要提交的表单的id 在话术资源中有用到(有些表单可能id的字段不是'id')
 * @param {String} params.action 操作类型
 * @param {Function} params.checkParameter 检查参数是否为空 
 * @param {Function} params.addDateForm 添加数据方法
 * @param {Function} params.editDateForm 编辑数据方法
 * @param {Function} params.getTableData 获取数据列表方法
 *
 */
export function onSubmitForm(params) {
  const {
    form, // 表单数据
    formID = "id",  // 表单id
    action, // 操作类型
    checkParameter = () => true, // 检查参数是否为空
    addDateForm,  // 添加数据的api方法
    editDateForm, // 编辑数据的api方法
    getTableData, // 获取表格数据
    postFormBefore = () => { }, // 提交表单前的处理
  } = params;
  return new Promise(async (resolve, reject) => {
    // 校验每个设备的单独值是否为空
    function checkSeparate(key, name, device) {
      for (let item of form[key]) {
        if (item.value == "") {
          setMessage("error", `设备：${device}的${name}不能为空`);
          return false;
        }
      }
    }
    // 校验全部值是否为空
    function checkWhole(key, name) {
      if (form[key] == "") {
        setMessage("error", `${name}不能为空`);
        return false;
      }
      return true;
    }
    //先检查参数是否为空
    if (!checkParameter({ checkSeparate, checkWhole })) return;
    postFormBefore(form);
    const { [formID]: id, ...formData } = form;

    let response =
      action == "add" ? await addDateForm(formData) : await editDateForm(form);
    if (response.data.status == 200) {
      resolve(false);
      //获取表格数据
      await getTableData();
    } else {
      reject(response.data.msg);
    }
    setMessage(response.data.status == 200 ? "success" : "error", response.data.msg);
  });
}

export function checkParameterBefore(formData, condition) {
  const { publicString } = initI18n()
  let arr = {};
  for (let key in formData) {
    if (condition.includes(key)) {
      if (formData[key]) {
        try {
          arr[key] = JSON.parse(formData[key]);
        } catch (e) {
          arr[key] = formData[key];
        }
        if (!arr[key]) {
          setMessage("error", `${key} ${publicString.empty}`);
          return false;
        }

      } else {
        setMessage("error", `${key} ${publicString.empty}`);
        return false;
      }
    }
  }
  return true;
}



export const getTxtFile = (file) => {

  if (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        resolve(content);
      };
      reader.onerror = function (e) {
        console.error("文件读取错误:", e);
        reject(e);
      };

      reader.readAsText(file); // 读取文件内容为文本
    });
  } else {
    setMessage("error", "文件不能为空");
  }
};

export const getTxtFileFn = async (file, multDevdata, item, key) => {
  let result = "";
  if (file) {
    result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        resolve(content);
      };
      reader.onerror = function (e) {
        console.error("文件读取错误:", e);
        reject(e);
      };
      reader.readAsText(file.raw); // 读取文件内容为文本
    });
  }
  multDevdata[item][key] = result;
};

export function getFileContent(fse, filePath) {
  return new Promise((resolve, reject) => {
    let fileName = filePath;
    //let fileName = process.cwd()+'/script/tiktok/stop.js';
    //let fileName = "D:/www/chuhai/console/dist/win-unpacked/script/tiktok/stop.js";
    fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  });
}


/**
 * 将执行时间数组转换为 Cron 表达式字符串
 * @param {Array} execute_time - 包含频率、日期、小时和分钟的数组
 * @returns {string} Cron 表达式字符串
 */
export function convertToCronString(execute_time) {
  if (!Array.isArray(execute_time) || execute_time.length !== 4) {
    throw new Error('Invalid execute_time format. Expected an array with 4 elements.');
  }

  const [frequency, dayOfWeekOrMonth, hour, minute] = execute_time;

  // 验证输入
  if (!['day', 'week', 'month'].includes(frequency)) {
    throw new Error('频率值无效。预期的“日”、“周”或“月”。');
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('小时或分钟值无效。');
  }

  let cronParts = ['0', minute.toString(), hour.toString()];

  switch (frequency) {
    case 'day':
      cronParts.push('*', '*', '*');
      break;
    case 'week':
      if (dayOfWeekOrMonth < 1 || dayOfWeekOrMonth > 7) {
        throw new Error('星期几无效。预计1-7。');
      }
      cronParts.push('*', '*', dayOfWeekOrMonth.toString());
      break;
    case 'month':
      if (dayOfWeekOrMonth < 1 || dayOfWeekOrMonth > 31) {
        throw new Error('无效的日数。预计1-31。');
      }
      cronParts.push(dayOfWeekOrMonth.toString(), '*', '*');
      break;
  }

  return cronParts.join(' ');
}


//将Cron 的字符串转换成周期中文字面意思
export function convertCronToChinese(cronExpression) {
  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');

  let description = '每';

  if (dayOfWeek !== '*') {
    const daysOfWeek = {
      '0': '周日',
      '1': '周一',
      '2': '周二',
      '3': '周三',
      '4': '周四',
      '5': '周五',
      '6': '周六',
      '7': '周日' // 0 和 7 都代表周日
    };
    description += daysOfWeek[dayOfWeek];
  } else if (dayOfMonth !== '*') {
    description += `月${dayOfMonth}日`;
  } else {
    description += '天';
  }

  if (hour !== '*') {
    description += `${hour}点`;
  } else {
    description += '的每小时';
  }

  if (minute !== '*') {
    description += `${minute}分`;
  } else {
    description += '的每分钟';
  }



  return description;
}


/**
 * 将 Cron 表达式转换为执行时间数组
 * @param {string} cronString - Cron 表达式字符串
 * @returns {Array} 包含频率、日期、小时和分钟的数组
 */
export function convertCronToArray(cronString) {
  const parts = cronString.split(' ');

  if (parts.length !== 6) {
    throw new Error('Invalid Cron string format. Expected 6 parts.');
  }

  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // 检查秒是否为0，我们只处理不包含秒的情况
  if (second !== '0') {
    throw new Error('This function only supports Cron expressions with 0 as the second field.');
  }

  let frequency, dayValue;

  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    frequency = 'day';
    dayValue = 0; // 对于每天执行的任务，日期值不重要，设为0
  } else if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    frequency = 'week';
    dayValue = parseInt(dayOfWeek);
  } else if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    frequency = 'month';
    dayValue = parseInt(dayOfMonth);
  } else {
    throw new Error('Unsupported Cron format. Only daily, weekly, and monthly frequencies are supported.');
  }

  return [
    frequency,
    dayValue,
    parseInt(hour),
    parseInt(minute)
  ];
}


//处理未初始化的数据 将字符串转换成{deviceId:"",value:""}的形式
export function handleNotInitData(key, res) {
  const notInitData = res.filter((item) => {
    if (!item[key]) return false
    return item[key].indexOf("[") != 0
  });
  if (notInitData.length > 0) {
    notInitData.forEach((item) => {
      const value = item[key];
      item[key] = item.device_number_arr.split(",").map((res) => {
        return {
          deviceId: res,
          value
        };
      });
    });
  }
}

//将每个值转换成响应的value
export function handleValue(key, formData) {
  console.log("🚀 ~ handleValue ~ formData:", formData)
  if (formData.regulation == "0") {
    const beforeData = formData[key][0].value;

    formData[key] = formData[key].map((res, index) => {
      let deviceId = res.deviceId
      if (!deviceId) deviceId = formData.device_number_arr[index]
      return {
        deviceId: deviceId,
        value: beforeData,
      };
    });
  }
  formData[key] = JSON.stringify(formData[key]);
}

//将每个值转换为规则数据的value
export function handleRegulationValue(isCondition, formData, multDevdata) {
  for (let dev of formData.device_number_arr) {
    for (let item of isCondition) {
      //如果它不是一个数组或者为空
      if (!Array.isArray(formData[item]) || !formData) {
        formData[item] = [];
      }
      formData[item].push({
        deviceId: dev,
        value: multDevdata.value[formData.regulation == 0 ? 0 : dev][item],
      });
    }
  }
  for (let item of isCondition) {
    formData[item] = JSON.stringify(formData[item]);
  }
  return formData;
}

//从接口中拿到数据，然后将数据转换成相应的多设备数据
export function handleDataToMultDevdata(isCondition, row, multDevdata, isNewArr) {
  for (let item of isCondition) {
    if (row[item]) {
      // if (item == "upload_content_arr") debugger;
      const rowdata = JSON.parse(!isNewArr ?
        row[item == "upload_content_arr" ? "upload_content_new_arr" : item]
        : row[item]
      );
      for (let dev of rowdata) {
        if (row.regulation == 0) {
          multDevdata.value[0][item] = dev.value;
        } else {
          try {
            multDevdata.value[dev.deviceId][item] = dev.value;
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  }
}


//将表格中的json字符串转换成逗号分隔的字符串 在表格数据中使用
export function convertString(item) {
  if (!item) return ""
  let result;
  try {
    result = JSON.parse(item).map((res) => {
      return res.value
    });
  } catch (e) {
    if (!item) return ""
    try {
      return item.map((res) => res.value);
    } catch (e) {
      return item;
    }
  }
  if (result.filter((res) => res != "").length == 0) return ""

  //去重
  result = [...new Set(result)];

  return item.regulation == "0" ? result[0] : result;
}


//清空状态
export function clearState(state) {
  // 使用for-in循环遍历对象的属性
  for (const key in state) {
    if (state.hasOwnProperty(key)) {
      delete state[key]; // 删除属性
    }
  }
}


//修改编辑表单前 将表单数据{deviceId:"",value:""}转换成响应的对象
export async function handleEditFormBefore(row, multDevdata, isCondition) {
  await sleep(50);
  //给多设备数据赋值
  for (let item of isCondition) {
    if (row[item]) {
      const rowdata = JSON.parse(row[item]);
      for (let dev of rowdata) {
        if (row.regulation == 0) {
          multDevdata.value[0][item] = dev.value;
        } else {
          try {
            multDevdata.value[dev.deviceId][item] = dev.value;
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  }
}

//提交前要先将多设备数据转换成{deviceId:"",value:""}字符串的形式 
export function handlePostFormBefore(formData, multDevdata, isCondition) {
  //将【0】转换为多设备数据
  for (let dev of formData.device_number_arr) {
    for (let item of isCondition) {
      //如果它不是一个数组或者为空
      if (!Array.isArray(formData[item]) || !formData) {
        formData[item] = [];
      }
      let value = multDevdata.value[formData.regulation == 0 ? 0 : dev][item]
      if (typeof value == "object") {
        value = value.join(",")
      }
      formData[item].push({
        deviceId: dev,
        value: value,
      });
    }
  }
  for (let item of isCondition) {
    formData[item] = JSON.stringify(formData[item]);
  }
}

export function splitArray(arr, limit) {
  const result = [];
  for (let i = 0; i < arr.length; i += limit) {
    result.push(arr.slice(i, i + limit));
  }
  return result;
}
