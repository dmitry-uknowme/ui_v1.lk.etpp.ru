import { format } from "date-fns";
const formatDate = (date: Date, pattern?: string) =>
  format(date, pattern || "yyyy-MM-dd HH:mm");

export default formatDate;
