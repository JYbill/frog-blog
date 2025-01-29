import { format } from "date-fns";
import type { DateArg } from "date-fns";

/**
 * 日期格式化
 * @param date
 */
export const unifyDate = (date: DateArg<Date>) => {
  const result = format(date, "yyyy-MM-dd");
  return result;
};
