import { httpInstance } from "@/utils/http-util";
import { type BaseMessage } from "@/types";

export const getFileContent = (
  file: File
) => {
  return httpInstance({
    url: "/filechat",
    method: "GET",
    data: JSON.stringify({
      file: file,
    }),
  });
};
