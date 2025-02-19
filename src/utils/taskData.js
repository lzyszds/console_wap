import { getHuaShuTypeList, getHuaShuList } from "@/api/task/tiktok/huashu";
import { setMessage } from "./index";
import { initI18n } from '@/utils';


//生成随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//组装字符串 ['a','b']  ==> 'a','b'
function arrToStr1(strArr) {

  let str = ""
  let ccArr = strArr
  for (let c = 0; c < ccArr.length; c++) {
    str = str + "'" + ccArr[c] + "'" + ","
  }
  str = str.substring(0, str.length - 1)
  return str;
}

//组装字符串 a,b  ==> 'a','b'
function arrToStr2(s) {

  let str = ""
  let ccArr = s.split(',')
  for (let c = 0; c < ccArr.length; c++) {
    str = str + "'" + ccArr[c] + "'" + ","
  }
  str = str.substring(0, str.length - 1)
  return str;
}

//组装字符串 [1,2]  ==> 1,2
function arrToStr3(strArr) {
  let strArrStr = strArr.toString()
  return strArrStr
 
}


function splitByLastDot(str) {
  // 获取最后一个点的索引
  const lastIndex = str.lastIndexOf('.');
  // 如果没有点或者点在第一个位置，返回空数组
  if (lastIndex === -1 || lastIndex === 0) {
    return [];
  }
  // 截取点之前的部分
  const beforeDot = str.substring(0, lastIndex);
  // 截取点之后的部分（包括点）
  const afterDot = str.substring(lastIndex);
  // 返回包含两部分的数组
  return [beforeDot, afterDot];
}


const checkHasScript = (data) => {
  const { publicString } = initI18n();
  if (!data.length) {
    console.log(publicString);
    setMessage("error", publicString.message.noScript)
    throw new Error("没有获取到话术信息")
  }
}



export const tiktok = {
  title: 'TikTok',
  //养号的推送参数
  yanghao: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []


    //查询话术信息
    let huashuResponse, huaShuList;
    huashuResponse = await getHuaShuList({ grouping_id: row.script_type });
    huaShuList = huashuResponse.data.data;
    checkHasScript(huaShuList)
    //随机获取话术
    let hsIndex = getRandomInt(0, huaShuList.length - 1);


    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.huashu = huaShuList[hsIndex].script_content
      d.followProbability = row.follow_probability
      d.likeProbability = row.like_probability
      d.seeCommentProbability = row.see_comment_probability
      d.hairCommentProbability = row.hair_comment_probability
      d.durationStayTime = row.duration_stay
      d.yanghaoTime = row.number_maintenance_duration
      d.wayType = row.wayType
      d.collectProbability = row.collectProbability
      d.regulation = row.regulation

      //判断系统养号或指定博主
      if (row.wayType == 1) {
        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装博主id
          let bloggerIdStr = row.bloggerId.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
          let bozhuIdList = JSON.parse(bloggerIdStr)
          for (let z = 0; z < bozhuIdList.length; z++) {
            if (devicesList[i] == bozhuIdList[z].deviceId) {
              d.bloggerId = bozhuIdList[z].value;
              break;
            }
          }

        }
      }

      devicesDateList.push(d)
    }

    return devicesDateList;
  },
  update: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []
    let nameIndex = 0;
    let bioIndex = 0;
    let fIndex = 0;

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.name = row.name
      d.bio = row.bio
      d.type = row.update_value
      d.regulation = row.regulation
      //d.fileName = row.imagesContent


      //判断规则
      let regulation = row.regulation; //0=全部 1=顺序
      if (regulation == "0") {

        //组装name and bio 
        d.name = row.name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
        d.bio = row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")

        //头像
        let fileNameList = row.imagesContent.split(",");
        d.fileName = fileNameList[0]


      } else if (regulation == "1") {

        let nameList = row.name.split("\n")
        if (nameIndex > nameList.length - 1) {
          nameIndex = 0;
        }
        d.name = nameList[nameIndex];
        nameIndex++;

        let bioList = row.bio.split("\n")
        if (bioIndex > bioList.length - 1) {
          bioIndex = 0;
        }
        d.bio = bioList[bioIndex];
        bioIndex++;

        //头像
        let fileNameList = row.imagesContent.split(",");
        if (fIndex > fileNameList.length - 1) {
          fIndex = 0;
        }
        d.fileName = fileNameList[fIndex]
        fIndex++

      }

      devicesDateList.push(d)
    }

    return devicesDateList;
  },

  //数据采集
  getuid: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.bozhuId = row.blogger_ids ? row.blogger_ids.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "") : ""
      d.keyword = row.keyword
      d.collectionNumber = row.collection_num
      d.fansArea = row.fans_area

      devicesDateList.push(d)
    }
    return devicesDateList;

  },

  follow: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      //d.bozhuId = row.blogger_ids ? row.blogger_ids.replaceAll(/[@\r\n\\\\]/g, "") : ""
      d.followNumber = row.follow_num
      d.intervalTime = row.follow_time
      d.followWay = Number(row.follow_way)
      d.followRange = row.follow_range
      d.regulation = row.regulation

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        //组装博主id
        let bozhuIdStr = row.blogger_ids ? row.blogger_ids.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "") : ""
        if (bozhuIdStr) {
          let bozhuIdList = JSON.parse(bozhuIdStr)
          for (let z = 0; z < bozhuIdList.length; z++) {
            if (devicesList[i] == bozhuIdList[z].deviceId) {
              d.bozhuId = bozhuIdList[z].value;
              break;
            }
          }
        }

      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  message: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.messageNumber = row.message_num
      d.messageTime = row.message_time
      d.regulation = row.regulation

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        let messageStr = row.message_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let messageList = JSON.parse(messageStr)
        for (let z = 0; z < messageList.length; z++) {
          if (devicesList[i] == messageList[z].deviceId) {
            d.messageContent = messageList[z].value;
            break;
          }
        }
      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },
  post: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      //d.messageContent: row.regulation == 0 ? JSON.parse(row.message_content)[0].content : row.message_content
      // d.messageNumber = row.message_num
      // d.intervalTime = row.follow_time
      // d.messageTime = row.message_time
      // d.regulation =  row.regulation



      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {


        //文件类型
        let fileTypeStr = row.upload_type
        let fileTypeList = JSON.parse(fileTypeStr)
        for (let z = 0; z < fileTypeList.length; z++) {
          if (devicesList[i] == fileTypeList[z].deviceId) {
            d.fbType = fileTypeList[z].value;
            break;
          }
        }

        //文件
        let fileStr = row.upload_content_new_arr
        let fileList = JSON.parse(fileStr)
        for (let z = 0; z < fileList.length; z++) {
          if (devicesList[i] == fileList[z].deviceId) {
            d.fileName = fileList[z].value;
            break;
          }
        }

        //标题
        let titleStr = row.title
        let titleList = JSON.parse(titleStr)
        for (let z = 0; z < titleList.length; z++) {
          if (devicesList[i] == titleList[z].deviceId) {
            d.titleContent = titleList[z].value;
            break;
          }
        }


        //话题
        let topicStr = row.topic
        let topicList = JSON.parse(topicStr)
        for (let z = 0; z < topicList.length; z++) {
          if (devicesList[i] == topicList[z].deviceId) {
            d.huatiContent = topicList[z].value;
            break;
          }
        }


        //@谁
        let whoStr = row.call_who.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let whoList = JSON.parse(whoStr)
        for (let z = 0; z < whoList.length; z++) {
          if (devicesList[i] == whoList[z].deviceId) {
            d.friendsContent = whoList[z].value;
            break;
          }
        }

        //地址
        let addressStr = row.address
        let addressList = JSON.parse(addressStr)
        for (let z = 0; z < addressList.length; z++) {
          if (devicesList[i] == addressList[z].deviceId) {
            d.locationContent = addressList[z].value;
            break;
          }
        }


      }

      devicesDateList.push(d)
    }
    return devicesDateList;
    // return {
    //   taskId: row.id, //任务id
    //   titleContent: row.title,
    //   huatiContent: row.topic,
    //   friendsContent: row.call_who,
    //   locationContent: row.address,
    //   fbType: row.upload_type,
    //   fileName: row.upload_content_arr,
    //   regulation: row.regulation,
    // };
  },
  //点赞
  likes: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("rowrow", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.intervalTime = row.pending_execution_time
      d.regulation = row.regulation

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        //组装博主id
        let bloggerIdStr = row.bloggerId.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")

        let bozhuIdList = JSON.parse(bloggerIdStr)
        for (let z = 0; z < bozhuIdList.length; z++) {
          if (devicesList[i] == bozhuIdList[z].deviceId) {
            d.bozhuId = bozhuIdList[z].value;
            break;
          }
        }
      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },
  //评论
  comment: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      //d.keyword = row.keyword
      //d.content = row.content
      d.task_num = row.task_num


      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        let keywordList = JSON.parse(row.keyword)
        for (let z = 0; z < keywordList.length; z++) {
          if (devicesList[i] == keywordList[z].deviceId) {
            d.keyword = keywordList[z].value;
            break;
          }
        }

        let contentList = JSON.parse(row.content)
        for (let z = 0; z < contentList.length; z++) {
          if (devicesList[i] == contentList[z].deviceId) {
            d.content = contentList[z].value;
            break;
          }
        }

      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },
}

