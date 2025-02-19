import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/dy/commentTask",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/dy/commentTaskUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/dy/commentTaskDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/dy/commentTaskList",
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
