import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/line/updateInformation",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/line/updateInformationUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/line/updateInformationDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/line/updateInformationList",
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
