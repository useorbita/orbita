import { Button, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Card } from "./Card";

export function Board() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Titel" size={"lg"}>
        <Card />
      </Modal>

      <Text>Kanban Board</Text>
      <Text>Filter</Text>
      <Button variant="default" onClick={open}>
        Karte öffnen
      </Button>
    </>
  );
}
