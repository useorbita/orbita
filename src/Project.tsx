import { Text, Title } from "@mantine/core";
import { Board } from "./Board";
import { useState, useEffect } from "react";
import { pb } from "./main";

export function Project({ project }) {
  const [cards, setCards] = useState();

  useEffect(() => {
    (async () => {
      const result = await pb
        .collection("cards")
        .getFullList({ filter: `project = "${project.id}"` });

      console.log(result);
      setCards(result);
    })();
  }, [project.id]);

  if (!project) return <Text>Lade...</Text>;

  return (
    <>
      <Title>{project.name}</Title>
      <Text>Filter für Karten</Text>
      {cards ? <Board cards={cards} /> : <Text>Lade Karten</Text>}
    </>
  );
}
