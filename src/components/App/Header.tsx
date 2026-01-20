import { Button, Group, Title } from "@mantine/core";
import { IconCircle, IconLoader, IconSettings } from "@tabler/icons-react";

import { useIsFetching } from "@tanstack/react-query";
import { useMatch, useNavigate } from "react-router-dom";

import { useBoard } from "../../api/boards";

import { FilterMenu } from "../UI/FilterMenu";
import { ViewSwitch } from "../UI/ViewSwitch";

export function Header() {
  const isFetching = useIsFetching();
  const navigate = useNavigate();

  // This is a workaround to get the boardId from the URL
  // because useParams is not working in the header
  const match = useMatch("/:boardId/*");
  const boardId = match?.params.boardId;
  const isActualBoard = boardId && boardId !== "settings";
  const board = useBoard(isActualBoard ? boardId : undefined);

  return (
    <Group justify="space-between">
      <Group>
        {isFetching ? (
          <IconLoader
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <IconCircle
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        )}

        <Title order={4}>
          {isActualBoard ? board?.data?.title : "Einstellungen"}
        </Title>
      </Group>

      <Group gap={"xs"}>
        {isActualBoard && (
          <>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              leftSection={<IconSettings size="1.2em" />}
              onClick={() => {
                navigate(`${boardId}/settings/`);
              }}
            >
              Einstellungen
            </Button>

            <FilterMenu />
            <ViewSwitch />
          </>
        )}

        {/* <Search /> */}
      </Group>
    </Group>
  );
}
