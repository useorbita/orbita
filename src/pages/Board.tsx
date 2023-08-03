import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Avatar,
  Badge,
  Button,
  Center,
  Checkbox,
  Group,
  Menu,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconFilter,
  IconLayoutGrid,
  IconLayoutList,
  IconSearch,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { pb } from "../api/pocketbase";
import {
  CardsPriorityOptions,
  CardsResponse,
  Collections,
  StatesResponse,
} from "../api/types";
import { Card } from "../components/Card";
import { CardModal } from "../components/CardModal";

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // @ts-ignore FIXME with correct type
  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      console.time("reordering cards");

      const activeCard = cards.find((card) => card.id === active.id);
      const overCard = cards.find((card) => card.id === over.id);

      if (activeCard!.state !== overCard!.state) {
        activeCard!.state = overCard!.state;
        setCards(cards);
      }

      setCards((cards) => {
        const oldIndex = cards.map((c) => c.id).indexOf(active.id);
        const newIndex = cards.map((c) => c.id).indexOf(over.id);

        return arrayMove(cards, oldIndex, newIndex);
      });
      console.timeEnd("reordering cards");
    }
  }

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
          <TextInput
            size="xs"
            placeholder="Suchen"
            icon={<IconSearch size="0.8rem" />}
          />

          <Menu shadow="md" width={200} closeOnItemClick={false}>
            <Menu.Target>
              <Button
                color="gray"
                variant="outline"
                size={"xs"}
                leftIcon={<IconFilter size={"1rem"} />}
              >
                Filter
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Filter</Menu.Label>
              <Menu.Item>
                <Checkbox size="xs" label="Author" />
              </Menu.Item>
              <Menu.Item>
                <Checkbox size="xs" label="Titel" />
              </Menu.Item>
              <Menu.Item>
                <Checkbox size="xs" label="Label" />
              </Menu.Item>
              <Menu.Item>
                <Checkbox size="xs" label="Mitglieder" />
              </Menu.Item>
              <Menu.Item>
                <Checkbox size="xs" label="Priorität" />
              </Menu.Item>
              <Menu.Item>
                <Checkbox size="xs" label="Datum" />
              </Menu.Item>
              <Menu.Item>
                <Checkbox size="xs" label="Erstellt" />
              </Menu.Item>
              <Menu.Item>
                <Checkbox size="xs" label="Verändert" />
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

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
      </Group>

      {!loading && view === "board" && (
        <ScrollArea>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Group>
              {states
                .sort((a, b) => a.position - b.position)
                .map((state: StatesResponse) => (
                  <div key={state.id}>
                    <Text>{state.title}</Text>
                    <Paper h={500} w={250}>
                      <Stack>
                        <SortableContext
                          items={cards}
                          strategy={verticalListSortingStrategy}
                        >
                          {cards
                            .filter((card) => card.state === state.id)
                            .sort((a, b) => a.position - b.position)
                            .map((card: CardsResponse) => (
                              <Card key={card.id} card={card} />
                            ))}
                        </SortableContext>
                      </Stack>
                    </Paper>
                  </div>
                ))}
            </Group>
          </DndContext>
        </ScrollArea>
      )}

      {!loading && view === "list" && (
        <ScrollArea>
          <Table>
            <thead>
              <tr>
                <th>
                  <Text>Author</Text>
                </th>
                <th>
                  <Text size="sm">Titel</Text>
                </th>
                <th>
                  <Text size="sm">Status</Text>
                </th>
                <th>
                  <Text size="sm">Label</Text>
                </th>
                <th>
                  <Text size="sm">Mitglieder</Text>
                </th>
                <th>
                  <Text size="sm">Priorität</Text>
                </th>
                <th>
                  <Text size="sm">Datum</Text>
                </th>
                <th>
                  <Text size="sm">Erstellt</Text>
                </th>
                <th>
                  <Text size="sm">Verändert</Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card: CardsResponse) => (
                <tr key={card.id}>
                  <td>
                    <Tooltip label={card.author} withArrow>
                      <Avatar radius="xl" />
                    </Tooltip>
                  </td>

                  <td>
                    <Link to={card.id}>
                      <Text size="sm">{card.title}</Text>
                    </Link>
                  </td>

                  <td>
                    {states && (
                      <Select
                        withinPortal
                        value={card.state}
                        data={states.map((state) => ({
                          value: state.id,
                          label: state.title,
                        }))}
                      />
                    )}
                  </td>

                  <td>
                    {card.labels.map((label) => (
                      <Badge variant="light">{label}</Badge>
                    ))}
                  </td>

                  <td>
                    <Tooltip.Group openDelay={300} closeDelay={100}>
                      <Avatar.Group spacing="sm">
                        {card.members.map((member) => (
                          <Tooltip label={member} withArrow>
                            <Avatar radius="xl" />
                          </Tooltip>
                        ))}
                      </Avatar.Group>
                    </Tooltip.Group>
                  </td>

                  <td>
                    <Select
                      withinPortal
                      value={card.priority}
                      data={Object.keys(CardsPriorityOptions).map(
                        (priority) => ({
                          value: priority,
                          label: priority,
                        })
                      )}
                    />
                  </td>

                  <td>
                    {card.date && (
                      <Text size="sm">
                        {new Date(card.date).toLocaleDateString("DE-de")}
                      </Text>
                    )}
                  </td>

                  <td>
                    <Text size="sm">
                      {new Date(card.created).toLocaleDateString("DE-de")}
                    </Text>
                  </td>

                  <td>
                    <Text size="sm">
                      {new Date(card.updated).toLocaleDateString("DE-de")}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      )}
    </>
  );
}
