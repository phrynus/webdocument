<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import qs from "qs";
import Icon from "@/components/Icon.vue";
import { userestStore } from "@/stores/rest";
import api from "@/utils/axios";
import { ElMessage, ElLoading, ElNotification } from "element-plus";
import "wc-waterfall";

const store: any = userestStore();
const moulds: any = ref({});
const waterCol = ref(4);
const tags: any = ref({});
const scrollbar = ref();
const loadingBox = ref(false);
const pagination = ref(1);
const screenBox: any = ref(false);

const prices = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, "100+"];
const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"];

const screen = () => {
  console.log(screenBox.value.scrollHeight, screenBox);
  if (screenBox.value.clientHeight > 50) {
    screenBox.value.style.height = "30px";
  } else {
    screenBox.value.style.height = screenBox.value.scrollHeight + "px";
  }
};

const getQuery = () => {
  let filters: any = {};
  if (store.search) {
    filters = {
      $or: [
        {
          title: {
            $contains: store.search
          }
        },
        {
          describe: {
            $contains: store.search
          }
        },
        {
          tag: {
            $contains: store.search
          }
        },
        {
          layout: {
            $contains: store.search
          }
        },
        {
          key: {
            $endsWithi: store.search
          }
        },
        {
          pages: {
            $eqi: store.search
          }
        },
        {
          price: {
            $eqi: store.search
          }
        }
      ]
    };
  } else {
    filters = {
      $and: [
        {
          explore: {
            $contains: store.explore
          }
        },
        {
          tag: {
            $contains: store.tag
          }
        }
      ]
    };
    if (store.price) {
      if (store.price == "100+") {
        filters["$and"].push({ price: { $gte: 100 } });
      } else {
        filters["$and"].push({ price: { $eqi: store.price } });
      }
    }
    if (store.pages) {
      if (store.pages == "10+") {
        filters["$and"].push({ pages: { $gte: 10 } });
      } else {
        filters.$and.push({ pages: { $eqi: store.pages } });
      }
    }
  }
  let query = qs.stringify(
    {
      filters,
      populate: "icon",
      sort: "sort:desc",
      pagination: {
        page: pagination.value,
        pageSize: 24
      }
    },
    {
      encodeValuesOnly: true // prettify URL
    }
  );
  console.log(query);
  return query;
};

const isApiGo = ref(false);
const apiGo = async () => {
  if (isApiGo.value) return;
  isApiGo.value = true;
  scrollbar.value!.setScrollTop(0);
  let loading = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(255, 255, 255, 0.5)"
  });

  try {
    api.get(`https://api.mods.fonm.cn/api/tag/${store.explore}`).then((res: any) => {
      tags.value = res.data;
    });
    await api.get(`https://api.mods.fonm.cn/api/moulds?${getQuery()}`).then((res: any) => {
      moulds.value = res.data;
    });
    pagination.value++;
    loading.close();
    if (moulds.value.data.length === 0) {
      ElNotification.error({
        title: "内容为空",
        message: "点击发布任务，联系开发者制作吧",
        duration: 3000,
        position: document.body.clientWidth < 1024 ? "bottom-right" : "top-right",
        offset: document.body.clientWidth < 1024 ? 70 : 0
      });
      return;
    }
    isApiGo.value = false;
    ElMessage.success({
      message: "加载成功",
      duration: 800
    });
  } catch (error: any) {
    console.log(error);
    ElMessage.error({
      message: error.toString(),
      duration: 0
    });
  }
};
const setTag = (tag: any) => {
  store.tag = tag;
  store.search = "";
};
const setPages = (tag: any) => {
  store.pages = tag;
  store.search = "";
};
const setPrice = (tag: any) => {
  store.price = tag;
  store.search = "";
};

const scroll = async (e: any) => {
  if (scrollbar.value.wrapRef.scrollHeight - scrollbar.value.wrapRef.clientHeight - e.scrollTop < 600) {
    if (isApiGo.value || moulds.value.data.length < 24) return;
    loadingBox.value = true;
    isApiGo.value = true;
    api
      .get(`https://api.mods.fonm.cn/api/moulds?${getQuery()}`)
      .then((res: any) => {
        loadingBox.value = false;
        if (res.data.data.length === 0) {
          ElNotification.error({
            title: "到底了",
            message: "点击发布任务，联系开发者制作吧",
            duration: 3000,
            position: document.body.clientWidth < 1024 ? "bottom-right" : "top-right",
            offset: document.body.clientWidth < 1024 ? 70 : 0
          });
          return;
        }
        moulds.value["data"] = [...moulds.value.data, ...res.data.data];
        moulds.value["meta"] = res.data.meta;
        pagination.value++;
        isApiGo.value = false;
      })
      .catch((err: any) => {
        loadingBox.value = false;
        console.log(err);
        ElMessage.error({
          message: err.toString(),
          duration: 3000
        });
      });
  }
};

