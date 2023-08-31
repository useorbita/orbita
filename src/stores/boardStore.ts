import { create } from "zustand";
import { pb } from "../api/pocketbase";
import { Collections, BoardsResponse } from "../api/types";

interface BoardStore {
  boards: BoardsResponse[];
  isLoading: boolean;
  getAllBoards: () => void;
}

export const useBoardStore = create<BoardStore>()((set) => ({
  boards: [],
  isLoading: false,
  getAllBoards: async () => {
    set({ isLoading: true });
    const response = await pb
      .collection(Collections.Boards)
      .getFullList<BoardsResponse>({ sort: "created" });
    set({ boards: response });
    set({ isLoading: false });
  },
}));
