import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/line/fryGroup",
        method: "post",
        data: params,
    });
} 

export function editData(params) {
    return request({
        url: "/api/line/fryGroupUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/line/fryGroupDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/line/fryGroupList",
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
