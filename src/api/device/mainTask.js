import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/mask/task_add",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/mask/task_up",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/mask/task_del",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/mask/task_list",
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
