<script setup lang="ts">
import { onMounted, ref } from "vue";
import recommends from "@/assets/json/recommends.json";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 修改：只存储一条提示词
const prompt = ref(["", ""]);

const changeRecommendation = () => {
  let length = recommends.cn.length;
  let index = Math.floor(Math.random() * length);
  prompt.value[0] = recommends.cn[index][0];
  prompt.value[1] = recommends.cn[index][1];
};

const emits = defineEmits(["selectRecommend"]);
const selectRecommend = (recommend: string) => {
  emits("selectRecommend", recommend);
};

onMounted(() => {
  // 修改：只初始化一条推荐
  let length = recommends.cn.length;
  let index = Math.floor(Math.random() * length);
  prompt.value[0] = recommends.cn[index][0];
  prompt.value[1] = recommends.cn[index][1];
});
</script>

<template>
  <div class="chat-window-welcome-select">
    <span class="title">{{ $t("recommend.title") }}</span>
    <span class="description">{{ $t("recommend.description") }}
      <span class="changeRecommendation" @click="changeRecommendation">{{ $t("recommend.click")
      }}<icon-refresh /></span>
    </span>
    <a-space direction="horizontal" fill>
      <a-card class="card" @click="selectRecommend(prompt[1])" :bordered="false" hoverable>
        <div class="icon-title-row">
          <icon-star-fill class="card-icon" />
          <span class="card-title">{{ prompt[0] }}</span>
        </div>
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

  .icon-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    /* 控制图标和标题之间的间距 */
  }

  .card-icon {
    flex-shrink: 0;
    /* 防止图标被压缩 */
  }

  .card-title {
    white-space: nowrap;
    /* 防止标题换行 */
    overflow: hidden;
    text-overflow: ellipsis;
    /* 如果标题太长，显示省略号 */
  }

  .changeRecommendation {
    color: #856cff;
  }

  .card {
    width: 60vw;
    border-radius: 20px;
    cursor: pointer;

    .card-icon {
      color: #856cff;
      font-size: 20px;
    }

    .card-title {
      color: #856cff;
      font-size: 20px;
      font-weight: 600;
      display: block;
    }

    .card-content {
      font-size: var(--font-size-lg);
      font-weight: 500;
      color: var(--color-neutral-7);
      display: block;
      text-align: justify;
      padding: 0 15px;
    }
  }

  .card:hover {
    transform: translateY(-4px);
    background-color: #856cff13;
  }
}
</style>