import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/snapchat/accountMaintenance",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/snapchat/accountMaintenanceUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/snapchat/accountMaintenanceDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/snapchat/accountMaintenanceList",
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
