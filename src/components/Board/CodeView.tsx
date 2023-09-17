import { ScrollArea } from "@mantine/core";
import {
  CardsResponse,
  LabelsResponse,
  StatesResponse,
  UsersResponse,
} from "../../api/types";

interface CodeViewProps {
  states: StatesResponse[];
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function CodeView({ cards, states, users, labels }: CodeViewProps) {
  return (
    <ScrollArea>
      <pre>{JSON.stringify({ states, users, labels, cards }, null, 2)}</pre>
    </ScrollArea>
  );
}
