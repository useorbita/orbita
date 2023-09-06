import { ActionIcon, Group, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

export function BoardSettings() {
  const navigate = useNavigate();
  const { boardId } = useParams();

  return (
    <>
      <Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => {
            navigate("/" + boardId);
          }}
        >
          <IconArrowLeft size="1em" />
        </ActionIcon>
        <Text>{boardId}</Text>
      </Group>

      <ul>
        <li>Name</li>
        <li>Mitglieder</li>
        <li>Board löschen</li>
        <li>Labels (Titel, Farbe)</li>
        <li>States (Titel)</li>
      </ul>
    </>
  );
}
