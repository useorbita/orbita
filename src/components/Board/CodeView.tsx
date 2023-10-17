import { ScrollArea } from "@mantine/core";
import {
  CardsResponse,
  LabelsResponse,
  ListsResponse,
  UsersResponse,
} from "../../api/types";

interface CodeViewProps {
  lists: ListsResponse[];
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function CodeView({ cards, lists, users, labels }: CodeViewProps) {
  return (
    <ScrollArea>
      <pre>{JSON.stringify({ lists, users, labels, cards }, null, 2)}</pre>
    </ScrollArea>
  );
}
