import {
  Button,
  Center,
  Group,
  Paper,
  SegmentedControl,
  Space,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
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
  const [view, setView] = useState("board");

  const [selectedCard, setSelectedCard] = useState<CardsResponse>();

  const [cards, setCards] = useState<CardsResponse[]>([]);
  const [states, setStates] = useState<StatesResponse[]>([]);

  useEffect(() => {
    (async () => {
      console.time("getting states and cards...");
      setLoading(true);
      setStates([]);
      setCards([]);

      const [allStates, allCards] = await Promise.all([
        pb
          .collection(Collections.States)
          .getFullList<StatesResponse>({ filter: `board = "${board.id}"` }),
        pb.collection(Collections.Cards).getFullList<CardsResponse>({
          filter: `board = "${board.id}"`,
        }),
      ]);

      setStates(allStates);
      setCards(allCards);

      setSelectedCard(undefined);
      setLoading(false);
      console.timeEnd("getting states and cards...");
    })();
  }, [board.id]);

  return (
    <>
      <Group position="apart">
        <Text>{board?.name}</Text>

        <SegmentedControl
          data={[
            {
              value: "list",
              label: (
                <Center>
                  <IconLayoutList size="1rem" />
                  {/* <Box ml={10}>Liste</Box> */}
                </Center>
              ),
            },
            {
              value: "board",
              label: (
                <Center>
                  <IconLayoutGrid size="1rem" />
                  {/* <Box ml={10}>Board</Box> */}
                </Center>
              ),
            },
          ]}
          value={view}
          onChange={setView}
        />
      </Group>

      <Card open={open} close={() => setOpen(false)} card={selectedCard} />

      <Space h="xl" />

      {!loading && view === "board" && (
        <Group>
          {states.map((state: StatesResponse) => (
            <div>
              <Text>{state.name}</Text>
              <Paper h={500} w={150}>
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
                <td>{card.title}</td>
                <td>{states.find((state) => state.id === card.state)?.name}</td>
                <td>{card.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
