import {
  Box,
  Button,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { pb } from "../api/pocketbase";
import {
  BoardsResponse,
  CardsResponse,
  Collections,
  StatesResponse,
} from "../api/types";
import { Card } from "./Card";

export function Board({ board }: { board: BoardsResponse }) {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardsResponse>();

  const [cards, setCards] = useState<CardsResponse[]>([]);
  const [states, setStates] = useState<StatesResponse[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const allStates = await pb
        .collection(Collections.States)
        .getFullList<StatesResponse>({ filter: `board = "${board.id}"` });

      setStates(allStates);

      console.log(allStates);

      const allCards = await pb
        .collection(Collections.Cards)
        .getFullList<CardsResponse>({
          filter: `board = "${board.id}"`,
        });

      console.log(allCards);

      setCards(allCards);
      setLoading(false);
    })();
  }, [board.id]);

  if (loading) return <Text>Lade...</Text>;

  return (
    <>
      <Title>{board?.name}</Title>

      <Card open={open} close={() => setOpen(false)} card={selectedCard} />

      <Group>
        {states.map((state: StatesResponse) => (
          <Box>
            <Text>{state.name}</Text>
            <ScrollArea h={"100%"}>
              <Stack>
                {cards
                  .filter((card) => card.state === state.id)
                  .map((card: CardsResponse) => (
                    <Button
                      key={card.id}
                      onClick={() => {
                        setSelectedCard(card);
                        setOpen(true);
                      }}
                    >
                      <strong>{card.title}</strong>
                    </Button>
                  ))}
              </Stack>
            </ScrollArea>
          </Box>
        ))}
      </Group>
    </>
  );
}
