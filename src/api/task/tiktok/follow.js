import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/user/fansFollow",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/user/fansFollowUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/user/fansFollowDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/user/fansFollowList",
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