export const whatsApp = {
  title: 'WhatsApp',
  //养号的推送参数
  yanghao: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.wayType = row.wayType // 养号类型
      //d.friendPhone= row.friendPhone.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") // 好友手机号
      //d.wsGroupName= row.wsGroupName // 设置群名称
      d.chatDuration = row.chatDuration // 聊天时长
      d.chatInterva = row.chatInterva // 聊天间隔时间/秒
      d.romdomMessage = row.romdomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") // 随机信息

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {


        //组装
        let wayStr = row.wayType.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let wayList = JSON.parse(wayStr)
        for (let z = 0; z < wayList.length; z++) {
          if (devicesList[i] == wayList[z].deviceId) {
            d.wayType = wayList[z].value;
            break;
          }
        }


        //组装
        let friendStr = row.friendPhone.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let friendList = JSON.parse(friendStr)
        for (let z = 0; z < friendList.length; z++) {
          if (devicesList[i] == friendList[z].deviceId) {
            d.friendPhone = friendList[z].value;
            break;
          }
        }


        //组装
        let groupStr = row.wsGroupName.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let groupList = JSON.parse(groupStr)
        for (let z = 0; z < groupList.length; z++) {
          if (devicesList[i] == groupList[z].deviceId) {
            d.wsGroupName = groupList[z].value;
            break;
          }
        }

      }




      devicesDateList.push(d)
    }
    return devicesDateList;


    // return {
    //   wayType: row.wayType, // 养号类型
    //   friendPhone: row.friendPhone.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), // 好友手机号
    //   wsGroupName: row.wsGroupName, // 设置群名称
    //   chatDuration: row.chatDuration, // 聊天时长
    //   chatInterva: row.chatInterva, // 聊天间隔时间/秒
    //   romdomMessage: row.romdomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), // 随机信息
    // };
  },
  update: async (params) => {
    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []
    let nameIndex = 0;
    let statusIndex = 0;
    let pwdIndex = 0;
    let fIndex = 0;

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.updateValue = row.update_value.toString() //修改项
      //imagesContent: row.upload_content_arr, //头像
      //d.fileName= row.upload_content_arr
      //d.name= row.name //名称
      //d.status= row.userStatus //状态
      //d.pwdVerify=row.pwdVerify //密码验证

      //判断规则
      let regulation = row.regulation; //0=全部 1=顺序
      if (regulation == "0") {


        d.name = row.name
        d.status = row.userStatus
        d.pwdVerify = row.pwdVerify

        //头像
        let fileNameList = row.upload_content_arr.split(",");
        d.fileName = fileNameList[0]


      } else if (regulation == "1") {


        //
        let nameList = row.name.split(",")
        if (nameIndex > nameList.length - 1) {
          nameIndex = 0;
        }
        d.name = nameList[nameIndex];
        nameIndex++;

        //
        let statusList = row.userStatus.split(",")
        if (statusIndex > statusList.length - 1) {
          statusIndex = 0;
        }
        d.status = statusList[statusIndex];
        statusIndex++;

        //
        let pwdList = row.pwdVerify.split(",")
        if (pwdIndex > pwdList.length - 1) {
          pwdIndex = 0;
        }
        d.pwdVerify = pwdList[pwdIndex];
        pwdIndex++;

        //头像
        let fileNameList = row.upload_content_arr.split(",");
        if (fIndex > fileNameList.length - 1) {
          fIndex = 0;
        }
        d.fileName = fileNameList[fIndex]
        fIndex++

      }



      devicesDateList.push(d)
    }
    return devicesDateList;
    // return {
    //   taskId: row.id, //任务id
    //   updateValue: row.update_value.toString(), //修改项
    //   //imagesContent: row.upload_content_arr, //头像
    //   fileName: row.upload_content_arr,
    //   name: row.name, //名称
    //   status: row.userStatus, //状态
    //   pwdVerify: row.pwdVerify, //密码验证
    // }
  },
  addFriend: async (params) => {
    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      //d.taskId= row.id, // 任务ID
      //d.way= row.way, // 关注方式
      //d.contactsUploadList= row.contactsUploadList.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") // 通讯录上传列表
      d.num = row.num // 数量
      d.time = row.time// 间隔时长
      d.randomMessage = row.randomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") // 随机信息

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        //组装
        let friendStr = row.contactsUploadList.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let friendList = JSON.parse(friendStr)
        for (let z = 0; z < friendList.length; z++) {
          if (devicesList[i] == friendList[z].deviceId) {
            d.contactsUploadList = friendList[z].value;
            break;
          }
        }

        //组装
        let wayStr = row.way.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let wayList = JSON.parse(wayStr)
        for (let z = 0; z < wayList.length; z++) {
          if (devicesList[i] == wayList[z].deviceId) {
            d.way = wayList[z].value;
            break;
          }
        }

      }

      devicesDateList.push(d)
    }
    return devicesDateList;
    // return {
    //   taskId: row.id, // 任务ID
    //   way: row.way, // 关注方式
    //   contactsUploadList: row.contactsUploadList.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), // 通讯录上传列表
    //   num: row.num, // 数量
    //   time: row.time, // 间隔时长
    //   randomMessage: row.randomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), // 随机信息
    // };
  },
  stirFryGroups: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      //d.taskId= row.id, //任务id.
      //d.stirfryGroupsId= row.stirfry_groups_id.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") //炒群群名
      d.messageTime = row.message_time //间隔时间
      d.stirfryTimer = row.stirfry_timer //炒群时长
      d.romdomMessage = row.romdomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") //随机信息


      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        //组装群名
        let groupsStr = row.stirfry_groups_id.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let groupList = JSON.parse(groupsStr)
        for (let z = 0; z < groupList.length; z++) {
          if (devicesList[i] == groupList[z].deviceId) {
            d.stirfryGroupsId = groupList[z].value;
            break;
          }
        }

      }


      devicesDateList.push(d)
    }
    return devicesDateList;
    // return {
    //   taskId: row.id, //任务id.
    //   stirfryGroupsId: row.stirfry_groups_id.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //炒群群名
    //   messageTime: row.message_time, //间隔时间
    //   stirfryTimer: row.stirfry_timer, //炒群时长
    //   romdomMessage: row.romdomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //随机信息
    // };
  },
  message: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.privateMessage = row.private_message //私信类型
      //d.friendId=row.friend_id.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") //好友id
      d.messageTime = row.message_time //间隔时间
      d.romdomMessage = row.romdomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") //随机信息

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        //组装群名
        let friendStr = row.friend_id.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let friendList = JSON.parse(friendStr)
        for (let z = 0; z < friendList.length; z++) {
          if (devicesList[i] == friendList[z].deviceId) {
            d.friendId = friendList[z].value;
            break;
          }
        }

      }

      devicesDateList.push(d)
    }
    return devicesDateList;
    // return {
    //   privateMessage: row.private_message, //私信类型
    //   friendId: row.friend_id.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //好友id
    //   messageTime: row.message_time, //间隔时间
    //   romdomMessage: row.romdomMessage.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //随机信息
    // }
  },
}

