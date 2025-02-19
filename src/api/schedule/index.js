import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/schedule/task",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/schedule/taskUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/schedule/taskDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/schedule/taskList",
    method: "post",
    data: params,
  });
}

