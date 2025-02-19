import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/user/commentTask",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/user/commentTaskUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/user/commentTaskDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/user/commentTaskList",
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
