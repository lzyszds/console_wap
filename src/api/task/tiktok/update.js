import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/user/updateInformation",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/user/updateInformationUp",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/user/updateInformationList",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/user/updateInformationDel",
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