export const snapchat = {
  title: 'Snapchat',
  //养号的推送参数
  yanghao: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.id = row.id //id
      d.wayType = row.wayType.toString() // 养号类型 gs是故事 jgd是聚光灯
      d.see_count = row.see_count //浏览数量
      d.follow_probability = row.follow_probability //关注概率
      d.like_probability = row.like_probability //点赞概率
      d.hair_comment_probability = row.hair_comment_probability //发评论概率
      d.comment_content = row.comment_content ? row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : "" //评论内容
      d.duration_stay = [
        Number(row.duration_stay[0]),
        Number(row.duration_stay[1]),
      ].toString() //停留时长


      devicesDateList.push(d)
    }
    return devicesDateList;

    // return {
    //   id: row.id, //id
    //   wayType: row.wayType.toString(), // 养号类型 gs是故事 jgd是聚光灯
    //   see_count: row.see_count, //浏览数量
    //   follow_probability: row.follow_probability, //关注概率
    //   like_probability: row.like_probability, //点赞概率
    //   hair_comment_probability: row.hair_comment_probability, //发评论概率
    //   comment_content: row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //评论内容
    //   duration_stay: [
    //     Number(row.duration_stay[0]),
    //     Number(row.duration_stay[1]),
    //   ].toString(), //停留时长
    // };
  },
  //更新资料
  update: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.id = row.id //id
      d.update_value = row.update_value.toString() //修改项
      d.realName = row.realName ? row.realName.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : "" //真实姓名
      d.username = row.username ? row.username.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : "" //用户名
      d.bio = row.bio ? row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""//简介 不超过150个字
      d.birthday = row.birthday //生日
      d.imagesContent = row.imagesContent //头像
      d.location = JSON.stringify(row.location)//地区


      devicesDateList.push(d)
    }
    return devicesDateList;

    // return {
    //   id: row.id, //id
    //   update_value: row.update_value.toString(), //修改项
    //   realName: row.realName.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //真实姓名
    //   username: row.username.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //用户名
    //   bio: row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //简介 不超过150个字
    //   birthday: row.birthday, //生日
    //   imagesContent: row.imagesContent, //头像
    //   location: row.location.toString(), //地区
    // };
  },
  //点赞
  likelink: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []


    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.id = row.id //id
      d.wayType = row.wayType //来源类型
      d.see_count = row.see_count //浏览数量
      d.link_urls = row.link_urls ? row.link_urls.toString().replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : "" //链接
      d.follow_probability = row.follow_probability //关注概率
      d.like_probability = row.like_probability //点赞概率
      d.hair_comment_probability = row.hair_comment_probability //发评论概率
      d.comment_content = row.comment_content ? row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : "" //评论内容
      d.duration_stay = [
        Number(row.duration_stay[0]),
        Number(row.duration_stay[1]),
      ].toString() //停留时长


      devicesDateList.push(d)
    }
    return devicesDateList;

    // return {
    //   id: row.id, //id
    //   wayType: row.wayType, //来源类型
    //   see_count: row.see_count, //浏览数量
    //   link_urls: row.link_urls.toString().replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //链接
    //   follow_probability: row.follow_probability, //关注概率
    //   like_probability: row.like_probability, //点赞概率
    //   hair_comment_probability: row.hair_comment_probability, //发评论概率
    //   comment_content: row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //评论内容
    //   duration_stay: [
    //     Number(row.duration_stay[0]),
    //     Number(row.duration_stay[1]),
    //   ].toString(), //停留时长
    // };
  },
  //发帖
  releaseTask: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []


    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.id = row.id
      d.wayType = row.wayType // 发帖类型 gs是故事 jgd是聚光灯
      d.videoContent = row.videoContent //媒体内容
      d.mediaSuffic = row.mediaSuffic //媒体后缀
      d.txt = row.txt ? row.txt.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : "" //文本内容
      d.isAddMusic = !row.isAddMusic ? true : false //是否添加音乐


      devicesDateList.push(d)
    }
    return devicesDateList;

    // return {
    //   id: row.id,
    //   wayType: row.wayType, // 发帖类型 gs是故事 jgd是聚光灯
    //   videoContent: row.videoContent, //媒体内容
    //   mediaSuffic: row.mediaSuffic, //媒体后缀
    //   txt: row.txt.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //文本内容
    //   isAddMusic: !row.isAddMusic ? true : false, //是否添加音乐
    // };
  },
  addfriend: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.id = row.id
      d.grouping_id = row.grouping_id
      d.device_number_arr = row.device_number_arr
      d.way = row.way
      d.addNumber = row.addNumber.toString()
      d.addGap = row.addGap.toString()

      d.isChat = row.isChat  //是否私聊 
      d.chatType = row.chatType //// 0:文本，1:图片 2:图文
      d.text = row.text  //文本消息
      d.imagesContent = row.imagesContent //图片内容 
      d.mediaSuffic = row.mediaSuffic //图片后缀
      d.accounts = arrToStr2(row.account)



      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  //私信
  message: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      // d.id = row.id
      // d.grouping_id = row.grouping_id
      // d.device_number_arr = row.device_number_arr
      // d.way = row.way
      d.chatNumber = row.chatNumber
      d.intervalTime = row.duration_interval


      d.chatType = row.chatType //// 0:文本，1:图片 2:图文
      d.text = row.text.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")   //文本消息
      d.imagesContent = row.imagesContent //图片内容 
      d.mediaSuffic = row.mediaSuffic //图片后缀

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  //帖子评论
  comment: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      // d.id = row.id
      // d.grouping_id = row.grouping_id
      // d.device_number_arr = row.device_number_arr
      // d.way = row.way
      //d.chatNumber = row.chatNumber
      //d.intervalTime = row.duration_interval


      //评论参数
      let comment_content = ""
      let ccArr = row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").split(",")
      for (let c = 0; c < ccArr.length; c++) {
        comment_content = comment_content + "'" + ccArr[c] + "'" + ","
      }
      comment_content = comment_content.substring(0, comment_content.length - 1)

      let linkUrls = ""
      let linkUrlsArr = row.linkUrls.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").split(",")
      for (let c = 0; c < linkUrlsArr.length; c++) {
        linkUrls = linkUrls + "'" + linkUrlsArr[c] + "'" + ","
      }
      linkUrls = linkUrls.substring(0, linkUrls.length - 1)

      let keywords = ""
      let keywordsArr = row.keywords.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").split(",")
      for (let c = 0; c < keywordsArr.length; c++) {
        keywords = keywords + "'" + keywordsArr[c] + "'" + ","
      }
      keywords = keywords.substring(0, keywords.length - 1)


      d.linkUrls = linkUrls
      d.maxRoll = row.maxRoll
      d.keywords = keywords
      d.keywordNum = row.keywordNum
      d.followProbability = row.follow_probability
      d.likeProbability = row.like_probability
      d.hairCommentProbability = row.hair_comment_probability
      d.commentContent = comment_content

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  //采集
  getuid: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      let keywords = ""
      let keywordsArr = row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").split(",")
      for (let c = 0; c < keywordsArr.length; c++) {
        keywords = keywords + "'" + keywordsArr[c] + "'" + ","
      }
      keywords = keywords.substring(0, keywords.length - 1)


      d.keywords = keywords
      d.collNum = row.coll_num
      d.collCommentNum = row.collComment_num
      d.intervalTime = row.duration_interval
      d.collType = row.coll_type

      devicesDateList.push(d)
    }
    return devicesDateList;
  }


}


