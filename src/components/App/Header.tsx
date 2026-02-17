import { Group, Title } from "@mantine/core";

import { useMatch } from "react-router-dom";
import { useBoard } from "../../api/boards";

import { FilterMenu } from "../UI/FilterMenu";
import { ViewSwitch } from "../UI/ViewSwitch";

export function Header() {
  // This is a workaround to get the boardId from the URL
  // because useParams is not working in the header
  const match = useMatch("/:boardId/*");
  const boardId = match?.params.boardId;
  const isActualBoard = boardId && boardId !== "settings";
  const board = useBoard(isActualBoard ? boardId : undefined);

  return (
    <Group justify="space-between">
      <Title order={4}>{isActualBoard && board?.data?.title}</Title>

      <Group gap={"xs"}>
        {isActualBoard && (
          <>
            <FilterMenu />
            <ViewSwitch />
          </>
        )}

        {/* <Search /> */}
      </Group>
    </Group>
  );
}
