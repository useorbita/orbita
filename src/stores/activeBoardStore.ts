import { create } from "zustand";
import { pb } from "../api/pocketbase";
import {
  BoardsResponse,
  CardsResponse,
  Collections,
  LabelsResponse,
  ListsResponse,
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

  createList: ({ title }: { title: string }) => Promise<void>;
  createCard: ({
    title,
    listId,
  }: {
    title: string;
    listId: string;
  }) => Promise<void>;

  cards: CardsResponse[];
  lists: ListsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];

  view: string;
  setView: (view: string) => void;
}

export const useActiveBoardStore = create<BoardStore>()((set, get) => ({
  isLoading: false,

  activeBoard: null,

  cards: [],
  lists: [],
  users: [],
  labels: [],

  view: "lane",

  getActiveBoard: async ({ boardId }) => {
    set({ isLoading: true });

    set({
      activeBoard: null,
      cards: [],
      lists: [],
      users: [],
      labels: [],
    });

    const [allCards, allLists, allUsers, allLabels, activeBoard] =
      await Promise.all([
        pb.collection(Collections.Cards).getFullList<CardsResponse>({
          filter: `board = "${boardId}"`,
        }),
        pb
          .collection(Collections.Lists)
          .getFullList<ListsResponse>({ filter: `board = "${boardId}"` }),
        pb.collection(Collections.Users).getFullList<UsersResponse>(),
        pb.collection(Collections.Labels).getFullList<LabelsResponse>(),
        pb.collection(Collections.Boards).getOne<BoardsResponse>(boardId || ""),
      ]);

    set({
      cards: allCards,
      lists: allLists,
      users: allUsers,
      labels: allLabels,
      activeBoard,
    });

    set({ isLoading: false });
  },

  createList: async ({ title }) => {
    await pb.collection("lists").create({
      title: title,
      board: get().activeBoard?.id,
    });
    await get().getActiveBoard({ boardId: get().activeBoard?.id });
  },

  createCard: async ({ title, listId }) => {
    await pb.collection("cards").create({
      title: title,
      board: get().activeBoard?.id,
      list: listId,
    });
    await get().getActiveBoard({ boardId: get().activeBoard?.id });
  },

  setView(view) {
    set({ view });
  },
}));
