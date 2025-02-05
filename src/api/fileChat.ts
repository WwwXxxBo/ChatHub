import { httpInstance } from "@/utils/http-util";

export const getFileContent = async (
  file: File
) => {
  // 封装为 FormData
  const formData = new FormData();
  formData.append('file', file);
  return httpInstance({
    url: "file",
    method: "POST",
    data: formData,
    headers: {'content-type': 'multipart/form-data'},
  });
};