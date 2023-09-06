import { ActionIcon, NavLink, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconCircleDotted, IconDots } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { BoardsResponse } from "../../api/types";

export function BoardLink({ board }: { board: BoardsResponse }) {
  const navigate = useNavigate();
  const { hovered, ref } = useHover();

  return (
    <div ref={ref}>
      <NavLink
        key={board.id}
        label={board.title}
        leftSection={<IconCircleDotted size="1em" stroke={1.5} />}
        onClick={() => navigate(board.id)}
        rightSection={
          <Tooltip
            label="Einstellungen"
            position="right"
            openDelay={500}
            withArrow
          >
            <ActionIcon
              style={{ visibility: hovered ? "visible" : "hidden" }}
              variant="subtle"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                navigate("settings/" + board.id);
              }}
            >
              <IconDots size="1em" />
            </ActionIcon>
          </Tooltip>
        }
      />
    </div>
  );
}
