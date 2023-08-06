import { Group, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pb } from "../api/pocketbase";
import {
  BoardsResponse,
  CardsResponse,
  Collections,
  LabelsResponse,
  StatesResponse,
  UsersResponse,
} from "../api/types";
import { ColumnView } from "../components/Board/ColumnView";
import { ListView } from "../components/Board/ListView";
import { CardModal } from "../components/Card/CardModal";
import { FilterMenu } from "../components/UI/FilterMenu";
import { Search } from "../components/UI/Search";
import { ViewSwitch } from "../components/UI/ViewSwitch";

export function Board() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("column");
  const [selectedCard, setSelectedCard] = useState<CardsResponse>();
  const [cards, setCards] = useState<CardsResponse[]>([]);
  const [states, setStates] = useState<StatesResponse[]>([]);
  const [users, setUsers] = useState<UsersResponse[]>([]);
  const [labels, setLabels] = useState<LabelsResponse[]>([]);
  const [activeBoard, setActiveBoard] = useState<BoardsResponse>();

  const { boardId, cardId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      console.time("getting states and cards...");
      setLoading(true);
      setStates([]);
      setCards([]);

      const [allStates, allCards, allUsers, allLabels, selectedBoard] =
        await Promise.all([
          pb
            .collection(Collections.States)
            .getFullList<StatesResponse>({ filter: `board = "${boardId}"` }),
          pb.collection(Collections.Cards).getFullList<CardsResponse>({
            filter: `board = "${boardId}"`,
          }),
          pb.collection(Collections.Users).getFullList<UsersResponse>(),
          pb.collection(Collections.Labels).getFullList<LabelsResponse>(),
          pb
            .collection(Collections.Boards)
            .getOne<BoardsResponse>(boardId || ""),
        ]);

      setStates(allStates);
      setCards(allCards);
      setUsers(allUsers);
      setLabels(allLabels);
      setActiveBoard(selectedBoard);

      if (cardId) setSelectedCard(allCards.find((card) => card.id === cardId));

      setLoading(false);
      console.timeEnd("getting states and cards...");
    })();
  }, [boardId]);

  useEffect(() => {
    setSelectedCard(cards.find((card) => card.id === cardId));
  }, [cards, cardId]);

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
        <Text>{activeBoard?.title}</Text>

        <Group>
          <Search />
          <FilterMenu />
          <ViewSwitch view={view} setView={setView} />
        </Group>
      </Group>

      {!loading && view === "column" && (
        <ColumnView
          states={states}
          cards={cards}
          users={users}
          labels={labels}
        />
      )}

      {!loading && view === "list" && (
        <ListView states={states} cards={cards} users={users} labels={labels} />
      )}
    </>
  );
}
