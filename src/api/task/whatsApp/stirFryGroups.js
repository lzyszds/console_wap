import request from "@/utils/request";


export function addData(params) {
  return request({
    url: "/api/whatsapp/fryGroup",
    method: "post",
    data: params,
  });
}

export function editData(params) {
  return request({
    url: "/api/whatsapp/fryGroupUp",
    method: "post",
    data: params,
  });
}

export function deleteData(params) {
  return request({
    url: "/api/whatsapp/fryGroupDel",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/whatsapp/fryGroupList",
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
