import { Button, Checkbox, Menu } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";

export function FilterMenu() {
  return (
    <Menu shadow="md" width={200} closeOnItemClick={false}>
      <Menu.Target>
        <Button
          variant="default"
          size={"xs"}
          leftSection={<IconFilter size={"1em"} />}
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
  );
}
