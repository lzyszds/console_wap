import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/user/likeTask",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/user/likeTaskUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/user/likeTaskDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/user/likeTaskList",
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
