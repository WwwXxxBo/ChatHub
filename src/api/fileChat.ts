import { httpInstance } from "@/utils/http-util";
import { type BaseMessage } from "@/types";

export const getFileContent = (
  file: File
) => {
  console.log('已经接收到了File：', file)
  // 封装为 FormData
  const formData = new FormData();
  formData.append('file', file);
  return httpInstance({
    url: "/uploadfile",
    method: "POST",
    data: formData,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
  });
};
