import { httpInstance } from "@/utils/http-util";
import { type BaseMessage } from "@/types";

export const getFileContent = (
  id: string,
  assistant_id: string,
  file: File
) => {
  return httpInstance({
    url: "/file",
    method: "GET",
    data: JSON.stringify({
      id: id,
      assistant_id: assistant_id,
      file: File,
    }),
  });
};
