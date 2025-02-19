import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/instagram/accountMaintenance",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/instagram/accountMaintenanceUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/instagram/accountMaintenancepDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/instagram/accountMaintenanceList",
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
