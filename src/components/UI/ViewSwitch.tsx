import { Center, SegmentedControl } from "@mantine/core";
import { IconCode, IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";

export function ViewSwitch() {
  const view = "table"; // Default view - TODO: implement view switching

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
      onChange={() => {}} // Disabled for now
    />
  );
}