onMounted(async () => {
  screenBox.value.style.height = "30px";
  await apiGo();
  watch(store, async (newVal, oldVal) => {
    isApiGo.value = false;
    pagination.value = 1;
    screenBox.value.style.height = "30px";
    await apiGo();
    console.log("完成");
  });

  const resize = () => {
    const width = document.body.clientWidth;
    if (width < 1024) {
      waterCol.value = 2;
    } else {
      waterCol.value = 4;
    }
  };
  resize();
  window.addEventListener("resize", resize);
});
</script>
<template>
  <el-scrollbar v-loading="loadingBox" class="home" @scroll="scroll" ref="scrollbar">
    <div class="screenBox" ref="screenBox">
      <div class="screenBtn" @click="screen()">
        <Icon name="iconedit-filling" />
        <span>筛选</span>
      </div>
      <div class="tagsBox">
        <div :class="{ on: store.tag === '' }" @click="setTag('')">分类</div>
        <div v-for="tag in tags" :key="tag.id" :class="{ on: tag.name == store.tag }" @click="setTag(tag.name)">
          <span>{{ tag.name }}</span>
        </div>
      </div>
      <div class="tagsBox">
        <div :class="{ on: store.price === '' }" @click="setPrice('')">价格</div>
        <div v-for="item in prices" :key="item" :class="{ on: item == store.price }" @click="setPrice(item)">
          <span>{{ item }}</span>
        </div>
      </div>
      <div class="tagsBox">
        <div :class="{ on: store.pages === '' }" @click="setPages('')">页数</div>
        <div v-for="item in pages" :key="item" :class="{ on: item == store.pages }" @click="setPages(item)">
          <span>{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- wc-waterfall -->
    <wc-waterfall :gap="16" :cols="waterCol">
      <div class="moulds" v-for="item in moulds.data" :key="item.id">
        <a :href="`/#/${item.id}`">
          <div class="img">
            <img :src="item.attributes.icon.data?.attributes.url" />
          </div>
          <div class="mold-footer">
            <div class="title" v-text="item.attributes.title"></div>
            <div class="info">
              {{ item.attributes.pages + "个页面、" + item.attributes.layout + "。" + item.attributes.describe }}
            </div>
            <div class="tags">
              <div class="tag">
                <a v-for="tag in item.attributes.tag" class="tag-link" :class="{ on: tag.name == store.tag }">
                  {{ tag.name }}
                </a>
              </div>
              <div class="price">${{ item.attributes.price }}</div>
            </div>
          </div>
        </a>
      </div>
    </wc-waterfall>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.el-scrollbar {
  width: 100%;
}
.screenBox {
  position: relative;
  padding-right: 92px;
  overflow: hidden;
  margin-bottom: 12px;
  transition: 0.3s;

  @media screen and (max-width: 959px) {
    padding-right: 42px;
    .screenBtn {
      padding: 0 8px !important;
      span {
        display: none;
      }
      svg {
        margin-right: 0 !important;
      }
    }
    .tagsBox {
      > div {
        padding: 0 12px !important;
        border-radius: 10px !important;
      }
    }
  }
  .tagsBox {
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    &:last-child {
      margin-bottom: 0;
    }
    > div {
      padding: 0 20px;
      margin-bottom: 6px;
      width: max-content;
      height: 30px;
      border-radius: 16px;
      cursor: pointer;
      line-height: 30px;
      font-size: 15px;
      &:hover,
      &.on {
        background-color: #00000008;
        font-weight: bold;
      }
    }
  }
  .screenBtn {
    padding: 0 20px;
    width: max-content;
    height: 30px;
    border-radius: 16px;
    cursor: pointer;
    line-height: 30px;
    font-size: 15px;
    background-color: var(--el-color-success);
    font-weight: bold;
    color: #fff;
    position: absolute;
    right: 0;
    svg {
      margin-right: 4px;
      font-size: 18px;
      line-height: 30px;
      color: #fff;
    }
  }
}

wc-waterfall {
  @media screen and (max-width: 959px) {
    padding-bottom: 76px;
  }
  .moulds {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #ebebeb;
    background-color: #fff;
    .img {
      max-height: 400px;
      // min-height: 100px;
      overflow: hidden;
      @media screen and (max-width: 959px) {
        max-height: 200px;
      }
      img {
        width: 100%;
        position: relative;
      }
    }
    .mold-footer {
      padding: 8px;
      .title {
        margin-bottom: 4px;
        margin-top: 4px;
        font-weight: bold;
        font-size: 15px;
        letter-spacing: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      .info {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        margin-bottom: 8px;
        font-size: 12px;
        color: #777;
      }
      .tags {
        border-top: 1px solid #ebebeb;
        padding-top: 8px;
        display: flex;
        justify-content: space-between;
        .tag {
          display: flex;
          flex-wrap: wrap;
          height: 24px;
          overflow: hidden;

          a {
            display: block;
            margin-right: 4px;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 6px;
            background-color: var(--el-color-success);
            color: #fff;
            margin-bottom: 4px;
            &.on {
              background-color: var(--el-color-danger);
            }
          }
        }
        .price {
          color: var(--el-color-danger);
          font-weight: bold;
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
