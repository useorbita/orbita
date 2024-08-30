import PocketBase from "pocketbase";
import { BoardsResponse, Collections } from "./types";
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
        (oldData: BoardsResponse[]) => [...oldData, data],
      );
    },
  });
};
