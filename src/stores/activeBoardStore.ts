import { create } from "zustand";
import { pb } from "../api/pocketbase";
import {
  BoardsResponse,
  CardsResponse,
  Collections,
  LabelsResponse,
  StatesResponse,
  UsersResponse,
} from "../api/types";

interface BoardStore {
  isLoading: boolean;

  activeBoard: BoardsResponse | null;
  
  getActiveBoard: ({
    boardId,
  }: {
    boardId: string | undefined;
  }) => Promise<void>;

  cards: CardsResponse[];
  states: StatesResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];

  // cards: Map<StatesResponse, CardsResponse[]>;
}

export const useActiveBoardStore = create<BoardStore>()((set) => ({
  isLoading: false,

  activeBoard: null,

  cards: [],
  states: [],
  users: [],
  labels: [],

  getActiveBoard: async ({ boardId }) => {
    set({ isLoading: true });

    const [allCards, allStates, allUsers, allLabels, activeBoard] =
      await Promise.all([
        pb.collection(Collections.Cards).getFullList<CardsResponse>({
          filter: `board = "${boardId}"`,
        }),
        pb
          .collection(Collections.States)
          .getFullList<StatesResponse>({ filter: `board = "${boardId}"` }),
        pb.collection(Collections.Users).getFullList<UsersResponse>(),
        pb.collection(Collections.Labels).getFullList<LabelsResponse>(),
        pb.collection(Collections.Boards).getOne<BoardsResponse>(boardId || ""),
      ]);

    set({
      cards: allCards,
      states: allStates,
      users: allUsers,
      labels: allLabels,
      activeBoard,
    });

    set({ isLoading: false });
  },
}));