export const douyin = {

  title: 'Douyin',

  yanghao: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []


    //查询话术信息
    let huashuResponse, huaShuList;
    huashuResponse = await getHuaShuList({ grouping_id: row.script_type });
    huaShuList = huashuResponse.data.data;
    checkHasScript(huaShuList)
    //随机获取话术
    let hsIndex = getRandomInt(0, huaShuList.length - 1);



    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.wayType = row.wayType
      d.followProbability = row.follow_probability
      d.likeProbability = row.like_probability
      d.seeCommentProbability = row.see_comment_probability
      d.hairCommentProbability = row.hair_comment_probability
      d.collectProbability = row.collectProbability
      d.seeCount = row.seeCount
      d.numberMaintenanceDuration = row.number_maintenance_duration
      d.durationStay = row.duration_stay
      d.huashu = huaShuList[hsIndex].script_content


      if (row.wayType == 1) {

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let bloggerIdStr = row.bloggerId.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
          let bloggerIdList = JSON.parse(bloggerIdStr)
          for (let z = 0; z < bloggerIdList.length; z++) {
            if (devicesList[i] == bloggerIdList[z].deviceId) {
              d.bloggerId = bloggerIdList[z].value;
              break;
            }
          }

        }

      }

      if (row.wayType == 2) {

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let searchNameStr = row.search_name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
          let searchNameList = JSON.parse(searchNameStr)
          for (let z = 0; z < searchNameList.length; z++) {
            if (devicesList[i] == searchNameList[z].deviceId) {
              d.searchName = searchNameList[z].value;
              break;
            }
          }
        }

        d.browsingTypes = 1
      }

      if (row.wayType == 3) {

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let searchNameStr = row.search_name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
          let searchNameList = JSON.parse(searchNameStr)
          for (let z = 0; z < searchNameList.length; z++) {
            if (devicesList[i] == searchNameList[z].deviceId) {
              d.searchName = searchNameList[z].value;
              break;
            }
          }
        }

        d.browsingTypes = 2
      }


      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  update: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []
    let nameIndex = 0;
    let bioIndex = 0;
    let fIndex = 0;

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.type = row.update_value
      d.name = row.name
      d.bio = row.bio
      d.regulation = row.regulation
      d.sex = row.sex
      d.birthday = row.birthday
      d.location = row.location


      //判断规则
      let regulation = row.regulation; //0=全部 1=顺序
      if (regulation == "0") {

        //组装name and bio 
        d.name = row.name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
        d.bio = row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")

        //头像
        let fileNameList = row.imagesContent.split(",");
        d.fileName = fileNameList[0]


      } else if (regulation == "1") {

        let nameList = row.name.split("\n")
        if (nameIndex > nameList.length - 1) {
          nameIndex = 0;
        }
        d.name = nameList[nameIndex];
        nameIndex++;

        let bioList = row.bio.split("\n")
        if (bioIndex > bioList.length - 1) {
          bioIndex = 0;
        }
        d.bio = bioList[bioIndex];
        bioIndex++;

        //头像
        let fileNameList = row.imagesContent.split(",");
        if (fIndex > fileNameList.length - 1) {
          fIndex = 0;
        }
        d.fileName = fileNameList[fIndex]
        fIndex++

      }

      devicesDateList.push(d)
    }

    return devicesDateList;
  },

  message: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.messageNumber = row.message_num
      d.messageTime = row.message_time
      d.regulation = row.regulation
      d.privateArea = row.private_message

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        let messageStr = row.message_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let messageList = JSON.parse(messageStr)
        for (let z = 0; z < messageList.length; z++) {
          if (devicesList[i] == messageList[z].deviceId) {
            d.messageContent = messageList[z].value;
            break;
          }
        }
      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  follow: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.followWay = row.follow_way
      d.followNumber = row.follow_num
      d.collectPercent = row.collect_percent
      d.commentContent = row.comment_content ? row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      d.likePercent = row.like_percent
      d.commentPercent = row.comment_percent
      d.messageContent = row.message_content ? row.message_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      d.duration_stay = row.follow_time //停留时长
      d.duration_stay = row.follow_time //停留时长

      //私信百分比
      d.privatePercent = 0
      if (row.after_operation.search("1") >= 0) {
        d.privatePercent = 100
      }

      if (row.before_operation == "") {
        d.commentContent = ""
        d.collectPercent = 0
        d.likePercent = 0
        d.commentPercent = 0
      }
      if (row.after_operation == "") {
        d.messageContent = ""
      }


      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        let bloggerIdStr = row.blogger_ids.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let bloggerList = JSON.parse(bloggerIdStr)
        for (let z = 0; z < bloggerList.length; z++) {
          if (devicesList[i] == bloggerList[z].deviceId) {
            d.bozhuId = bloggerList[z].value;
            break;
          }
        }
      }


      if (row.follow_way == 4) {

        //搜索关键词
        let searchNameStr = row.search_name ? row.search_name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        let searchNameList = JSON.parse(searchNameStr)
        for (let z = 0; z < searchNameList.length; z++) {
          if (devicesList[i] == searchNameList[z].deviceId) {
            d.searchName = searchNameList[z].value;
            d.bozhuId = d.searchName
            break;
          }
        }
      }

      if (row.follow_way == 5) {

        //搜索关键词
        let searchNameStr = row.search_name ? row.search_name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        let searchNameList = JSON.parse(searchNameStr)
        for (let z = 0; z < searchNameList.length; z++) {
          if (devicesList[i] == searchNameList[z].deviceId) {
            d.searchName = searchNameList[z].value;
            d.bozhuId = d.searchName
            break;
          }
        }

        //评论匹配内容  
        let matchContentStr = row.comment_section_keywords ? row.comment_section_keywords.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        let matchContentList = JSON.parse(matchContentStr)
        for (let z = 0; z < matchContentList.length; z++) {
          if (devicesList[i] == matchContentList[z].deviceId) {
            d.matchContent = matchContentList[z].value;
            break;
          }
        }
      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  CommentTask: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("comment_row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      if (row.comment_way == 1) {

        d.commentWay = row.comment_way
        d.seeNumber = row.see_num
        d.followPercent = row.follow_percent
        d.collectPercent = row.collect_percent
        d.likePercent = row.like_percent
        d.commentPercent = row.comment_percent
        d.commentNumber = row.comment_num
        d.duration_stay = row.duration_interval //停留时长

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          let keywordStr = row.keyword ? row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let keywordList = JSON.parse(keywordStr)
          for (let z = 0; z < keywordList.length; z++) {
            if (devicesList[i] == keywordList[z].deviceId) {
              d.searchName = keywordList[z].value;
              break;
            }
          }

          let contentStr = row.content ? row.content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let contentList = JSON.parse(contentStr)
          for (let z = 0; z < contentList.length; z++) {
            if (devicesList[i] == contentList[z].deviceId) {
              d.commentMessage = contentList[z].value;
              break;
            }
          }

        }

      }


      if (row.comment_way == 2) {

        d.commentWay = row.comment_way
        d.seeNumber = row.see_num
        d.followPercent = row.follow_percent
        //d.collectPercent = row.collect_percent
        d.likePercent = row.like_percent
        d.commentPercent = row.comment_percent
        d.commentNumber = row.comment_num
        d.duration_stay = row.duration_interval //停留时长

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          let keywordStr = row.keyword ? row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let keywordList = JSON.parse(keywordStr)
          for (let z = 0; z < keywordList.length; z++) {
            if (devicesList[i] == keywordList[z].deviceId) {
              d.searchName = keywordList[z].value;
              break;
            }
          }

          let contentStr = row.content ? row.content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let contentList = JSON.parse(contentStr)
          for (let z = 0; z < contentList.length; z++) {
            if (devicesList[i] == contentList[z].deviceId) {
              d.commentMessage = contentList[z].value;
              break;
            }
          }

          let comment_sectionStr = row.comment_section ? row.comment_section.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let csList = JSON.parse(comment_sectionStr)
          for (let z = 0; z < csList.length; z++) {
            if (devicesList[i] == csList[z].deviceId) {
              d.comment_section = csList[z].value;

              if (d.comment_section == '1') {
                d.matchContent = ""
              }

              if (d.comment_section == '2') {
                let matchContentStr = row.comment_section_keywords ? row.comment_section_keywords.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
                let matchContentList = JSON.parse(matchContentStr)
                for (let z = 0; z < matchContentList.length; z++) {
                  if (devicesList[i] == matchContentList[z].deviceId) {
                    d.matchContent = matchContentList[z].value;
                    break;
                  }
                }
              }

              break;
            }
          }
        }

      }


      if (row.comment_way == 3) {

        d.commentWay = row.comment_way
        d.seeNumber = row.see_num
        d.followPercent = row.follow_percent
        //d.collectPercent = row.collect_percent
        d.likePercent = row.like_percent
        d.commentPercent = row.comment_percent
        d.commentNumber = row.comment_num
        d.duration_interval = row.duration_interval //停留时长
        d.duration_stay = row.duration_stay

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          let keywordStr = row.keyword ? row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let keywordList = JSON.parse(keywordStr)
          for (let z = 0; z < keywordList.length; z++) {
            if (devicesList[i] == keywordList[z].deviceId) {
              d.searchName = keywordList[z].value;
              break;
            }
          }

          let contentStr = row.content ? row.content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let contentList = JSON.parse(contentStr)
          for (let z = 0; z < contentList.length; z++) {
            if (devicesList[i] == contentList[z].deviceId) {
              d.commentMessage = contentList[z].value;
              break;
            }
          }
        }

      }


      if (row.comment_way == 4) {

        //搜索关键词

        d.commentWay = row.comment_way
        //d.seeNumber = row.see_num
        //d.followPercent = row.follow_percent
        //d.collectPercent = row.collect_percent
        //d.likePercent = row.like_percent
        //d.commentPercent = row.comment_percent
        d.commentNumber = row.comment_num
        //d.duration_interval = row.duration_interval //停留时长
        d.duration_stay = row.duration_stay


        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          let bloggerIdStr = row.bloggerId ? row.bloggerId.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "") : ""
          let bloggerIdList = JSON.parse(bloggerIdStr)
          for (let z = 0; z < bloggerIdList.length; z++) {
            if (devicesList[i] == bloggerIdList[z].deviceId) {
              d.searchName = bloggerIdList[z].value;
              d.bozhuId = d.searchName
              break;
            }
          }

          let contentStr = row.content ? row.content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let contentList = JSON.parse(contentStr)
          for (let z = 0; z < contentList.length; z++) {
            if (devicesList[i] == contentList[z].deviceId) {
              d.commentMessage = contentList[z].value;
              break;
            }
          }

        }

      }

      if (row.comment_way == 5) {

        d.commentWay = row.comment_way
        //d.seeNumber = row.see_num
        //d.followPercent = row.follow_percent
        //d.collectPercent = row.collect_percent
        //d.likePercent = row.like_percent
        //d.commentPercent = row.comment_percent
        d.commentNumber = row.comment_num
        //d.duration_interval = row.duration_interval //停留时长
        d.duration_stay = row.duration_stay


        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          let contentStr = row.content ? row.content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let contentList = JSON.parse(contentStr)
          for (let z = 0; z < contentList.length; z++) {
            if (devicesList[i] == contentList[z].deviceId) {
              d.commentMessage = contentList[z].value;
              break;
            }
          }

          let comment_sectionStr = row.comment_section ? row.comment_section.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
          let csList = JSON.parse(comment_sectionStr)
          for (let z = 0; z < csList.length; z++) {
            if (devicesList[i] == csList[z].deviceId) {
              d.comment_section = csList[z].value;

              if (d.comment_section == '1') {
                d.matchContent = ""
              }

              if (d.comment_section == '2') {
                let matchContentStr = row.comment_section_keywords ? row.comment_section_keywords.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
                let matchContentList = JSON.parse(matchContentStr)
                for (let z = 0; z < matchContentList.length; z++) {
                  if (devicesList[i] == matchContentList[z].deviceId) {
                    d.matchContent = matchContentList[z].value;
                    break;
                  }
                }
              }

              break;
            }
          }


        }

      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },
  getuid: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      d.wayType = row.coll_area

      if (row.coll_area == 0) {
        d.searchName = row.keyword ? row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        d.collectionNumber = row.collection_num
        d.collDirection = row.coll_direction
      }

      if (row.coll_area == 1) {

        if (row.search_type == 0) {
          d.searchName = row.keyword ? row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        }

        if (row.search_type == 1) {
          d.searchName = row.link ? row.link.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        }
        d.collectionNumber = row.collection_num
        d.browseNumber = row.see_num
      }

      if (row.coll_area == 2) {

        d.searchName = row.keyword ? row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        d.collectionNumber = row.collection_num
        d.fansNumberType = row.fans_num
        d.customerType = row.user_type
      }

      if (row.coll_area == 3) {

        d.searchName = row.blogger_ids ? row.blogger_ids.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "") : ""
        d.fansNumber = 0
        d.followersNumber = row.collection_num
        d.fansNumberType = row.fans_num
        d.customerType = row.user_type
        d.browseNumber = row.see_num
      }

      if (row.coll_area == 4) {

        d.searchName = row.blogger_ids ? row.blogger_ids.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "") : ""
        d.fansNumber = row.collection_num
        d.followersNumber = 0
        d.fansNumberType = row.fans_num
        d.customerType = row.user_type
        d.browseNumber = row.see_num
      }


      if (row.coll_area == 5) {

        d.searchName = row.keyword ? row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
        d.fansNumber = row.collection_num
        d.followersNumber = row.followers_num
        d.browseNumber = row.see_num
      }

      if (row.coll_area == 7) {
        d.collectionNumber = row.collection_num
      }
      if (row.coll_area == 8) {
        d.collectionNumber = row.collection_num
      }

      devicesDateList.push(d)
    }
    return devicesDateList;

  },
  releaseTask: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {


        //文件类型 0=视频 1=图片
        let fileTypeStr = row.upload_type
        let fileTypeList = JSON.parse(fileTypeStr)
        for (let z = 0; z < fileTypeList.length; z++) {
          if (devicesList[i] == fileTypeList[z].deviceId) {
            d.fbType = fileTypeList[z].value;
            break;
          }
        }

        //文件
        let fileStr = row.upload_content_new_arr
        let fileList = JSON.parse(fileStr)
        for (let z = 0; z < fileList.length; z++) {
          if (devicesList[i] == fileList[z].deviceId) {
            d.fileName = fileList[z].value;
            break;
          }
        }

        //标题
        let titleStr = row.title
        let titleList = JSON.parse(titleStr)
        for (let z = 0; z < titleList.length; z++) {
          if (devicesList[i] == titleList[z].deviceId) {
            d.titleContent = titleList[z].value;
            break;
          }
        }


        //话题
        let topicStr = row.topic
        let topicList = JSON.parse(topicStr)
        for (let z = 0; z < topicList.length; z++) {
          if (devicesList[i] == topicList[z].deviceId) {
            d.huatiContent = topicList[z].value;
            break;
          }
        }


        //@谁
        let whoStr = row.call_who.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").replaceAll("@", "")
        let whoList = JSON.parse(whoStr)
        for (let z = 0; z < whoList.length; z++) {
          if (devicesList[i] == whoList[z].deviceId) {
            d.friendsContent = whoList[z].value;
            break;
          }
        }

        // //地址
        // let addressStr = row.address
        // let addressList = JSON.parse(addressStr)
        // for (let z = 0; z < addressList.length; z++) {
        //   if (devicesList[i] == addressList[z].deviceId) {
        //     d.locationContent = addressList[z].value;
        //     break;
        //   }
        // }


      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

}


