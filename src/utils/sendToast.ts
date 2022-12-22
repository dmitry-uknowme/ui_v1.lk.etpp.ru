import { LK_URL } from "../services/api";

const sendToast = (
  type: "success" | "error" | "warning" | "info" = "error",
  message: string
) => {
  if (!window.parent) return;
  window.parent.postMessage({ event: "SEND_TOAST", type, message }, LK_URL);
};

export default sendToast;
