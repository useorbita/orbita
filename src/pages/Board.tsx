import {
  Center,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { pb } from "../api/pocketbase";
import { CardsResponse, Collections, StatesResponse } from "../api/types";
import { Card } from "../components/Card";

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
        <Card
          open={!!cardId}
          close={() => navigate("/" + boardId)}
          card={selectedCard}
        />
      )}

      <Group position="apart">
        <Text>{boardId}</Text>

        <SegmentedControl
          data={[
            {
              value: "list",
              label: (
                <Center>
                  <IconLayoutList size="1rem" />
                </Center>
              ),
            },
            {
              value: "board",
              label: (
                <Center>
                  <IconLayoutGrid size="1rem" />
                </Center>
              ),
            },
          ]}
          value={view}
          onChange={setView}
        />
      </Group>

      {!loading && view === "board" && (
        <Group>
          {states.map((state: StatesResponse) => (
            <div key={state.id}>
              <Text>{state.title}</Text>
              <Paper h={500} w={150}>
                <Stack>
                  {cards
                    .filter((card) => card.state === state.id)
                    .map((card: CardsResponse) => (
                      <Link key={card.id} to={card.id}>
                        {card.title}
                      </Link>
                    ))}
                </Stack>
              </Paper>
            </div>
          ))}
        </Group>
      )}

      {!loading && view === "list" && (
        <Table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Status</th>
              <th>Beschreibung</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card: CardsResponse) => (
              <tr key={card.id}>
                <Link to={card.id}>
                  <td>{card.title}</td>
                </Link>
                <td>
                  {states.find((state) => state.id === card.state)?.title}
                </td>
                <td>{card.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
