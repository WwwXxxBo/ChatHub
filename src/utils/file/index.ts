// // 与文件相关的操作
// import fs from "fs";
// import { join } from "path";

// const appConfig = {
//   tempPath: "C:\isaac\myproject\ChatHub\data",
// };

// // 临时缓存目录
// const creatTempPath = () => {
//   try {
//     fs.mkdirSync(appConfig.tempPath);
//   } catch (e: any) {
//     if (e.code != "EXIST") {
//       console.log(e);
//     }
//   }
// };

// // 通过目录保存文件
// export const saveFileByPath = (path: string, fileName: string) => {
//   creatTempPath();
//   const filePath = join(appConfig.tempPath, fileName);
//   fs.copyFileSync(path, filePath);
//   return filePath;
// };

// 规范输出文件大小
export const formatFileSize = (size: number): string => {
  if(!size || size === 0) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const digitGroups = Math.floor(Math.log(size) / Math.log(1024))
  return parseFloat((size / Math.pow(1024, digitGroups)).toFixed(2)) + ' ' + units[digitGroups]
}; 
