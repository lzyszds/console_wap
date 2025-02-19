import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/snapchat/commentTask",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/snapchat/commentTaskUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/snapchat/commentTaskDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/snapchat/commentTaskList",
    method: "post",
    data: params,
  });
}

export default {
  addData,
  editData,
  deleteData,
  getDataList,
}
