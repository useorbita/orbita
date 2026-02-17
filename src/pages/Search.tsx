import { ScrollArea, Space, Text, TextInput, Title } from "@mantine/core";
import { pb } from "../api/pocketbase";
import { IconSearch } from "@tabler/icons-react";
import { useFocusTrap } from "@mantine/hooks";

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
        leftSection={<IconSearch size={"1em"}/>}
      />
    </ScrollArea>
  );
}
