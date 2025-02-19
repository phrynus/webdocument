import "./assets/main.scss";
import "//at.alicdn.com/t/c/font_4547657_y0e8jo791wh.js";

import { createApp } from "vue";
import { createPinia } from "pinia";
import Icon from "@/components/Icon.vue";
// element css
import "element-plus/dist/index.css";

import App from "~/App.vue";
import router from "~/router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component("Icon", Icon);

app.mount("#app");
