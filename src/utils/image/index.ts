import { type FileItem } from "@arco-design/web-vue";
import { ref } from "vue";
export const formatImage = (fileItem: FileItem) => {
  let base64String = "";
  fileToBase64(fileItem.file as File, (result) => {
    base64String = result;
  });
  console.log(base64String);
  return base64String;
};

function fileToBase64(file: File, callback: (result: string) => void) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    if (typeof reader.result === "string") {
      callback(reader.result);
    }
  };
  reader.onerror = (error) => {
    console.error("Error reading file:", error);
  };
}
