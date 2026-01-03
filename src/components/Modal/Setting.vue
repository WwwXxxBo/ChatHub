<script setup lang="ts">
import { watch, ref, reactive } from "vue";
// 引入 System 状态
import { useSystemStore } from "@/stores/system";
// 引入 Setting 状态
import { useSettingStore } from "@/stores/setting";
import { Message } from "@arco-design/web-vue";
// 引入国际化组件
import { useI18n } from "vue-i18n";
// 引入打开网址工具
import { openInBrowser } from "@/utils/window-util";
// 引入主题表
import { defaultCustomThemeMap, setCustomFontSize, setCustomTheme } from "@/utils/theme-util";
import { copyObj } from "@/utils/object-util";
import { modifyCommonSetting } from "@/api/setting"
import type { FormInstance } from '@arco-design/web-vue';

const { t } = useI18n();
const activeKey = ref('user');
const systemStore = useSystemStore();
const settingStore = useSettingStore();


// 注册表单实例
const registerFormRef = ref<FormInstance>();
// 注册表单数据
const registerForm = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  validatePassword: "",
});
// 字体大小修改实时生效
watch(
  () => settingStore.app.fontSize,
  (value) => {
    setCustomFontSize(value)
  }
)

const saveCommonSetting = async () => {
  const res = await modifyCommonSetting(
    sessionStorage.userId,
    settingStore.openAI.key,
    settingStore.zhipuAI.apiKey,
    settingStore.ernie.apiKey,
    settingStore.ernie.secretKey,
    settingStore.spark.appId,
    settingStore.spark.secret,
    settingStore.spark.key,
    settingStore.tongyi.apiKey,
    settingStore.moonshotAI.apiKey,
    settingStore.tiangong.appKey,
    settingStore.tiangong.appSecret,
    settingStore.stepFun.apiKey,
    settingStore.deepSeek.apiKey,
    settingStore.baichuan.apiKey
  )
  if (res.status === 0) {
    Message.success("通用设置保存成功");
  } else {
    Message.error("通用设置保存失败");
  }
}

// 自定义样式实时生效
watch(
  () => settingStore.app.customThemeMap,
  () => {
    if (settingStore.app.themeModel === 3) {
      setCustomTheme(settingStore.app.customThemeMap)
    }
  },
  {
    deep: true
  }
)

// 注册表单验证规则
const registerRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
    { minLength: 2, message: '用户名至少2个字符', trigger: ['blur', 'change'] },
    { maxLength: 20, message: '用户名最多20个字符', trigger: ['blur', 'change'] },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: ['blur', 'change'] },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'change']
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: ['blur', 'change'] },
    {
      match: /^1[3-9]\d{9}$/,
      message: '请输入有效的11位手机号',
      trigger: ['blur', 'change']
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
    { minLength: 6, message: '密码长度至少为6位', trigger: ['blur', 'change'] },
    { maxLength: 20, message: '密码长度最多为20位', trigger: ['blur', 'change'] },
  ],
  validatePassword: [
    { required: true, message: '请再次输入密码', trigger: ['blur', 'change'] },
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (value !== registerForm.password) {
          callback('两次输入的密码不一致');
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change']
    },
  ],
};

const toRegister = async () => { }

</script>

