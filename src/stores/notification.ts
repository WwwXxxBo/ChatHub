import { defineStore } from "pinia";
// 引入接口
import { type AppNotification } from "@/types";

export const useNotificationStore = defineStore({
  id: "notification",
  state: () => ({
    notifications: [] as AppNotification[],
  }),
  actions: {
    info(msg: string) {
      this.notifications.unshift({
        type: "info",
        createTime: new Date().getTime(),
        content: msg,
      });
    },
    warn(msg: string) {
      this.notifications.unshift({
        type: "warn",
        createTime: new Date().getTime(),
        content: msg,
      });
    },
    error(msg: string) {
      this.notifications.unshift({
        type: "error",
        createTime: new Date().getTime(),
        content: msg,
      });
    },
  },
});
