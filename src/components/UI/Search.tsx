import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export function Search() {
  return (
    <TextInput
      size="xs"
      placeholder="Suchen"
      leftSection={<IconSearch size="0.8em" />}
    />
  );
}
