<script setup lang="ts">
import { watch } from "vue";
// 引入 System 状态
import { useSystemStore } from "@/stores/system";
// 引入 Setting 状态
import { useSettingStore } from "@/stores/setting";
// 引入国际化组件
import { useI18n } from "vue-i18n";
// 引入打开网址工具
import { openInBrowser } from "@/utils/window-util";
// 引入主题表
import { defaultCustomThemeMap, setCustomFontSize, setCustomTheme } from "@/utils/theme-util";
import { copyObj } from "@/utils/object-util";

const { t } = useI18n();

const systemStore = useSystemStore();
const settingStore = useSettingStore();

// 字体大小修改实时生效
watch(
  () => settingStore.app.fontSize,
  (value) => {
    setCustomFontSize(value)
  }
)

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

</script>

<template>
  <div class="setting">
    <div @click="systemStore.openSettingModal()">
      <a-badge
        :count="newVersionFlag ? 1 : 0"
        dot
        :dot-style="{ width: '7px', height: '7px' }"
      >
        <slot name="default"></slot>
      </a-badge>
    </div>

    <!-- 设置模态框 -->
    <a-modal
      v-model:visible="systemStore.settingModal.visible"
      :footer="false"
      unmount-on-close
      title-align="start"
      width="80vw"
    >
      <!-- 标题 -->
      <template #title> {{ $t("setting.name") }} </template>
      <!-- 页面主内容 -->
      <div class="setting-page">
        <a-tabs position="left" :default-active-key="settingDefaultActiveKey">
          <!-- 应用 -->
          <a-tab-pane key="app" :title="$t('setting.app.name')">
            <a-tabs position="left">
              <!-- 外观设置 -->
              <a-tab-pane
                key="appearance"
                :title="$t('setting.app.appearance.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <!-- 设置主题 -->
                  <a-space direction="vertical" :size="10">
                    <div>{{ $t("setting.app.appearance.theme.name") }}</div>
                    <a-radio-group
                      v-model="settingStore.app.themeModel"
                      type="button"
                      size="small"
                    >
                      <a-radio :value="0">
                        <IconSync />
                        {{ $t("setting.app.appearance.theme.auto") }}
                      </a-radio>
                      <a-radio :value="1">
                        <IconSun />
                        {{ $t("setting.app.appearance.theme.light") }}
                      </a-radio>
                      <a-radio :value="2">
                        <IconMoonFill />
                        {{ $t("setting.app.appearance.theme.dark") }}
                      </a-radio>
                      <a-radio :value="3">
                        <IconPalette />
                        {{ $t("setting.app.appearance.theme.custom") }}
                      </a-radio>
                    </a-radio-group>
                  </a-space>

                  <!-- 色彩选择 -->
                  <a-space
                    v-if="settingStore.app.themeModel === 3"
                    direction="vertical"
                    :size="10"
                  >
                    <div>
                      {{ $t("setting.app.appearance.theme.customEdit") }}
                    </div>
                    <div class="custom-theme-list">
                      <div
                        v-for="tk in Object.keys(defaultCustomThemeMap)"
                        :key="tk"
                        class="custom-theme-list-item"
                      >
                        <div class="custom-theme-list-item-label">{{ tk }}</div>
                        <a-color-picker
                          v-model="settingStore.app.customThemeMap[tk]"
                          size="small"
                          class="custom-theme-list-item-color-picker"
                        />
                      </div>
                    </div>
                  </a-space>

                  <!-- 设置字体 -->
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.app.appearance.fontSize") }}</div>
                    <a-space :size="10">
                      <div>{{ $t("setting.app.appearance.min") }}</div>
                      <a-slider
                        v-model="settingStore.app.fontSize"
                        :min="1"
                        :max="5"
                        show-ticks
                        style="width: 300px"
                      />
                      <div>{{ $t('setting.app.appearance.max') }}</div>
                    </a-space>
                  </a-space>

                  <!-- 设置语言 -->
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t('setting.app.appearance.local') }}</div>
                      <a-select
                        v-model="settingStore.app.locale"
                        size="small"
                        :fallback-option="false"
                      >
                        <a-option value="zh_CN">中文</a-option>
                        <a-option value="en_US">English</a-option>
                      </a-select>
                  </a-space>
                </a-space>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>

          <!-- 系统操作模型 -->
          <a-tab-pane
            key="functionModel"
            :title="$t('setting.functionModel.name')"
          >
          </a-tab-pane>

          <!-- 大模型 -->
          <a-tab-pane key="bigModel" :title="$t('setting.bigModel.name')">
            <a-tabs position="left">
              <!-- OpenAI -->
              <a-tab-pane
                key="openAI"
                :title="$t('setting.bigModel.openAI.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("common.officialWebsite") }}</div>
                    <a-link @click="openInBrowser('https://openai.com')"
                      >https://openai.com</a-link
                    >
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.openAI.baseUrl") }}</div>
                    <a-input
                      v-model="settingStore.openAI.baseUrl"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.openAI.baseUrl')
                      "
                    />
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.openAI.key") }}</div>
                    <a-input-password
                      v-model="settingStore.openAI.key"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.openAI.key')
                      "
                    />
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- Ollama -->
              <a-tab-pane
                key="ollama"
                :title="$t('setting.bigModel.ollama.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link @click="openInBrowser('https://ollama.com')"
                        >https://ollama.com</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.ollama.baseUrl") }}</div>
                      <a-input
                        v-model="settingStore.ollama.baseUrl"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.ollama.baseUrl')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- Gemini -->
              <a-tab-pane
                key="gemini"
                :title="$t('setting.bigModel.gemini.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("common.officialWebsite") }}</div>
                    <a-link
                      @click="
                        openInBrowser(
                          'https://ai.google.dev/docs/gemini_api_overview'
                        )
                      "
                      >https://ai.google.dev/docs/gemini_api_overview</a-link
                    >
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.gemini.baseUrl") }}</div>
                    <a-input
                      v-model="settingStore.gemini.baseUrl"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.gemini.baseUrl')
                      "
                    />
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.gemini.key") }}</div>
                    <a-input-password
                      v-model="settingStore.gemini.key"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.gemini.key')
                      "
                    />
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- 智谱 -->
              <a-tab-pane
                key="zhipuAI"
                :title="$t('setting.bigModel.zhipuAI.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link @click="openInBrowser('https://open.bigmodel.cn')"
                        >https://open.bigmodel.cn</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.zhipuAI.apiKey") }}</div>
                      <a-input-password
                        v-model="settingStore.zhipuAI.apiKey"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.zhipuAI.apiKey')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>
              <!-- 通义千问 -->
              <a-tab-pane
                key="tongyi"
                :title="$t('setting.bigModel.tongyi.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link
                        @click="openInBrowser('https://tongyi.aliyun.com')"
                        >https://tongyi.aliyun.com</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.tongyi.apiKey") }}</div>
                      <a-input-password
                        v-model="settingStore.tongyi.apiKey"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.tongyi.apiKey')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- 文心一言 -->
              <a-tab-pane
                key="ernie"
                :title="$t('setting.bigModel.ernie.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("common.officialWebsite") }}</div>
                    <a-link @click="openInBrowser('https://yiyan.baidu.com')"
                      >https://yiyan.baidu.com</a-link
                    >
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.ernie.apiKey") }}</div>
                    <a-input-password
                      v-model="settingStore.ernie.apiKey"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.ernie.apiKey')
                      "
                    />
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.ernie.secretKey") }}</div>
                    <a-input-password
                      v-model="settingStore.ernie.secretKey"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.ernie.secretKey')
                      "
                    />
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- 讯飞星火 -->
              <a-tab-pane
                key="spark"
                :title="$t('setting.bigModel.spark.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("common.officialWebsite") }}</div>
                    <a-link @click="openInBrowser('https://xinghuo.xfyun.cn')"
                      >https://xinghuo.xfyun.cn</a-link
                    >
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.spark.appId") }}</div>
                    <a-input
                      v-model="settingStore.spark.appId"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.spark.appId')
                      "
                    />
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.spark.secret") }}</div>
                    <a-input-password
                      v-model="settingStore.spark.secret"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.spark.secret')
                      "
                    />
                  </a-space>
                  <a-space direction="vertical" :size="10" fill>
                    <div>{{ $t("setting.bigModel.spark.key") }}</div>
                    <a-input-password
                      v-model="settingStore.spark.key"
                      size="small"
                      :placeholder="
                        $t('common.pleaseEnter') +
                        ' ' +
                        $t('setting.bigModel.spark.key')
                      "
                    />
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- 天工 -->
              <a-tab-pane
                key="tiangong"
                :title="$t('setting.bigModel.tiangong.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link
                        @click="
                          openInBrowser('https://model-platform.tiangong.cn')
                        "
                        >https://model-platform.tiangong.cn</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.tiangong.appKey") }}</div>
                      <a-input-password
                        v-model="settingStore.tiangong.appKey"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.tiangong.appKey')
                        "
                      />
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.tiangong.appSecret") }}</div>
                      <a-input-password
                        v-model="settingStore.tiangong.appSecret"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.tiangong.appSecret')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- 月之暗面 -->
              <a-tab-pane
                key="moonshotAI"
                :title="$t('setting.bigModel.moonshotAI.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link @click="openInBrowser('https://www.moonshot.cn')"
                        >https://www.moonshot.cn</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.moonshotAI.apiKey") }}</div>
                      <a-input-password
                        v-model="settingStore.moonshotAI.apiKey"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.moonshotAI.apiKey')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- 阶跃星辰 -->
              <a-tab-pane
                key="stepFun"
                :title="$t('setting.bigModel.stepFun.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link
                        @click="openInBrowser('https://platform.stepfun.com')"
                        >https://platform.stepfun.com</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.stepFun.apiKey") }}</div>
                      <a-input-password
                        v-model="settingStore.stepFun.apiKey"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.stepFun.apiKey')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>

              <!-- DeepSeek -->
              <a-tab-pane
                key="deepSeek"
                :title="$t('setting.bigModel.deepSeek.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link
                        @click="openInBrowser('https://platform.deepseek.com')"
                        >https://platform.deepseek.com</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.deepSeek.apiKey") }}</div>
                      <a-input-password
                        v-model="settingStore.deepSeek.apiKey"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.deepSeek.apiKey')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>
              <!-- 百川智能 -->
              <a-tab-pane
                key="baichuan"
                :title="$t('setting.bigModel.baichuan.name')"
              >
                <a-space
                  direction="vertical"
                  :size="25"
                  fill
                  class="setting-tab-content"
                >
                  <a-space
                    direction="vertical"
                    :size="25"
                    fill
                    class="setting-tab-content"
                  >
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("common.officialWebsite") }}</div>
                      <a-link
                        @click="openInBrowser('https://platform.baichuan-ai.com/')"
                        >https://platform.baichuan-ai.com/</a-link
                      >
                    </a-space>
                    <a-space direction="vertical" :size="10" fill>
                      <div>{{ $t("setting.bigModel.baichuan.apiKey") }}</div>
                      <a-input-password
                        v-model="settingStore.baichuan.apiKey"
                        size="small"
                        :placeholder="
                          $t('common.pleaseEnter') +
                          ' ' +
                          $t('setting.bigModel.baichuan.apiKey')
                        "
                      />
                    </a-space>
                  </a-space>
                </a-space>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>

          <!-- 关于 -->
          <a-tab-pane key="about" :title="$t('setting.about.name')">
            <a-space
              direction="vertical"
              :size="25"
              fill
              class="setting-tab-content"
            >
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
  height: 60vh;
  overflow-y: auto;
  font-size: var(--font-size-default);

  :deep(.arco-tabs) {
    height: 100%;

    .arco-tabs-tab-title {
      font-size: var(--font-size-default);
    }

    .arco-tabs-content-list {
      height: 100%;

      .arco-tabs-pane {
        height: 100%;

        .setting-tab-content {
          height: 100%;
          overflow-y: auto;
        }
      }
    }
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
}
</style>
