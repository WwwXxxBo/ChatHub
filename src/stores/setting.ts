import { defineStore } from "pinia";
import { isZH } from "@/utils/window-util";
import {
  defaultCustomThemeMap,
  defaultFontSizeLevel,
} from "@/utils/theme-util";
import { copyObj } from "@/utils/object-util";
import { type BigModelProvider } from "@/types"

export const useSettingStore = defineStore({
  id: "setting",
  state: () => ({
    app: {
      // 主题模式：0自动 1明亮 2黑暗 3自定义
      themeModel: 0,
      // 自定义主题样式表
      customThemeMap: copyObj(defaultCustomThemeMap),
      // 字体大小 1-5
      fontSize: defaultFontSizeLevel,
      // 本地化
      locale: isZH() ? "zh_CN" : "en_US",
    },
    // 模型 URL 和 API Key
    deepSeek: {
      id: "",
      apiKey: "",
    },
    tongyi: {
      id: "",
      apiKey: "",
    },
    moonshotAI: {
      id: "",
      apiKey: "",
    },
    zhipuAI: {
      id: "",
      apiKey: "",
    },
    doubao: {
      id: "",
      apiKey: "",
    },
  }),
  actions: {
    setStoreFromJson(json: string) {
      let importFlag = false;
      if (!json) {
        return importFlag;
      }
      const settingBackup = JSON.parse(json);
      if (settingBackup.app !== undefined) {
        this.app = settingBackup.app;
        importFlag = true;
      }
      if (settingBackup.tongyi !== undefined) {
        this.tongyi = settingBackup.tongyi;
        importFlag = true;
      }
      if (settingBackup.moonshotAI !== undefined) {
        this.moonshotAI = settingBackup.moonshotAI;
        importFlag = true;
      }
      if (settingBackup.zhipuAI !== undefined) {
        this.zhipuAI = settingBackup.zhipuAI;
        importFlag = true;
      }
      if (settingBackup.deepSeek !== undefined) {
        this.deepSeek = settingBackup.deepSeek;
        importFlag = true;
      }
      if (settingBackup.doubao !== undefined) {
        this.doubao = settingBackup.doubao;
        importFlag = true;
      }
      return importFlag;
    },
    checkBigModelConfig(provider: BigModelProvider) {
      let configErrorFlag = false;
      switch (provider) {
        case "ZhipuAI":
          if (!this.zhipuAI.apiKey) {
            configErrorFlag = true;
          }
          break;
        case "Tongyi":
          if (!this.tongyi.apiKey) {
            configErrorFlag = true;
          }
          break;
        case "MoonshotAI":
          if (!this.moonshotAI.apiKey) {
            configErrorFlag = true;
          }
          break;
        case "DeepSeek":
          if (!this.deepSeek.apiKey) {
            configErrorFlag = true;
          }
          break;
        case "Doubao":
          if (!this.doubao.apiKey) {
            configErrorFlag = true;
          }
          break;
      }
      return configErrorFlag;
    },
    getBigModelConfig(provider: BigModelProvider) {
      let otherOption = {};
      switch (provider) {
        case "ZhipuAI":
          otherOption = {
            apiKey: this.zhipuAI.apiKey,
          };
          break;
        case "Tongyi":
          otherOption = {
            apiKey: this.tongyi.apiKey,
          };
          break;
        case "MoonshotAI":
          otherOption = {
            apiKey: this.moonshotAI.apiKey,
          };
          break;
        case "DeepSeek":
          otherOption = {
            apiKey: this.deepSeek.apiKey,
          };
          break;
        case "Doubao":
          otherOption = {
            apiKey: this.doubao.apiKey,
          };
          break;
      }
      return otherOption;
    },
  },
  persist: false,
});
