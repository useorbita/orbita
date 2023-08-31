import { create } from "zustand";
import { pb } from "../api/pocketbase";
import { BoardsResponse, Collections } from "../api/types";

interface BoardStore {
  boards: BoardsResponse[];
  isLoading: boolean;
  getAllBoards: () => void;
  createBoard: ({ title, member }: { title: string; member?: string }) => void;
}

export const useBoardStore = create<BoardStore>()((set, get) => ({
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
  createBoard: async ({ title, member }) => {
    await pb.collection("boards").create({
      title: title,
      members: [member],
    });
    get().getAllBoards();
  },
}));
