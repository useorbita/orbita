import { CardsPriorityOptions } from "../api/types";

export const PRIORITY_COLOR: Record<string, string> = {
  [CardsPriorityOptions.lowest]: "gray",
  [CardsPriorityOptions.low]: "blue",
  [CardsPriorityOptions.medium]: "yellow",
  [CardsPriorityOptions.high]: "orange",
  [CardsPriorityOptions.highest]: "red",
};
