<script setup lang="ts">
import chatModels from "@/assets/json/chat-models.json";
import { useSettingStore } from "@/stores/setting";
// 引入类型检查
import { Assistant } from "@/types"
import { onMounted, reactive, watch } from "vue";
// 引入判断函数
import { isCustomModel, isSupportImage, isSupportPlugin, isSupportNetwork, isSupportSpeech } from "@/utils/base-util"
// 引入自动识别本地 Ollama 模型方法
import { getOllamaModelList } from "@/utils/bigmodel/ollama-util"

const settingStore = useSettingStore();

let  modelList = []
const assistant = defineModel<Assistant>('assistant', { default: () => ({}) })
watch(
  // 自动显示模型
  () => assistant.value.provider,
  (value) => {
    // 如果模型是 Ollama 本地模型
    if(value === 'Ollama'){
      assistant.value.model = modelList[0]?.name ?? ''
    }
    // 如果模型是其他模型
    else if (chatModels[value] && chatModels[value][0]) {
      assistant.value.model = chatModels[value][0].name
    } else {
      assistant.value.model = ''
    }
  }
)

onMounted(async () => {
  if(assistant.value.provider === 'Ollama'){
    modelList = await getOllamaModelList(settingStore.ollama.baseUrl)
  }
})
</script>

