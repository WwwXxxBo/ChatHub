import { httpInstance } from "@/utils/http-util";
import { type BaseMessage } from "@/types";

export const getFileContent = (
  file: File
) => {
  // 封装为 FormData
  const formData = new FormData();
  formData.append('file', file);
  return httpInstance({
    url: "/filechat",
    method: "POST",
    data: formData
  });
};
