import { Button, Title, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { CardsResponse, BoardsResponse, Collections } from "../api/types";
import { Card } from "./Card";
import { pb } from "../api/pocketbase";

export function Board({ project }: { project: BoardsResponse }) {
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardsResponse>();

  const [cards, setCards] = useState<CardsResponse[]>([]);

  useEffect(() => {
    (async () => {
      const result = await pb
        .collection(Collections.Cards)
        .getFullList<CardsResponse>({ filter: `project = "${project.id}"` });

      console.log(result);
      setCards(result);
    })();
  }, [project.id]);

  if (!project) return <Text>Lade...</Text>;

  return (
    <>
      <Title>{project.name}</Title>

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
