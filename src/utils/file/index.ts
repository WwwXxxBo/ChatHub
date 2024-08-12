// 与文件相关的操作
import fs from "fs";
import { join } from "path";

const appConfig = {
  tempPath: "@/data",
};

// 临时缓存目录
const creatTempPath = () => {
  try {
    fs.mkdirSync(appConfig.tempPath);
  } catch (e: any) {
    if (e.code != "EEXIST") {
      console.log(e);
    }
  }
};

// 通过目录保存文件
export const saveFileByPath = (path: string, fileName: string) => {
  creatTempPath();
  const filePath = join(appConfig.tempPath, fileName);
  fs.copyFileSync(path, filePath)
  return filePath
};
