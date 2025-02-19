import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/snapchat/uidCollection",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/snapchat/uidCollectionUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/snapchat/uidCollectionDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/snapchat/uidCollectionList",
        method: "post",
        data: params,
    });
}

export function dowload(params, taskId) {
    return request({
        url: "/api/task_content_xls/" + taskId,
        method: "post",
        data: params,
    });
}

export function getGatherDetails(id) {
    return request({
        url: "/api/task_content_log/" + id + "?type=snapchat",
        method: "get",
    });
}

export default {
    addData,
    editData,
    deleteData,
    getDataList,
    getGatherDetails
}
