import {
  Avatar,
  Badge,
  ScrollArea,
  Select,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  CardsPriorityOptions,
  CardsResponse,
  StatesResponse,
} from "../../api/types";

interface ListViewProps {
  states: StatesResponse[];
  cards: CardsResponse[];
}

export function ListView({ cards, states }: ListViewProps) {
  return (
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
                  data={Object.keys(CardsPriorityOptions).map((priority) => ({
                    value: priority,
                    label: priority,
                  }))}
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
  );
}
