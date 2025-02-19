import { createRouter, createWebHashHistory } from "vue-router";
// 框架
import Index from "~/layouts/Index.vue";
//
import HomeView from "~/views/HomeView.vue";

const router = createRouter({
  // hash 模式
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Index,
      children: [
        {
          path: "",
          component: HomeView
        },
        {
          // 匹配id
          path: ":id",
          // 动态载入
          component: () => import("~/views/MouldView.vue")
        }
      ]
    }
  ]
});
router.beforeEach((to, from, next) => {
  next();
});
export default router;