export const line = {
  title: 'Line',
  //养号的推送参数
  yanghao: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.wayType = row.wayType
      d.intervalTime = row.duration_interval
      d.totalChatTime = row.duration_chat
      d.totalTime = row.number_maintenance_duration

      if (row.wayType == 1 || row.wayType == 2) {

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let searchStr = row.search_name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
          let searchList = JSON.parse(searchStr)
          for (let z = 0; z < searchList.length; z++) {
            if (devicesList[i] == searchList[z].deviceId) {
              d.search = searchList[z].value;
              break;
            }
          }

          //组装
          let messagesStr = row.message_value.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
          let messagesList = JSON.parse(messagesStr)
          for (let z = 0; z < messagesList.length; z++) {
            if (devicesList[i] == messagesList[z].deviceId) {
              d.messages = messagesList[z].value;
              break;
            }
          }

        }

      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },
  //更新资料
  update: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []
    let nameIndex = 0;
    let bioIndex = 0;
    let fIndex = 0;

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]
      d.updateValue = row.update_value

      //判断规则
      let regulation = row.regulation; //0=全部 1=顺序
      if (regulation == "0") {

        //组装name and bio 
        d.name = row.name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
        d.bio = row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")

        //头像
        let fileNameList = row.imagesContent.split(",");
        d.fileName = fileNameList[0]


      } else if (regulation == "1") {

        let nameList = row.name.split(",")
        if (nameIndex > nameList.length - 1) {
          nameIndex = 0;
        }
        d.name = nameList[nameIndex];
        nameIndex++;

        let bioList = row.bio.split(",")
        if (bioIndex > bioList.length - 1) {
          bioIndex = 0;
        }
        d.bio = bioList[bioIndex];
        bioIndex++;

        //头像
        let fileNameList = row.imagesContent.split(",");
        if (fIndex > fileNameList.length - 1) {
          fIndex = 0;
        }
        d.fileName = fileNameList[fIndex]
        fIndex++

      }

      devicesDateList.push(d)
    }
    return devicesDateList;

    // return {
    //   id: row.id, //id
    //   update_value: row.update_value.toString(), //修改项
    //   realName: row.realName.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //真实姓名
    //   username: row.username.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //用户名
    //   bio: row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""), //简介 不超过150个字
    //   birthday: row.birthday, //生日
    //   imagesContent: row.imagesContent, //头像
    //   location: row.location.toString(), //地区
    // };
  },
  // //点赞
  // likelink: async (params) => {

  //   const { platform, taskName, taskType, taskData, row } = params;
  //   console.log("row", row)

  //   let devicesList = row.device_number_arr.split(",");
  //   let devicesDateList = []


  //   for (let i = 0; i < devicesList.length; i++) {

  //     let d = {}

  //     //外加字段
  //     d.platform = platform
  //     d.taskName = taskName
  //     d.taskType = taskType
  //     d.taskId = row.id
  //     d.javascriptName = ""
  //     d.deviceId = devicesList[i]

  //     d.id = row.id //id
  //     d.wayType = row.wayType //来源类型
  //     d.see_count = row.see_count //浏览数量
  //     d.link_urls = row.link_urls?row.link_urls.toString().replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""):"" //链接
  //     d.follow_probability = row.follow_probability //关注概率
  //     d.like_probability = row.like_probability //点赞概率
  //     d.hair_comment_probability = row.hair_comment_probability //发评论概率
  //     d.comment_content = row.comment_content?row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""):"" //评论内容
  //     d.duration_stay = [
  //       Number(row.duration_stay[0]),
  //       Number(row.duration_stay[1]),
  //     ].toString() //停留时长


  //     devicesDateList.push(d)
  //   }
  //   return devicesDateList;

  // },
  //发帖
  releaseTask: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []


    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {


        // //文件类型 0=视频 1=图片
        // let fileTypeStr = row.upload_type
        // let fileTypeList = JSON.parse(fileTypeStr)
        // for (let z = 0; z < fileTypeList.length; z++) {
        //   if (devicesList[i] == fileTypeList[z].deviceId) {
        //     d.fbType = fileTypeList[z].value;
        //     break;
        //   }
        // }

        //文件
        let fileStr = row.upload_content_arr
        let fileList = JSON.parse(fileStr)
        for (let z = 0; z < fileList.length; z++) {
          if (devicesList[i] == fileList[z].deviceId) {
            d.fileName = fileList[z].value;
            break;
          }
        }

        //标题
        let titleStr = row.title
        let titleList = JSON.parse(titleStr)
        for (let z = 0; z < titleList.length; z++) {
          if (devicesList[i] == titleList[z].deviceId) {
            d.titleContent = titleList[z].value;
            break;
          }
        }

      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },
  AddFriend: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.intervalTime = row.AddFriend_time
      d.wayType = row.AddFriend_way
      d.addTotalNumber = row.add_total_number

      if (d.wayType == 1) {

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let friendStr = row.friends_ids.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
          let friendList = JSON.parse(friendStr)
          for (let z = 0; z < friendList.length; z++) {
            if (devicesList[i] == friendList[z].deviceId) {
              d.friendsIdStr = friendList[z].value;
              break;
            }
          }

          //组装
          let messagesStr = row.message_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
          let messagesList = JSON.parse(messagesStr)
          for (let z = 0; z < messagesList.length; z++) {
            if (devicesList[i] == messagesList[z].deviceId) {
              d.messagesStr = messagesList[z].value;
              break;
            }
          }

        }

      }

      if (d.wayType == 2) {

      }

      if (d.wayType == 3) {

        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let messagesStr = row.message_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
          let messagesList = JSON.parse(messagesStr)
          for (let z = 0; z < messagesList.length; z++) {
            if (devicesList[i] == messagesList[z].deviceId) {
              d.messagesStr = messagesList[z].value;
              break;
            }
          }

        }


      }

      if (d.wayType == 5) {
        d.addFrendsAtuoSettingValue = row.addFrends_atuo_setting
        d.addFrendsAllowSettingValue = row.addFrends_allow_setting
      }


      devicesDateList.push(d)
    }
    return devicesDateList;
  },
  stirFryGroups: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]



      d.intervalTime = row.duration_interval //间隔时间
      d.totalChatTime = row.duration_chat //聊天时长
      d.message = row.message_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") //随机信息


      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {

        //组装群名
        let groupsStr = row.grouping_name.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
        let groupList = JSON.parse(groupsStr)
        for (let z = 0; z < groupList.length; z++) {
          if (devicesList[i] == groupList[z].deviceId) {
            d.stirfryGroupsId = groupList[z].value;
            break;
          }
        }
      }


      devicesDateList.push(d)
    }
    return devicesDateList;
  },



}


