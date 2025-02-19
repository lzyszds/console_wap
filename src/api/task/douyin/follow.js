import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/dy/fansFollow",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/dy/fansFollowUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/dy/fansFollowDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/dy/fansFollowList",
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
