import PocketBase from "pocketbase";
import { BoardsResponse, Collections } from "./types";

export const pb = new PocketBase("http://127.0.0.1:8090");

if (import.meta.env.DEV) pb.autoCancellation(false);

export const Api = {
  Boards: {
    getList: () =>
      pb.collection(Collections.Boards).getFullList<BoardsResponse>({
        sort: "created",
      }),
  },
};
