import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/whatsapp/accountMaintenance",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/whatsapp/accountMaintenanceUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/whatsapp/accountMaintenanceDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/whatsapp/accountMaintenanceList",
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
