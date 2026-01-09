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

  view: "list",

  getActiveBoard: async ({ boardId }) => {
    set({ isLoading: true });

    pb.collection("cards").unsubscribe("*");

    set({
      activeBoard: null,
      cards: [],
      lists: [],
      users: [],
      labels: [],
    });

    const [allCards, allLists, allUsers, allLabels, activeBoard] = await Promise
      .all([
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

    // realtime card events need do be handled immutably TODO: Find more efficent way. Maybe immer?
    pb.collection("cards").subscribe<CardsResponse>("*", (event) => {
      if (event.action === "create") {
        set({
          cards: [...get().cards, event.record],
        });
      }

      if (event.action === "update") {
        set({
          cards: get().cards.map((c) =>
            c.id === event.record.id ? event.record : c
          ),
        });
      }

      if (event.action === "delete") {
        set({
          cards: get().cards.filter((c) => c.id !== event.record.id),
        });
      }
    }, { filter: `board = "${boardId}"` });

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
