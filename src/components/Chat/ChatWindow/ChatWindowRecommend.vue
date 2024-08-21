<script setup lang="ts">
import { onMounted, ref } from "vue";
import recommends from "@/assets/json/recommends.json";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 初始值为 Prompt 列表的前 4 项
const promptList = ref([
  ["", ""],
  ["", ""],
  ["", ""],
  ["", ""],
]);

const changeRecommendation = () => {
  let length = recommends.cn.length;
  for (const p of promptList.value) {
    let index = Math.floor(Math.random() * length);
    p[0] = recommends.cn[index][0];
    p[1] = recommends.cn[index][1];
  }
};

const emits = defineEmits(["selectRecommend"]);
const selectRecommend = (recommend: string) => {
  emits("selectRecommend", recommend);
};

onMounted(() => {
  // 初始化推荐列表
  let length = recommends.cn.length;
  for (const p of promptList.value) {
    let index = Math.floor(Math.random() * length);
    p[0] = recommends.cn[index][0];
    p[1] = recommends.cn[index][1];
  }
});
</script>

<template>
  <div class="chat-window-welcome-select">
    <span class="title">{{ $t("recommend.title") }}</span>
    <span class="description"
      >{{ $t("recommend.description") }}
      <span class="changeRecommendation" @click="changeRecommendation"
        >{{ $t("recommend.click") }}<icon-refresh
      /></span>
    </span>
    <a-space direction="horizontal" fill>
      <a-card
        v-for="(prompt, index) in promptList"
        :key="prompt.id"
        class="card"
        @click="selectRecommend(prompt[1])"
        :bordered="false"
        hoverable
      >
        <icon-star-fill class="card-icon" />
        <br />
        <span class="card-title">{{ prompt[0] }}</span>
        <a-divider orientation="left"></a-divider>
        <span class="card-content">{{ prompt[1] }}</span>
      </a-card>
    </a-space>
  </div>
</template>

<style scoped lang="less">
.chat-window-welcome-select {
  height: 100%;
  border-radius: var(--border-radius-small);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  .title {
    font-size: var(--font-size-xxxl);
    font-weight: 900;
  }
  .description {
    font-size: var(--font-size-lg);
    font-weight: 500;
  }
  .changeRecommendation {
    color: rgb(var(--arcoblue-6));
  }
  .card {
    width: 180px;
    height: 230px;
    border-radius: 20px;
    .card-icon {
      color: rgb(var(--arcoblue-6));
      font-size: 100;
      margin-bottom: 10px;
    }
    .card-title {
      color: rgb(var(--arcoblue-6));
      font-size: var(--font-size-xl);
      font-weight: 600;
      margin-bottom: 25px;
    }
    .card-content {
      font-size: var(--font-size-lg);
      font-weight: 500;
    }
  }
  .card:hover {
    transform: translateY(-4px);
    background-color: rgb(var(--arcoblue-1));
  }
}
</style>