<template>
  <div class="setting">
    <div @click="systemStore.openSettingModal()">
      <slot name="default"></slot>
    </div>

    <!-- 设置模态框 -->
    <a-modal v-model:visible="systemStore.settingModal.visible" :footer="false" unmount-on-close title-align="start"
      width="45vw">
      <!-- 标题 -->
      <template #title><span style="color: #856cff; font-weight: 600;">{{ $t("setting.name") }} </span></template>
      <!-- 页面主内容 -->
      <div class="setting-page">
        <!-- 切换TAB -->
        <div class="radio-group-wrapper">
          <a-radio-group v-model="activeKey" type="button">
            <a-radio value="user" style="color: #856cff; font-weight: 600;">{{ $t("setting.user") }}</a-radio>
            <a-radio value="app" style="color: #856cff; font-weight: 600;">{{ $t("setting.app.name") }}</a-radio>
            <a-radio value="bigModel" style="color: #856cff; font-weight: 600;">{{ $t("setting.bigModel.name")
            }}</a-radio>
            <a-radio value="about" style="color: #856cff; font-weight: 600;">{{ $t("setting.about.name")
            }}</a-radio>
          </a-radio-group>
        </div>
        <a-tabs :active-key="activeKey" class="custom-tabs">
          <a-tab-pane key="user">
            <a-space direction="vertical" :size="25" fill class="setting-tab-content">
              <div class="form-content">
                <a-form ref="registerFormRef" :model="registerForm" :rules="registerRules" layout="vertical"
                  auto-label-width @submit="toRegister" style="width: 400px;">
                  <!-- 用户名 -->
                  <a-form-item field="name" label="用户名" hide-label>
                    <a-input placeholder="请输入新的用户名" v-model="registerForm.name" allow-clear>
                      <template #prefix>
                        <icon-user />
                      </template>
                    </a-input>
                  </a-form-item>
                  <!-- 手机号 -->
                  <a-form-item field="phone" label="手机号" hide-label>
                    <a-input placeholder="请输入新的手机号" v-model="registerForm.phone" allow-clear>
                      <template #prefix>
                        <icon-phone />
                      </template>
                    </a-input>
                  </a-form-item>
                  <!-- 邮箱 -->
                  <a-form-item field="email" label="邮箱" hide-label>
                    <a-input placeholder="请输入新的邮箱" v-model="registerForm.email" allow-clear>
                      <template #prefix>
                        <icon-email />
                      </template>
                    </a-input>
                  </a-form-item>
                  <!-- 密码 -->
                  <a-form-item field="password" label="密码" hide-label>
                    <a-input-password placeholder="请输入新的密码（至少6位）" v-model="registerForm.password" allow-clear>
                      <template #prefix>
                        <icon-lock />
                      </template>
                    </a-input-password>
                  </a-form-item>
                  <!-- 确认密码 -->
                  <a-form-item field="validatePassword" label="确认密码" hide-label>
                    <a-input-password placeholder="请再次输入新的密码" v-model="registerForm.validatePassword" allow-clear>
                      <template #prefix>
                        <icon-lock />
                      </template>
                    </a-input-password>
                  </a-form-item>
                  <a-form-item>
                    <a-button html-type="submit" type="primary" long
                      style="background-color: #856cff; font-weight: 600;">
                      提交修改
                    </a-button>
                  </a-form-item>
                </a-form>
              </div>
            </a-space>
          </a-tab-pane>
          <a-tab-pane key="app">
            <a-space direction="vertical" :size="25" fill class="setting-tab-content">
              <!-- 设置主题 -->
              <a-space direction="vertical" :size="10">
                <div>{{ $t("setting.app.appearance.theme.name") }}</div>
                <a-radio-group v-model="settingStore.app.themeModel" type="button" size="small">
                  <a-radio :value="0" style="color: #856cff; font-weight: 600;">
                    <IconSync />
                    {{ $t("setting.app.appearance.theme.auto") }}
                  </a-radio>
                  <a-radio :value="1" style="color: #856cff; font-weight: 600;">
                    <IconSun />
                    {{ $t("setting.app.appearance.theme.light") }}
                  </a-radio>
                  <a-radio :value="2" style="color: #856cff; font-weight: 600;">
                    <IconMoonFill />
                    {{ $t("setting.app.appearance.theme.dark") }}
                  </a-radio>
                  <a-radio :value="3" style="color: #856cff; font-weight: 600;">
                    <IconPalette />
                    {{ $t("setting.app.appearance.theme.custom") }}
                  </a-radio>
                </a-radio-group>
              </a-space>
              <!-- 色彩选择 -->
              <a-space v-if="settingStore.app.themeModel === 3" direction="vertical" :size="10">
                <div>
                  {{ $t("setting.app.appearance.theme.customEdit") }}
                </div>
                <div class="custom-theme-list">
                  <div v-for="tk in Object.keys(defaultCustomThemeMap)" :key="tk" class="custom-theme-list-item">
                    <div class="custom-theme-list-item-label">{{ tk }}</div>
                    <a-color-picker v-model="settingStore.app.customThemeMap[tk]" size="small"
                      class="custom-theme-list-item-color-picker" />
                  </div>
                </div>
              </a-space>
              <!-- 设置字体 -->
              <a-space direction="vertical" :size="10" fill>
                <div>{{ $t("setting.app.appearance.fontSize") }}</div>
                <a-space :size="10">
                  <div>{{ $t("setting.app.appearance.min") }}</div>
                  <a-slider v-model="settingStore.app.fontSize" :min="1" :max="5" show-ticks style="width: 300px;"
                    class="purple-slider" />
                  <div>{{ $t('setting.app.appearance.max') }}</div>
                </a-space>
              </a-space>
              <!-- 设置语言 -->
              <a-space direction="vertical" :size="10" fill>
                <div>{{ $t('setting.app.appearance.local') }}</div>
                <a-select v-model="settingStore.app.locale" size="small" :fallback-option="false">
                  <a-option value="zh_CN">中文</a-option>
                  <a-option value="en_US">English</a-option>
                </a-select>
              </a-space>
              <div style="display: flex; justify-content: flex-end;">
                <a-button type="primary" @click="saveCommonSetting()"
                  style="background-color: #856cff; font-weight: 600; width: 100%;">{{
                    $t('setting.app.button')
                  }}</a-button>
              </div>
            </a-space>
          </a-tab-pane>
          <!-- API Key 管理 -->
          <a-tab-pane key="bigModel">
            <a-tabs position="left">
              <!-- 深度求索 -->
              <a-tab-pane key="deepSeek" :title="$t('setting.bigModel.deepSeek.name')">
                <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                  <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link style="color:#856cff"
                        @click="openInBrowser('https://platform.deepseek.com')">https://platform.deepseek.com</a-link>
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.deepSeek.apiKey") }}</div>
                      <a-input-password v-model="settingStore.deepSeek.apiKey" size="small" :placeholder="$t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.deepSeek.apiKey')
                        " />
                    </a-space>
                  </a-space>
                  <a-button type="primary" @click="saveCommonSetting()"
                    style="background-color: #856cff; font-weight: 600; width: 100%;">保存修改</a-button>
                </a-space>
              </a-tab-pane>
              <!-- 通义千问 -->
              <a-tab-pane key="tongyi" :title="$t('setting.bigModel.tongyi.name')">
                <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                  <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link @click="openInBrowser('https://tongyi.aliyun.com')">https://tongyi.aliyun.com</a-link>
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.tongyi.apiKey") }}</div>
                      <a-input-password v-model="settingStore.tongyi.apiKey" size="small" :placeholder="$t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.tongyi.apiKey')
                        " />
                    </a-space>
                  </a-space>
                  <a-button type="primary" @click="saveCommonSetting()"
                    style="background-color: #856cff; font-weight: 600; width: 100%;">保存修改</a-button>
                </a-space>
              </a-tab-pane>
              <!-- 月之暗面 -->
              <a-tab-pane key="moonshotAI" :title="$t('setting.bigModel.moonshotAI.name')">
                <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                  <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link @click="openInBrowser('https://www.moonshot.cn')">https://www.moonshot.cn</a-link>
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.moonshotAI.apiKey") }}</div>
                      <a-input-password v-model="settingStore.moonshotAI.apiKey" size="small" :placeholder="$t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.moonshotAI.apiKey')
                        " />
                    </a-space>
                  </a-space>
                  <a-button type="primary" @click="saveCommonSetting()"
                    style="background-color: #856cff; font-weight: 600; width: 100%;">保存修改</a-button>
                </a-space>
              </a-tab-pane>
              <!-- 豆包 -->
              <a-tab-pane key="doubao" :title="$t('setting.bigModel.doubao.name')">
                <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                  <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link @click="openInBrowser('https://www.moonshot.cn')">https://www.moonshot.cn</a-link>
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.doubao.apiKey") }}</div>
                      <a-input-password v-model="settingStore.doubao.apiKey" size="small" :placeholder="$t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.doubao.apiKey')
                        " />
                    </a-space>
                  </a-space>
                  <a-button type="primary" @click="saveCommonSetting()"
                    style="background-color: #856cff; font-weight: 600; width: 100%;">保存修改</a-button>
                </a-space>
              </a-tab-pane>
              <!-- 智谱清言 -->
              <a-tab-pane key="zhipuAI" :title="$t('setting.bigModel.zhipuAI.name')">
                <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                  <a-space direction="vertical" :size="25" fill class="setting-tab-content">
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link @click="openInBrowser('https://open.bigmodel.cn')">https://open.bigmodel.cn</a-link>
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.zhipuAI.apiKey") }}</div>
                      <a-input-password v-model="settingStore.zhipuAI.apiKey" size="small" :placeholder="$t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.zhipuAI.apiKey')
                        " />
                    </a-space>
                  </a-space>
                  <a-button type="primary" @click="saveCommonSetting()"
                    style="background-color: #856cff; font-weight: 600; width: 100%;">保存修改</a-button>
                </a-space>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>

          <!-- 关于 -->
          <a-tab-pane key="about">
            <a-space direction="vertical" :size="25" fill class="setting-tab-content">
              <!-- 系统版本 -->
              <a-space direction="vertical" :size="10">
                <div>{{ $t("setting.about.version.name") }}</div>
                <a-tag>{{ $t("setting.about.version.num") }}</a-tag>
              </a-space>
              <!-- 系统开发者 -->
              <a-space direction="vertical" :size="10">
                <div>{{ $t("setting.about.developer.name") }}</div>
                <a-tag>{{ $t("setting.about.developer.team") }}</a-tag>
              </a-space>
            </a-space>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.setting-page {
  height: 56vh;
  overflow-y: auto;
  font-size: var(--font-size-default);

  .radio-group-wrapper {
    display: flex;
    justify-content: center;
  }

  .form-content {
    display: flex;
    justify-content: center;
  }

  .arco-tabs-tab-active,
  .arco-tabs-tab-active:hover {
    color: #856cff !important;
    font-weight: 500;
  }

  /* 清除所有 Tabs 的分割线 */
  :deep(.arco-tabs-nav::before) {
    display: none !important;
    height: 0px;
  }

  /* 清除垂直 Tabs 的分割线 */
  :deep(.arco-tabs-nav-vertical::before) {
    display: none !important;
    height: 0px;
  }

  /* 如果还需要清除 tab 之间的分割线 */
  :deep(.arco-tabs-nav-tab) {
    border-bottom: none !important;
    height: 0px;
  }

  .custom-theme-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    background-color: var(--color-fill-1);
    box-sizing: border-box;
    padding: 10px;

    .custom-theme-list-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;

      .custom-theme-list-item-label,
      .custom-theme-list-item-color-picker {
        flex-shrink: 0;
      }
    }
  }

  /* 修改 slider 的轨道和滑块颜色为紫色 */
  .purple-slider :deep(.arco-slider-bar) {
    background-color: #856cff !important;
  }

  .purple-slider :deep(.arco-slider-button) {
    border-color: #856cff !important;
    background-color: #856cff !important;
  }

  .purple-slider :deep(.arco-slider-dot-active) {
    border-color: #856cff !important;
  }

  /* 如果需要修改 tooltip 颜色 */
  .purple-slider :deep(.arco-tooltip-content) {
    background-color: #856cff !important;
  }

  .purple-slider :deep(.arco-tooltip-arrow) {
    background-color: #856cff !important;
  }

}
</style>
