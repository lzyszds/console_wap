import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/snapchat/addFriend",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/snapchat/addFriendUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/snapchat/addFriendDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/snapchat/addFriendList",
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
