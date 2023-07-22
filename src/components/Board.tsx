import { Button, Title, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { CardsResponse, BoardsResponse, Collections } from "../api/types";
import { Card } from "./Card";
import { pb } from "../api/pocketbase";

export function Board({ board }: { board: BoardsResponse }) {
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardsResponse>();

  const [cards, setCards] = useState<CardsResponse[]>([]);

  useEffect(() => {
    (async () => {
      const result = await pb
        .collection(Collections.Cards)
        .getFullList<CardsResponse>({ filter: `board = "${board.id}"` });

      console.log(result);
      setCards(result);
    })();
  }, [board.id]);

  if (!board) return <Text>Lade...</Text>;

  return (
    <>
      <Title>{board.name}</Title>

      <Card open={open} close={() => setOpen(false)} card={selectedCard} />

      {cards &&
        cards.map((card: CardsResponse) => (
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

      {/* <pre>{JSON.stringify(cards, null, 2)}</pre> */}
    </>
  );
}
