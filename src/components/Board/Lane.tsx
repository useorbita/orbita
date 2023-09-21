import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Stack, Text } from "@mantine/core";
import {
  CardsResponse,
  LabelsResponse,
  StatesResponse,
  UsersResponse,
} from "../../api/types";
import { Card } from "../Card/Card";

interface LaneProps {
  state: StatesResponse;
  cards: CardsResponse[];
  users: UsersResponse[];
  labels: LabelsResponse[];
}

export function Lane({ state, cards, users, labels }: LaneProps) {
  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: state.id,
    data: {
      type: "container",
    },
  });

  return (
    <div
      key={state.id}
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
    >
      <Text>
        {state.title}
        {isDragging && "..."}
      </Text>

      <Paper
        h={"75vh"}
        w={250}
        style={{ backgroundColor: "#00000009" }}
        ref={setNodeRef}
      >
        <SortableContext
          items={cards
            .filter((card) => card.state === state.id)
            // .sort((a, b) => a.position - b.position)
            .map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack>
            {cards
              .filter((card) => card.state === state.id)
              //   .sort((a, b) => a.position - b.position)
              .map((card: CardsResponse) => (
                <Card key={card.id} card={card} users={users} labels={labels} />
              ))}
          </Stack>
        </SortableContext>
      </Paper>
    </div>
  );
}
