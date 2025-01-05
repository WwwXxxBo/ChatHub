import { AssistantHttpInstance } from "@/utils/http-util";

// 获取通用设置
export const getCommonSetting = (
    userId: number,
  ) => {
    return AssistantHttpInstance({
      url: "/common_setting/",
      method: "GET",
      params: {
        userId: userId
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
};

// 创建通用设置
export const createCommonSetting = (
    userId: number,
    openAIKey: string,
    zhipuAIKey: string,
    ernieAPIKey: string,
    ernieSecretKey: string,
    sparkAppId: string,
    sparkSecret: string,
    sparkKey: string,
    tongyiKey: string,
    moonshotAIKey: string, 
    tiangongAppKey: string, 
    tiangongAppSecret: string, 
    stepFunKey: string, 
    deepSeekKey: string, 
    baichuanKey: string
  ) => {
    return AssistantHttpInstance({
      url: "/common_setting/",
      method: "POST",
      params: {
        userId: userId,
        openAIKey: openAIKey,
        zhipuAIKey: zhipuAIKey,
        ernieAPIKey: ernieAPIKey,
        ernieSecretKey: ernieSecretKey,
        sparkAppId: sparkAppId,
        sparkSecret: sparkSecret,
        sparkKey: sparkKey,
        tongyiKey: tongyiKey,
        moonshotAIKey: moonshotAIKey, 
        tiangongAppKey: tiangongAppKey, 
        tiangongAppSecret: tiangongAppSecret, 
        stepFunKey: stepFunKey, 
        deepSeekKey: deepSeekKey, 
        baichuanKey: baichuanKey
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  };


// 修改通用设置
export const modifyCommonSetting = (
    userId: number,
    openAIKey: string,
    zhipuAIKey: string,
    ernieAPIKey: string,
    ernieSecretKey: string,
    sparkAppId: string,
    sparkSecret: string,
    sparkKey: string,
    tongyiKey: string,
    moonshotAIKey: string, 
    tiangongAppKey: string, 
    tiangongAppSecret: string, 
    stepFunKey: string, 
    deepSeekKey: string, 
    baichuanKey: string
  ) => {
    return AssistantHttpInstance({
      url: "/common_setting/",
      method: "PUT",
      params: {
        userId: userId,
        openAIKey: openAIKey,
        zhipuAIKey: zhipuAIKey,
        ernieAPIKey: ernieAPIKey,
        ernieSecretKey: ernieSecretKey,
        sparkAppId: sparkAppId,
        sparkSecret: sparkSecret,
        sparkKey: sparkKey,
        tongyiKey: tongyiKey,
        moonshotAIKey: moonshotAIKey, 
        tiangongAppKey: tiangongAppKey, 
        tiangongAppSecret: tiangongAppSecret, 
        stepFunKey: stepFunKey, 
        deepSeekKey: deepSeekKey, 
        baichuanKey: baichuanKey
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  };