import { ScrollArea, Space, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export function Search() {
  return (
    <ScrollArea p={"xl"}>
      <Title style={{ fontFamily: "IBM Plex Serif", fontWeight: 400 }}>
        Suche
      </Title>
      <Space h={"md"} />
      <TextInput
        autoFocus
        leftSectionPointerEvents="none"
        leftSection={<IconSearch size={"1em"} />}
      />
    </ScrollArea>
  );
}
