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

  createState: ({ title }: { title: string }) => Promise<void>;

  cards: CardsResponse[];
  states: StatesResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];

  view: string;
  setView: (view: string) => void;
}

export const useActiveBoardStore = create<BoardStore>()((set, get) => ({
  isLoading: false,

  activeBoard: null,

  cards: [],
  states: [],
  users: [],
  labels: [],

  view: "lane",

  getActiveBoard: async ({ boardId }) => {
    set({ isLoading: true });

    set({
      activeBoard: null,
      cards: [],
      states: [],
      users: [],
      labels: [],
    });

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

  createState: async ({ title }) => {
    await pb.collection("states").create({
      title: title,
      board: get().activeBoard?.id,
    });
    await get().getActiveBoard({ boardId: get().activeBoard?.id });
  },

  setView(view) {
    set({ view });
  },
}));
