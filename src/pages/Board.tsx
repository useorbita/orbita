import { Group, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pb } from "../api/pocketbase";
import { CardsResponse, Collections, StatesResponse } from "../api/types";
import { ColumnView } from "../components/Board/ColumnView";
import { ListView } from "../components/Board/ListView";
import { CardModal } from "../components/Card/CardModal";
import { FilterMenu } from "../components/UI/FilterMenu";
import { Search } from "../components/UI/Search";
import { ViewSwitch } from "../components/UI/ViewSwitch";

export function Board() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("board");
  const [selectedCard, setSelectedCard] = useState<CardsResponse>();
  const [cards, setCards] = useState<CardsResponse[]>([]);
  const [states, setStates] = useState<StatesResponse[]>([]);
  const { boardId, cardId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      console.time("getting states and cards...");
      setLoading(true);
      setStates([]);
      setCards([]);

      const [allStates, allCards] = await Promise.all([
        pb
          .collection(Collections.States)
          .getFullList<StatesResponse>({ filter: `board = "${boardId}"` }),
        pb.collection(Collections.Cards).getFullList<CardsResponse>({
          filter: `board = "${boardId}"`,
        }),
      ]);

      setStates(allStates);
      setCards(allCards);

      if (!!cardId)
        setSelectedCard(allCards.find((card) => card.id === cardId));

      setLoading(false);
      console.timeEnd("getting states and cards...");
    })();
  }, [boardId]);

  useEffect(() => {
    setSelectedCard(cards.find((card) => card.id === cardId));
  }, [cardId]);

  return (
    <>
      {cardId && (
        <CardModal
          open={!!cardId}
          close={() => navigate("/" + boardId)}
          card={selectedCard}
        />
      )}

      <Group position="apart" mb="xl">
        <Text>{boardId}</Text>

        <Group>
          <Search />
          <FilterMenu />
          <ViewSwitch view={view} setView={() => setView} />
        </Group>
      </Group>

      {!loading && view === "board" && (
        <ColumnView states={states} cards={cards} />
      )}

      {!loading && view === "list" && (
        <ListView states={states} cards={cards} />
      )}
    </>
  );
}
