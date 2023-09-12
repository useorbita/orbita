import { create } from "zustand";
import { pb } from "../api/pocketbase";
import { CardsResponse, Collections, CommentsResponse } from "../api/types";

interface ActiveCardStore {
  isLoading: boolean;
  activeCard: CardsResponse | null;
  comments: CommentsResponse[];
  getActiveCard: ({ cardId }: { cardId: string }) => void;
}

export const useActiveCardStore = create<ActiveCardStore>()((set) => ({
  isLoading: false,
  activeCard: null,
  comments: [],
  getActiveCard: async ({ cardId }: { cardId: string }) => {
    set({ isLoading: true });
    const [activeCard, comments] = await Promise.all([
      pb.collection(Collections.Cards).getOne<CardsResponse>(cardId),
      pb.collection(Collections.Comments).getFullList<CommentsResponse>({
        filter: `card = "${cardId}"`,
        sort: "-created",
      }),
    ]);

    set({ activeCard, comments });
    set({ isLoading: false });
  },
}));
