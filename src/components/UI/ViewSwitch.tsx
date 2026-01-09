import { Center, SegmentedControl } from "@mantine/core";
import { IconCode, IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { useActiveBoardStore } from "../../stores/activeBoardStore";

export function ViewSwitch() {
  const view = useActiveBoardStore((state) => state.view);
  const setView = useActiveBoardStore((state) => state.setView);

  return (
    <SegmentedControl
      data={[
        {
          value: "table",
          label: (
            <Center>
              <IconLayoutList size="1em" />
            </Center>
          ),
        },
        {
          value: "list",
          label: (
            <Center>
              <IconLayoutGrid size="1em" />
            </Center>
          ),
        },
        {
          value: "code",
          label: (
            <Center>
              <IconCode size="1em" />
            </Center>
          ),
        },
      ]}
      value={view}
      onChange={setView}
    />
  );
}