<template>
  <a-form :model="assistant" layout="vertical">
    <!-- 助手名称 -->
    <a-form-item 
      field="name" 
      :label="$t('assistantList.title')"
    >
      <a-input
        v-model="assistant.name"
        :placeholder="
          $t('common.pleaseEnter') + ' ' + $t('assistantList.title')
        "
        :max-length="30"
      />
    </a-form-item>
    <!-- 对话助手参数 -->
    <template v-if="assistant.type === 'chat'">
      <!-- 指令 -->
      <a-form-item field="instruction" :label="$t('assistantList.instruction')">
        <a-textarea
          v-model="assistant.instruction"
          :placeholder="$t('common.pleaseEnter') + ' ' + $t('assistantList.instruction')"
          allow-clear
          :auto-size="{ minRows: 3, maxRows: 10 }"
        />
      </a-form-item>
      <!-- 提供商 -->
      <a-form-item 
        field="provider" 
        :label="$t('assistantList.provider')"
      >
        <a-select 
          v-model="assistant.provider"
          :fallback-option="false"
        >
          <a-option v-for="p in Object.keys(chatModels)" :key="p" :value="p">
            {{ $t(`bigModelProvider.${p}`)}}
          </a-option>
        </a-select>
      </a-form-item>
      <!-- 模型 -->
      <a-form-item field="model" :label="$t('assistantList.model')">
        <a-space direction="vertical" style="width: 100%">
          <!-- 对 Ollama 模型进行特殊处理 -->
          <template v-if="assistant.provider === 'Ollama'">
            <!-- <a-input
              v-model="assistant.model"
              :placeholder=" $t('common.pleaseEnter') + ' ' + $t('assistantList.model') "
            /> -->
            <a-select
              v-model="assistant.model"
              allow-create
              allow-search
              :fallback-option="false"
            >
              <a-option
                v-for="m in modelList"
                :value="m.name"
                :key="m.id"
              >
                {{ m.name }}
              </a-option>
            </a-select>
          </template>
          <template v-else>
            <a-select
              v-model="assistant.model"
              allow-create
              allow-search
              :fallback-option="false"
            >
              <a-option
                v-for="m in chatModels[assistant.provider]"
                :key="m.name"
                :value="m.value"
                >{{ m["name"] }}</a-option
              >
            </a-select>
            <a-tag
              v-if="isCustomModel(assistant.provider, assistant.model)"
              color="green"
              bordered
            >
              <template #icon>
                <icon-check />
              </template>
              {{ $t("assistantList.isCustomModel") }}
            </a-tag>
            <a-space v-else>
              <a-tag
                v-if="isSupportImage(assistant.provider, assistant.model)"
                color="green"
                bordered
              >
                <template #icon>
                  <icon-check />
                </template>
                {{ $t("assistantList.imageSupported") }}
              </a-tag>
              <a-tag v-else color="gray" bordered>
                <template #icon>
                  <icon-close />
                </template>
                {{ $t("assistantList.imageNotSupported") }}
              </a-tag>
              <a-tag
                v-if="isSupportPlugin(assistant.provider, assistant.model)"
                color="green"
                bordered
              >
                <template #icon>
                  <icon-check />
                </template>
                {{ $t("assistantList.pluginSupported") }}
              </a-tag>
              <a-tag v-else color="gray" bordered>
                <template #icon>
                  <icon-close />
                </template>
                {{ $t("assistantList.pluginNotSupported") }}
              </a-tag>
              <a-tag
                v-if="isSupportNetwork(assistant.provider, assistant.model)"
                color="green"
                bordered
              >
                <template #icon>
                  <icon-check />
                </template>
                {{ $t("assistantList.networkSupported") }}
              </a-tag>
              <a-tag v-else color="gray" bordered>
                <template #icon>
                  <icon-close />
                </template>
                {{ $t("assistantList.networkNotSupported") }}
              </a-tag>
            </a-space>
          </template>
        </a-space>
      </a-form-item>
      <!-- 生成token限制 -->
      <a-form-item
        v-if="assistant.provider != 'Ollama'"
        field="maxTokens"
        :label="$t('assistantList.maxTokens')"
      >
        <a-input-number
          v-model="assistant.maxTokens"
          :placeholder="$t('common.pleaseEnter') + ' ' + $t('assistantList.maxTokens')"
          :min="1"
        />
      </a-form-item>

      <!-- 输入token限制 -->
      <a-form-item field="inputMaxTokens" :label="$t('assistantList.inputMaxTokens')">
        <a-input-number
          v-model="assistant.inputMaxTokens"
          :placeholder="$t('common.pleaseEnter') + ' ' + $t('assistantList.inputMaxTokens')"
          :min="1"
        />
      </a-form-item>

      <!-- 上下文条数 -->
      <a-form-item field="contextSize" :label="$t('assistantList.contextSize')">
        <a-input-number
          v-model="assistant.contextSize"
          :placeholder="$t('common.pleaseEnter') + ' ' + $t('assistantList.contextSize')"
          :min="0"
          :max="100"
        />
      </a-form-item>

      <!-- 发音 -->
      <template v-if="assistant.provider === 'OpenAI'">
        <!-- 发音模型 -->
        <a-form-item field="speechModel" :label="$t('assistantList.speechModel')">
          <a-select
            v-model="assistant.speechModel"
            :fallback-option="false"
            :placeholder="$t('common.pleaseSelect') + ' ' + $t('assistantList.speechModel')"
          >
            <a-option value="tts-1">tts-1</a-option>
            <a-option value="tts-1-hd">tts-1-hd</a-option>
          </a-select>
        </a-form-item>
        <!-- 发音人 -->
        <a-form-item field="speechVoice" :label="$t('assistantList.speechVoice')">
          <a-select
            v-model="assistant.speechVoice"
            :fallback-option="false"
            :placeholder="$t('common.pleaseSelect') + ' ' + $t('assistantList.speechVoice')"
          >
            <a-option value="alloy">alloy</a-option>
            <a-option value="echo">echo</a-option>
            <a-option value="fable">fable</a-option>
            <a-option value="onyx">onyx</a-option>
            <a-option value="nova">nova</a-option>
            <a-option value="shimmer">shimmer</a-option>
          </a-select>
        </a-form-item>
        <!-- 发音语速 -->
        <a-form-item field="speechSpeed" :label="$t('assistantList.speechSpeed')">
          <a-input-number
            v-model="assistant.speechSpeed"
            :min="0.25"
            :max="4.0"
            :placeholder="$t('common.pleaseEnter') + ' ' + $t('assistantList.speechSpeed')"
          />
        </a-form-item>
      </template>
    </template>
  </a-form>
</template>

<style lang="less" scoped></style>
