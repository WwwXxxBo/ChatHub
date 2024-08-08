<script setup lang="ts">
// 接收父组件传递的数据
defineProps({
  type: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 30,
  },
});
</script>

<template>
  <!-- 文本文档 -->
  <img
    v-if="type === 'txt'"
    :height="size"
    alt="avatar"
    src="@/assets/images/file-txt.png"
  />
  <!-- PDF 文档 -->
  <img
    v-else-if="type === 'pdf'"
    :height="size"
    alt="avatar"
    src="@/assets/images/file-pdf.png"
  />
  <!-- DOCX 文档 -->
  <img
    v-else-if="type === 'docx'"
    :height="size"
    alt="avatar"
    src="@/assets/images/file-docx.png"
  />
  <!-- XLSX 文档 -->
  <img
    v-else-if="type === 'xlsx'"
    :height="size"
    alt="avatar"
    src="@/assets/images/file-xlsx.png"
  />
  <!-- PPT -->
  <img
    v-else-if="type === 'pptx'"
    :height="size"
    alt="avatar"
    src="@/assets/images/file-pptx.png"
  />
  <!-- 其它文件 -->
  <img
    v-else
    alt="avatar"
    :height="size"
    src="@/assets/images/file-other.png"
  />
</template>

<style lang="less" scoped></style>
