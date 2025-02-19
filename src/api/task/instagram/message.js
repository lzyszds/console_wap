import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/instagram/messageFriend",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/instagram/messageFriendUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/instagram/messageFriendDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/instagram/messageFriendList",
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
