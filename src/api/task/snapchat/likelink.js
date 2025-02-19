import request from "@/utils/request";


export function addData(params) {
    return request({
        url: "/api/snapchat/likeComment",
        method: "post",
        data: params,
    });
}

export function editData(params) {
    return request({
        url: "/api/snapchat/likeCommentUp",
        method: "post",
        data: params,
    });
}

export function deleteData(params) {
    return request({
        url: "/api/snapchat/likeCommentDel",
        method: "post",
        data: params,
    });
}

export function getDataList(params) {
    return request({
        url: "/api/snapchat/likeCommentList",
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