export const instagram = {
  title: 'Instagram',

  //养号的推送参数
  yanghao: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("rowdsaf", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.wayType = row.wayType
      d.seeCount = row.see_count
      d.followProbability = row.follow_probability
      d.likeProbability = row.like_probability
      d.hairCommentProbability = row.hair_comment_probability
      d.durationStay = row.duration_stay.toString()

      //评论参数
      let ccArr = row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "").split(",")
      d.commentContent = arrToStr1(ccArr)

      if (row.wayType == 'home') {
        d.recommend = row.recommend
      }

      if (row.wayType == "appoint") {


        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let searchStr = row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
          let searchList = JSON.parse(searchStr)
          for (let z = 0; z < searchList.length; z++) {
            if (devicesList[i] == searchList[z].deviceId) {
              //d.keyword = searchList[z].value;
              let keyword = arrToStr1(searchList[z].value.split(","))
              d.keyword = keyword;
              break;
            }
          }
        }

      }

      if (row.wayType == "keyword") {


        //判断规则
        let regulation = row.regulation; //0=全部 1=单个
        if (regulation == "0" || regulation == "1") {

          //组装
          let searchStr = row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
          let searchList = JSON.parse(searchStr)
          for (let z = 0; z < searchList.length; z++) {
            if (devicesList[i] == searchList[z].deviceId) {
              //d.keyword = searchList[z].value;
              let keyword = arrToStr1(searchList[z].value.split(","))
              d.keyword = keyword;
              break;
            }
          }
        }

      }


      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  //更新资料
  update: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []
    let nameIndex = 0;
    let bioIndex = 0;
    let fIndex = 0;
    let linksIndex = 0;

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      d.update_value = row.update_value.toString() //修改项
      //d.realName = row.realName?row.realName.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""):"" //真实姓名
      //d.bio = row.bio?row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", ""):""//简介 不超过150个字
      //d.gender = row.gender
      //d.imagesContent = row.imagesContent //头像
      //d.links = row.links //个人主页


      //判断规则
      let regulation = row.regulation; //0=全部 1=顺序
      if (regulation == "0" || regulation == '') {

        //组装name , bio ,主页
        d.realName = row.realName.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
        d.bio = row.bio.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")
        d.links = row.links.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")

        //头像
        let fileNameList = row.imagesContent.split(",");
        d.fileName = fileNameList[0]

        //性别
        d.gender = row.gender



      } else if (regulation == "1") {

        //真实姓名
        let nameList = row.realName.split("\n")
        if (nameIndex > nameList.length - 1) {
          nameIndex = 0;
        }
        d.realName = nameList[nameIndex];
        nameIndex++;

        //bio
        let bioList = row.bio.split("\n")
        if (bioIndex > bioList.length - 1) {
          bioIndex = 0;
        }
        d.bio = bioList[bioIndex];
        bioIndex++;

        //主页
        let linksList = row.links.split("\n")
        if (linksIndex > linksList.length - 1) {
          linksIndex = 0;
        }
        d.links = linksList[linksIndex];
        linksIndex++;

        //头像
        let fileNameList = row.imagesContent.split(",");
        if (fIndex > fileNameList.length - 1) {
          fIndex = 0;
        }
        d.fileName = fileNameList[fIndex]
        fIndex++

        //性别
        d.gender = row.gender

      }


      devicesDateList.push(d)
    }
    return devicesDateList;
  },


  releaseTask: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]

      //d.messageContent: row.regulation == 0 ? JSON.parse(row.message_content)[0].content : row.message_content
      // d.messageNumber = row.message_num
      // d.intervalTime = row.follow_time
      // d.messageTime = row.message_time
      // d.regulation =  row.regulation
      d.wayType = row.wayType



      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {


        //文件类型
        let fileTypeStr = row.wayType
        let fileTypeList = JSON.parse(fileTypeStr)
        for (let z = 0; z < fileTypeList.length; z++) {
          if (devicesList[i] == fileTypeList[z].deviceId) {
            d.fbType = fileTypeList[z].value;
            if (fileTypeList[z].value == "image") {
              d.ty = 0
            }
            if (fileTypeList[z].value == "video") {
              d.ty = 1
            }
            break;
          }
        }



        //文件
        let fileStr = row.videoContent
        let fileList = JSON.parse(fileStr)
        for (let z = 0; z < fileList.length; z++) {
          if (devicesList[i] == fileList[z].deviceId) {
            d.fileName = fileList[z].value;
            d.suffic = splitByLastDot(d.fileName)[1].substring(1, splitByLastDot(d.fileName)[1].length);
            break;
          }
        }

        //标题
        let titleStr = row.txt
        let titleList = JSON.parse(titleStr)
        for (let z = 0; z < titleList.length; z++) {
          if (devicesList[i] == titleList[z].deviceId) {
            d.titleContent = titleList[z].value;
            break;
          }
        }


        //地址
        let addressStr = row.address
        let addressList = JSON.parse(addressStr)
        for (let z = 0; z < addressList.length; z++) {
          if (devicesList[i] == addressList[z].deviceId) {
            d.address = addressList[z].value;
            break;
          }
        }


      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  message: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      //私信数量
      // d.chatNumber = row.chatNumber


      //判断规则
      let regulation = row.regulation; //0=全部 1=单个
      if (regulation == "0" || regulation == "1") {


        //私信方向
        let chatTypeStr = row.chatType
        let chatTypeList = JSON.parse(chatTypeStr)
        for (let z = 0; z < chatTypeList.length; z++) {
          if (devicesList[i] == chatTypeList[z].deviceId) {
            d.chatType = chatTypeList[z].value;
            break;
          }
        }

        //内容类型
        let cententTypeList = JSON.parse(row.cententType)
        for (let z = 0; z < cententTypeList.length; z++) {
          if (devicesList[i] == cententTypeList[z].deviceId) {
            d.cententType = cententTypeList[z].value;
            break;
          }
        }



        //内容文本
        let textList = JSON.parse(row.text)
        for (let z = 0; z < textList.length; z++) {
          if (devicesList[i] == textList[z].deviceId) {
            d.text = textList[z].value;
            break;
          }
        }

        //内容图片
        if (d.cententType == 1) {
          let imagesList = JSON.parse(row.imagesContent)
          for (let z = 0; z < textList.length; z++) {
            if (devicesList[i] == imagesList[z].deviceId) {
              d.images = imagesList[z].value;
              d.suffic = splitByLastDot(d.images)[1].substring(1, splitByLastDot(d.images)[1].length);
              break;
            }
          }

        }


        //账号
        if (d.chatType == 0) {
          let accountsList = JSON.parse(row.accounts)
          for (let z = 0; z < accountsList.length; z++) {
            if (devicesList[i] == accountsList[z].deviceId) {
              d.accounts = arrToStr2(accountsList[z].value);
              break;
            }
          }
        }

        //私信数量
        let chatNumberList = JSON.parse(row.chatNumber)
        for (let z = 0; z < chatNumberList.length; z++) {
          if (devicesList[i] == chatNumberList[z].deviceId) {
            d.chatNumber = arrToStr3(chatNumberList[z].value);
            break;
          }
        }
      }

      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  //采集
  getuid: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]


      let keywords = row.keyword.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "")


      d.keywords = arrToStr2(keywords);
      d.fansNum = row.fansNum
      d.followNum = row.followNum
      d.intervalTime = row.duration_interval


      devicesDateList.push(d)
    }
    return devicesDateList;
  },

  follow: async (params) => {

    const { platform, taskName, taskType, taskData, row } = params;
    console.log("row", row)

    let devicesList = row.device_number_arr.split(",");
    let devicesDateList = []

    for (let i = 0; i < devicesList.length; i++) {

      let d = {}

      //外加字段
      d.platform = platform
      d.taskName = taskName
      d.taskType = taskType
      d.taskId = row.id
      d.javascriptName = ""
      d.deviceId = devicesList[i]



      d.wayType = row.follow_type;
      d.evt = row.follow_type;

      let followBeforeStr = row.followBefore ? row.followBefore.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      let followBeforeList = JSON.parse(followBeforeStr)
      for (let z = 0; z < followBeforeList.length; z++) {
        if (devicesList[i] == followBeforeList[z].deviceId) {
          if(followBeforeList[z].value == "0"){
            d.isDo = "false";
          }else{
            d.isDo = "true";
          }
          break;
        }
      }
      

      let durationStayStr = row.duration_stay ? row.duration_stay.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (durationStayStr) {
        let durationStayList = JSON.parse(durationStayStr)
        for (let z = 0; z < durationStayList.length; z++) {
          if (devicesList[i] == durationStayList[z].deviceId) {
            d.seeGap = durationStayList[z].value;
            break;
          }
        }
      }else{
        d.seeGap = "0,0"
      }

      let viewPostsNumberStr = row.viewPostsNumber ? row.viewPostsNumber.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (durationStayStr) {
        let list = JSON.parse(viewPostsNumberStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.num = list[z].value;
            break;
          }
        }
      }else{
        d.num = "0,0"
      }


      let collectProbabilityStr = row.collectProbability ? row.collectProbability.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (collectProbabilityStr) {
        let list = JSON.parse(collectProbabilityStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.favPercent = list[z].value;
            break;
          }
        }
      }else{
        d.favPercent = 0
      }

      let like_probabilityStr = row.like_probability ? row.like_probability.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (like_probabilityStr) {
        let list = JSON.parse(like_probabilityStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.likePercent = list[z].value;
            break;
          }
        }
      }else{
        d.likePercent = 0
      }

      let hair_comment_probabilityStr = row.hair_comment_probability ? row.hair_comment_probability.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (hair_comment_probabilityStr) {
        let list = JSON.parse(hair_comment_probabilityStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.commentPercent = list[z].value;
            break;
          }
        }
      }else{
        d.commentPercent = 0
      }

      let comment_contentStr = row.comment_content ? row.comment_content.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (comment_contentStr) {
        let list = JSON.parse(comment_contentStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.commentConts = arrToStr2(list[z].value);
            break;
          }
        }
      }else{
        d.commentConts = ""
      }


      let follow_intervalStr = row.follow_interval ? row.follow_interval.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (follow_intervalStr) {
        let list = JSON.parse(follow_intervalStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.gap = list[z].value;
            break;
          }
        }
      }else{
        d.gap = "0,0"
      }

      let usernamesStr = row.usernames ? row.usernames.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (usernamesStr) {
        let list = JSON.parse(usernamesStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.usernames = arrToStr2(list[z].value);
            break;
          }
        }
      }else{
        d.usernames = ""
      }

      let numberStr = row.number ? row.number.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (numberStr) {
        let list = JSON.parse(numberStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.fansNum = list[z].value;
            break;
          }
        }
      }else{
        d.fansNum = 0
      }

      let keywordsStr = row.keywords ? row.keywords.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (keywordsStr) {
        let list = JSON.parse(keywordsStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.keywords = list[z].value;
            break;
          }
        }
      }else{
        d.keywords = ""
      }

      let linksStr = row.links ? row.links.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (linksStr) {
        let list = JSON.parse(linksStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.links = arrToStr2(list[z].value);
            break;
          }
        }
      }else{
        d.linksStr = ""
      }

      let commentFollowNumberStr = row.commentFollowNumber ? row.commentFollowNumber.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (commentFollowNumberStr) {
        let list = JSON.parse(commentFollowNumberStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.commentNum = list[z].value;
            break;
          }
        }
      }else{
        d.commentNum = 0
      }

      let likeNumStr = row.likeNum ? row.likeNum.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (likeNumStr) {
        let list = JSON.parse(likeNumStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.likeNum = list[z].value;
            break;
          }
        }
      }else{
        d.likeNum = 0
      }


      let commentFilterStr = row.commentFilter ? row.commentFilter.replaceAll("\\n", "").replaceAll("\r\n", "").replaceAll("\n", "") : ""
      if (commentFilterStr) {
        let list = JSON.parse(commentFilterStr)
        for (let z = 0; z < list.length; z++) {
          if (devicesList[i] == list[z].deviceId) {
            d.commentFilter = list[z].value.toString();
            break;
          }
        }
      }else{
        d.commentFilter = "null"
      }


      

    
      devicesDateList.push(d)
    }

    console.log(devicesDateList)
    return devicesDateList;
  },




}

export default {
  tiktok,
  whatsApp,
  snapchat,
  douyin,
  line,
  instagram
}
