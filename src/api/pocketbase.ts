import PocketBase from "pocketbase";
import {
  BoardsResponse,
  CardsResponse,
  Collections,
  LabelsResponse,
  ListsResponse,
  UsersResponse,
} from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const pb = new PocketBase("http://127.0.0.1:8090");

if (import.meta.env.DEV) pb.autoCancellation(false);

export const useBoards = () =>
  useQuery({
    queryKey: [Collections.Boards],
    queryFn: () =>
      pb.collection(Collections.Boards).getFullList<BoardsResponse>({
        sort: "created",
      }),
  });

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, member }: { title: string; member: string }) => {
      return pb.collection(Collections.Boards).create<BoardsResponse>({
        title: title,
        members: [member],
      });
    },
    onSuccess: (data: BoardsResponse) => {
      queryClient.setQueryData(
        [Collections.Boards],
        (oldData: BoardsResponse[]) => [...oldData, data]
      );
    },
  });
};

export const useBoard = (boardId: string | undefined) =>
  useQuery({
    queryKey: ["board", boardId],
    // This is a workaround, because we get the boardId
    // with useMatch and can't match only for the boardId
    // TODO: find a better solution, maybe with zustand
    enabled: !!boardId && boardId !== "settings",
    queryFn: async () => {
      const [allCards, allLists, allUsers, allLabels, board] =
        await Promise.all([
          pb.collection(Collections.Cards).getFullList<CardsResponse>({
            filter: `board = "${boardId}"`,
          }),
          pb
            .collection(Collections.Lists)
            .getFullList<ListsResponse>({ filter: `board = "${boardId}"` }),
          pb.collection(Collections.Users).getFullList<UsersResponse>(),
          pb.collection(Collections.Labels).getFullList<LabelsResponse>(),
          pb
            .collection(Collections.Boards)
            .getOne<BoardsResponse>(boardId || ""),
        ]);

      const allData: Record<string, CardsResponse[]> = {};

      // Initialize an empty array for each list id
      allLists.forEach((list) => {
        allData[list.id] = [];
      });

      // Assign each card to its list bucket
      allCards.forEach((card) => {
        const listId = (card as any).list;
        if (listId && allData[listId]) {
          allData[listId].push(card);
        }
      });

      return {
        allData: allData,
        cards: allCards,
        lists: allLists,
        users: allUsers,
        labels: allLabels,
        board,
      };
    },
  });
