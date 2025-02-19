import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/line/accountMaintenance",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/line/accountMaintenanceUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/line/accountMaintenancepDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/line/accountMaintenanceList",
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
