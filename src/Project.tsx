import { Tabs, rem } from "@mantine/core";
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
} from "@tabler/icons-react";
import { Board } from "./Board";

export function Project() {
  const iconStyle = { width: rem(12), height: rem(12) };
  return (
    <Tabs variant="pills" color="gray" defaultValue="board">
      <Tabs.List pb={"sm"} justify="flex-end">
        <Tabs.Tab value="board" leftSection={<IconPhoto style={iconStyle} />}>
          Board
        </Tabs.Tab>
        <Tabs.Tab
          value="list"
          leftSection={<IconMessageCircle style={iconStyle} />}
        >
          Liste
        </Tabs.Tab>
        <Tabs.Tab
          value="calendar"
          leftSection={<IconSettings style={iconStyle} />}
        >
          Kalendar
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="board">
        <Board />
      </Tabs.Panel>

      <Tabs.Panel value="list">Übersicht als Liste</Tabs.Panel>

      <Tabs.Panel value="calendar">Kalenderansicht</Tabs.Panel>
    </Tabs>
  );
}
