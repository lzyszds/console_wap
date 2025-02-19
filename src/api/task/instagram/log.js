import request from "@/utils/request";


export function getDetail(params) {
  return request({
    url: "/api/log/log_detail",
    method: "post",
    data: params,
  });
}

export function getDataList(params) {
  return request({
    url: "/api/log/list",
    method: "post",
    data: params,
  });
}
export default {
  getDetail,
  getDataList,
}
