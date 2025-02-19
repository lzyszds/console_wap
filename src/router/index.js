import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from "@/layout/Layout.vue"
import i18n from '@/locales';
import { useStorage } from '@vueuse/core';
const t = i18n.global.t

const token = useStorage('token', '')

const routes = [
    {
        path: '/',
        redirect: '/device/deviceList',
    }, {
        path: "/device",
        name: t('navigation.dashboard.device.title'),
        namePath: 'navigation.dashboard.device.title',
        component: Layout,
        icon: "carbon:ibm-cloud-resiliency",
        meta: { title: t('navigation.dashboard.title'), requireAuth: true },
        children: [
            {
                path: "deviceList",
                name: 'navigation.dashboard.device.children.deviceList.title',
                namePath: t('navigation.dashboard.device.children.deviceList.title'),
                component: () => import('@/views/dashboard/device/DeviceList.vue')
            },
            {
                path: "group",
                name: 'navigation.dashboard.device.children.group.title',
                namePath: t('navigation.dashboard.device.children.group.title'),
                component: () => import('@/views/dashboard/device/Group.vue')
            },
            {
                path: "cloudPhone",
                name: 'navigation.dashboard.device.children.cloudPhone.title',
                namePath: t('navigation.dashboard.device.children.cloudPhone.title'),
                component: () => import('@/views/dashboard/device/CloudPhone.vue')
            },
        ]
    },
    {
        path: "/taskManagement",
        name: t('navigation.dashboard.taskManagement.title'),
        namePath: 'navigation.dashboard.taskManagement.title',
        component: Layout,
        icon: "carbon:user-activity",
        meta: { title: t('navigation.dashboard.taskManagement.title'), requireAuth: true },
        children: [
            {
                path: "taskList",
                name: 'navigation.dashboard.taskManagement.children.taskList.title',
                namePath: t('navigation.dashboard.taskManagement.children.taskList.title'),
                component: () => import('@/views/dashboard/taskManagement/TaskList.vue')
            },
            {
                path: "scheduledTask",
                name: 'navigation.dashboard.taskManagement.children.scheduledTask.title',
                namePath: t('navigation.dashboard.taskManagement.children.scheduledTask.title'),
                component: () => import('@/views/dashboard/taskManagement/ScheduledTask.vue'),
            }]
    },
    {
        path: "/taskParams",
        name: t('navigation.dashboard.taskParams.title'),
        namePath: 'navigation.dashboard.taskParams.title',
        component: Layout,
        icon: "akar-icons:desktop-device",
        meta: { title: t('navigation.dashboard.title'), requireAuth: true },
        children: [
            {
                path: "tiktok",
                name: t('navigation.dashboard.taskParams.tiktok.title'),
                children: [
                    {
                        path: "yanghao",
                        name: 'navigation.dashboard.taskParams.tiktok.children.yanghao.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.yanghao.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Yanghao.vue')
                    },
                    {
                        path: "update",
                        name: 'navigation.dashboard.taskParams.tiktok.children.update.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.update.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Updates.vue')
                    },
                    {
                        path: "getuid",
                        name: 'navigation.dashboard.taskParams.tiktok.children.getuid.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.getuid.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Getuid.vue')
                    },
                    {
                        path: "post",
                        name: 'navigation.dashboard.taskParams.tiktok.children.post.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.post.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Post.vue')
                    },
                    {
                        path: "follow",
                        name: 'navigation.dashboard.taskParams.tiktok.children.follow.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.follow.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Follow.vue')
                    },
                    {
                        path: "message",
                        name: 'navigation.dashboard.taskParams.tiktok.children.message.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.message.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Message.vue')
                    },
                    {
                        path: "like",
                        name: 'navigation.dashboard.taskParams.tiktok.children.like.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.like.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Like.vue')
                    },
                    {
                        path: "comment",
                        name: 'navigation.dashboard.taskParams.tiktok.children.comment.title',
                        namePath: t('navigation.dashboard.taskParams.tiktok.children.comment.title'),
                        component: () => import('@/views/dashboard/taskParams/tiktok/Comment.vue')
                    }
                ]
            },
            {
                path: "douyin",
                name: t('navigation.dashboard.taskParams.douyin.title'),
                children: [
                    {
                        path: "yanghao",
                        name: 'navigation.dashboard.taskParams.douyin.children.yanghao.title',
                        namePath: t('navigation.dashboard.taskParams.douyin.children.yanghao.title'),
                        component: () => import('@/views/dashboard/taskParams/douyin/Yanghao.vue')
                    },
                    {
                        path: "update",
                        name: 'navigation.dashboard.taskParams.douyin.children.update.title',
                        namePath: t('navigation.dashboard.taskParams.douyin.children.update.title'),
                        component: () => import('@/views/dashboard/taskParams/douyin/Updates.vue')
                    },
                    {
                        path: "getuid",
                        name: 'navigation.dashboard.taskParams.douyin.children.getuid.title',
                        namePath: t('navigation.dashboard.taskParams.douyin.children.getuid.title'),
                        component: () => import('@/views/dashboard/taskParams/douyin/Getuid.vue')
                    },
                    {
                        path: "post",
                        name: 'navigation.dashboard.taskParams.douyin.children.post.title',
                        namePath: t('navigation.dashboard.taskParams.douyin.children.post.title'),
                        component: () => import('@/views/dashboard/taskParams/douyin/Post.vue')
                    },
                    {
                        path: "follow",
                        name: 'navigation.dashboard.taskParams.douyin.children.follow.title',
                        namePath: t('navigation.dashboard.taskParams.douyin.children.follow.title'),
                        component: () => import('@/views/dashboard/taskParams/douyin/Follow.vue')
                    },
                    {
                        path: "message",
                        name: 'navigation.dashboard.taskParams.douyin.children.message.title',
                        namePath: t('navigation.dashboard.taskParams.douyin.children.message.title'),
                        component: () => import('@/views/dashboard/taskParams/douyin/Message.vue')
                    },
                    {
                        path: "comment",
                        name: 'navigation.dashboard.taskParams.douyin.children.comment.title',
                        namePath: t('navigation.dashboard.taskParams.douyin.children.comment.title'),
                        component: () => import('@/views/dashboard/taskParams/douyin/Comment.vue')
                    }

                ]
            },
            {
                path: "line",
                name: t('navigation.dashboard.taskParams.line.title'),
                children: [
                    {
                        path: "yanghao",
                        name: 'navigation.dashboard.taskParams.line.children.yanghao.title',
                        namePath: t('navigation.dashboard.taskParams.line.children.yanghao.title'),
                        component: () => import('@/views/dashboard/taskParams/line/Yanghao.vue')
                    },
                    {
                        path: "update",
                        name: 'navigation.dashboard.taskParams.line.children.update.title',
                        namePath: t('navigation.dashboard.taskParams.line.children.update.title'),
                        component: () => import('@/views/dashboard/taskParams/line/Updates.vue')
                    },
                    {
                        path: "addFriend",
                        name: 'navigation.dashboard.taskParams.line.children.addFriend.title',
                        namePath: t('navigation.dashboard.taskParams.line.children.addFriend.title'),
                        component: () => import('@/views/dashboard/taskParams/line/AddFriend.vue')
                    },
                    {
                        path: "post",
                        name: 'navigation.dashboard.taskParams.line.children.post.title',
                        namePath: t('navigation.dashboard.taskParams.line.children.post.title'),
                        component: () => import('@/views/dashboard/taskParams/line/Post.vue')
                    },
                    {
                        path: "stirFryGroups",
                        name: 'navigation.dashboard.taskParams.line.children.stirFryGroups.title',
                        namePath: t('navigation.dashboard.taskParams.line.children.stirFryGroups.title'),
                        component: () => import('@/views/dashboard/taskParams/line/StirFryGroups.vue')
                    }
                ]
            },
            {
                path: "whatsApp",
                name: t('navigation.dashboard.taskParams.whatsapp.title'),
                children: [
                    {
                        path: "yanghao",
                        name: 'navigation.dashboard.taskParams.whatsapp.children.yanghao.title',
                        namePath: t('navigation.dashboard.taskParams.whatsapp.children.yanghao.title'),
                        component: () => import('@/views/dashboard/taskParams/whatsapp/Yanghao.vue')
                    },
                    {
                        path: "update",
                        name: 'navigation.dashboard.taskParams.whatsapp.children.update.title',
                        namePath: t('navigation.dashboard.taskParams.whatsapp.children.update.title'),
                        component: () => import('@/views/dashboard/taskParams/whatsapp/Updates.vue')
                    },
                    {
                        path: "addFriend",
                        name: 'navigation.dashboard.taskParams.whatsapp.children.addFriend.title',
                        namePath: t('navigation.dashboard.taskParams.whatsapp.children.addFriend.title'),
                        component: () => import('@/views/dashboard/taskParams/whatsapp/AddFriend.vue')
                    },
                    {
                        path: "stirFryGroups",
                        name: 'navigation.dashboard.taskParams.whatsapp.children.stirFryGroups.title',
                        namePath: t('navigation.dashboard.taskParams.whatsapp.children.stirFryGroups.title'),
                        component: () => import('@/views/dashboard/taskParams/whatsapp/StirFryGroups.vue')
                    },
                    {
                        path: "message",
                        name: 'navigation.dashboard.taskParams.whatsapp.children.message.title',
                        namePath: t('navigation.dashboard.taskParams.whatsapp.children.message.title'),
                        component: () => import('@/views/dashboard/taskParams/whatsapp/Message.vue')
                    }
                ]
            }, {
                path: "snapchat",
                name: t('navigation.dashboard.taskParams.snapchat.title'),
                children: [
                    {
                        path: "yanghao",
                        name: 'navigation.dashboard.taskParams.snapchat.children.yanghao.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.yanghao.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/Yanghao.vue')
                    },
                    {
                        path: "updates",
                        name: 'navigation.dashboard.taskParams.snapchat.children.update.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.update.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/Updates.vue')
                    },
                    {
                        path: "likeLink",
                        name: 'navigation.dashboard.taskParams.snapchat.children.likeLink.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.likeLink.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/LikeLink.vue')
                    },
                    {
                        path: "post",
                        name: 'navigation.dashboard.taskParams.snapchat.children.post.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.post.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/Post.vue')
                    },
                    {
                        path: "addFriend",
                        name: 'navigation.dashboard.taskParams.snapchat.children.addFriend.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.addFriend.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/AddFriend.vue')
                    },
                    {
                        path: "message",
                        name: 'navigation.dashboard.taskParams.snapchat.children.message.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.message.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/Message.vue')
                    },
                    {
                        path: "comment",
                        name: 'navigation.dashboard.taskParams.snapchat.children.comment.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.comment.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/Comment.vue')
                    },
                    {
                        path: "getuid",
                        name: 'navigation.dashboard.taskParams.snapchat.children.getuid.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.getuid.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/Getuid.vue')
                    },
                    {
                        path: "logTask",
                        name: 'navigation.dashboard.taskParams.snapchat.children.logTask.title',
                        namePath: t('navigation.dashboard.taskParams.snapchat.children.logTask.title'),
                        component: () => import('@/views/dashboard/taskParams/snapchat/Log.vue')
                    }
                ]
            }, {
                path: "instagram",
                name: t('navigation.dashboard.taskParams.instagram.title'),
                children: [
                    {
                        path: "yanghao",
                        name: 'navigation.dashboard.taskParams.instagram.children.yanghao.title',
                        namePath: t('navigation.dashboard.taskParams.instagram.children.yanghao.title'),
                        component: () => import('@/views/dashboard/taskParams/instagram/Yanghao.vue')
                    },
                    {
                        path: "update",
                        name: 'navigation.dashboard.taskParams.instagram.children.update.title',
                        namePath: t('navigation.dashboard.taskParams.instagram.children.update.title'),
                        component: () => import('@/views/dashboard/taskParams/instagram/Updates.vue')
                    },
                    {
                        path: "post",
                        name: 'navigation.dashboard.taskParams.instagram.children.post.title',
                        namePath: t('navigation.dashboard.taskParams.instagram.children.post.title'),
                        component: () => import('@/views/dashboard/taskParams/instagram/Post.vue')
                    },
                    {
                        path: "message",
                        name: 'navigation.dashboard.taskParams.instagram.children.message.title',
                        namePath: t('navigation.dashboard.taskParams.instagram.children.message.title'),
                        component: () => import('@/views/dashboard/taskParams/instagram/Message.vue')
                    },
                    {
                        path: "follow",
                        name: 'navigation.dashboard.taskParams.instagram.children.follow.title',
                        namePath: t('navigation.dashboard.taskParams.instagram.children.follow.title'),
                        component: () => import('@/views/dashboard/taskParams/instagram/Follow.vue')
                    },
                    {
                        path: "getuid",
                        name: 'navigation.dashboard.taskParams.instagram.children.getuid.title',
                        namePath: t('navigation.dashboard.taskParams.instagram.children.getuid.title'),
                        component: () => import('@/views/dashboard/taskParams/instagram/Getuid.vue')
                    },
                    {
                        path: "logTask",
                        name: 'navigation.dashboard.taskParams.instagram.children.logTask.title',
                        namePath: t('navigation.dashboard.taskParams.instagram.children.logTask.title'),
                        component: () => import('@/views/dashboard/taskParams/instagram/Log.vue')
                    },
                ]
            }
        ]
    },

    /* 资源管理 */
    {
        path: "/resourceManagement",
        name: t('navigation.dashboard.resourceManagement.title'),
        namePath: 'navigation.dashboard.resourceManagement.title',
        component: Layout,
        icon: "carbon:folder-details",
        meta: { title: t('navigation.dashboard.resourceManagement.title'), requireAuth: true },
        children: [
            {
                path: "scripts",
                name: t('navigation.dashboard.resourceManagement.children.scripts.title'),
                namePath: t('navigation.dashboard.resourceManagement.children.scripts.title'),
                component: () => import('@/views/dashboard/resources/Scripts.vue')
            },
            {
                path: "images",
                name: 'navigation.dashboard.resourceManagement.children.images.title',
                namePath: t('navigation.dashboard.resourceManagement.children.images.title'),
                component: () => import('@/views/dashboard/resources/images.vue')
            },
            {
                path: "videos",
                name: 'navigation.dashboard.resourceManagement.children.videos.title',
                namePath: t('navigation.dashboard.resourceManagement.children.videos.title'),
                component: () => import('@/views/dashboard/resources/videos.vue')
            },
        ]

    },


    /* Ai剪辑 */
    {
        path: "/aiClip",
        name: t('navigation.dashboard.aiClip.title'),
        namePath: 'navigation.dashboard.aiClip.title',
        component: Layout,
        icon: "carbon:folder-details",
        meta: { title: t('navigation.dashboard.aiClip.title'), requireAuth: true },
        children: [
            {
                path: "credits",
                name: t('navigation.dashboard.aiClip.children.credits.title'),
                namePath: t('navigation.dashboard.aiClip.children.credits.title'),
                children: [
                    {
                        path: "creditsMain",
                        name: t('navigation.dashboard.aiClip.children.credits.main'),
                        namePath: t('navigation.dashboard.aiClip.children.credits.main'),
                        component: () => import('@/views/dashboard/clip/Credits.vue'),
                    },
                    {
                        path: "creditsList",
                        name: t('navigation.dashboard.aiClip.children.credits.list'),
                        namePath: t('navigation.dashboard.aiClip.children.credits.list'),
                        isHideMenu: true,
                        component: () => import('@/views/dashboard/clip/list/CreditsList.vue')
                    },
                ]
            },
            {
                path: "captions",
                name: t('navigation.dashboard.aiClip.children.captions.title'),
                namePath: t('navigation.dashboard.aiClip.children.captions.title'),
                component: () => import('@/views/dashboard/clip/Captions.vue')
            },
            {
                path: "musicalMat",
                name: t('navigation.dashboard.aiClip.children.musicalMat.title'),
                namePath: t('navigation.dashboard.aiClip.children.musicalMat.title'),
                children: [
                    {
                        path: "musicalMatMain",
                        name: t('navigation.dashboard.aiClip.children.musicalMat.main'),
                        namePath: t('navigation.dashboard.aiClip.children.musicalMat.main'),
                        component: () => import('@/views/dashboard/clip/MusicalMat.vue'),
                    },
                    {
                        path: "musicalMatList",
                        name: t('navigation.dashboard.aiClip.children.musicalMat.list'),
                        namePath: t('navigation.dashboard.aiClip.children.musicalMat.list'),
                        isHideMenu: true,
                        component: () => import('@/views/dashboard/clip/list/MusicalMatList.vue')
                    },
                ]
            },
            {
                path: "stickerMat",
                name: t('navigation.dashboard.aiClip.children.stickerMat.title'),
                namePath: t('navigation.dashboard.aiClip.children.stickerMat.title'),
                children: [
                    {
                        path: "stickerMatMain",
                        name: t('navigation.dashboard.aiClip.children.stickerMat.main'),
                        namePath: t('navigation.dashboard.aiClip.children.stickerMat.main'),
                        component: () => import('@/views/dashboard/clip/StickerMat.vue'),
                    },
                    {
                        path: "stickerMatList",
                        name: t('navigation.dashboard.aiClip.children.stickerMat.list'),
                        namePath: t('navigation.dashboard.aiClip.children.stickerMat.list'),
                        isHideMenu: true,
                        component: () => import('@/views/dashboard/clip/list/StickersMatList.vue')
                    },
                ]
            },
            {
                path: "preClip",
                name: t('navigation.dashboard.aiClip.children.preClip.title'),
                namePath: t('navigation.dashboard.aiClip.children.preClip.title'),
                children: [
                    {
                        path: "preClipMain",
                        name: t('navigation.dashboard.aiClip.children.preClip.main'),
                        namePath: t('navigation.dashboard.aiClip.children.preClip.main'),
                        component: () => import('@/views/dashboard/clip/PreClip.vue')
                    },
                    {
                        path: "preClipList",
                        name: t('navigation.dashboard.aiClip.children.preClip.list'),
                        namePath: t('navigation.dashboard.aiClip.children.preClip.list'),
                        isHideMenu: true,
                        component: () => import('@/views/dashboard/clip/list/PreClipList.vue')
                    },
                ]
            },
            {
                path: "mixedShearWarehouse",
                name: t('navigation.dashboard.aiClip.children.mixedShearWarehouse.title'),
                namePath: t('navigation.dashboard.aiClip.children.mixedShearWarehouse.title'),
                children: [
                    {
                        path: "mixedShearWarehouseMain",
                        name: t('navigation.dashboard.aiClip.children.mixedShearWarehouse.main'),
                        namePath: t('navigation.dashboard.aiClip.children.mixedShearWarehouse.main'),
                        component: () => import('@/views/dashboard/clip/MixedShearWarehouse.vue')
                    },
                    {
                        path: "mixedShearWarehouseList",
                        name: t('navigation.dashboard.aiClip.children.mixedShearWarehouse.list'),
                        namePath: t('navigation.dashboard.aiClip.children.mixedShearWarehouse.list'),
                        isHideMenu: true,
                        component: () => import('@/views/dashboard/clip/list/MixedShearWarehouseList.vue')
                    },
                ]
            },
        ]

    },
    {
        path: "/notice",
        name: t('navigation.notice.title'),
        namePath: 'navigation.notice.title',
        component: Layout,
        icon: "gridicons:notice-outline",
        isHideMenu: true,
        meta: { title: t('navigation.notice.title'), requireAuth: true },
        children: [{
            path: "notice",
            name: t('navigation.notice.title') + 1,
            namePath: 'navigation.notice.title',
            icon: "gridicons:notice-outline",
            meta: { title: t('navigation.notice.title'), requireAuth: true },
            component: () =>
                import("@/views/notice/index.vue")
        }]
    },
    {
        path: "/course",
        name: t('navigation.course.title'),
        namePath: 'navigation.course.title',
        component: Layout,
        icon: "gg:layout-pin",
        isHideMenu: true,
        meta: { title: t('navigation.course.title'), requireAuth: true },
        children: [{
            path: "course",
            name: t('navigation.course.title') + 1,
            namePath: 'navigation.course.title',
            icon: "gg:layout-pin",
            meta: { title: t('navigation.course.title'), requireAuth: true },
            component: () =>
                import("@/views/course/index.vue")
        }]
    },
    {
        path: '/login',
        name: 'login',
        isHideMenu: true,
        meta: { title: t('navigation.login.title') },
        component: () =>
            import('@/views/login/login.vue'),
    },
    /* 404 */
    {
        path: "/:catchAll(.*)",
        name: 'undefind404',
        component: () => import('@/views/undefind/Undefined.vue') // 注意，没有重定向就会出现两个一模一样的home页面
    },

]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})



// 设置title
router.beforeEach((to, from, next) => {
    // NProgress.inc(0.2)
    // NProgress.configure({ easing: 'ease', speed: 600, showSpinner: false, parent: '#app' })
    // // 启动进度条
    // NProgress.start();


    // 判断用户是否登录
    let hasToken = false;


    if (token.value) {
        hasToken = true;
    } else {
        hasToken = false;
    }

    if (hasToken) {

        //console.log('yes login')
        if (to.path === '/login') {
            next('/');
        } else {
            next();
        }

    } else {

        /* has no token*/
        if (to.path === '/login') {
            next()
        } else {
            next('/login')
        }

    }
})

router.afterEach(() => {
    // 关闭进度条
    // NProgress.done()
})

export default router
