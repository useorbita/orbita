import { Center, SegmentedControl } from "@mantine/core";
import { IconCode, IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";

interface ViewStateProps {
  view: string;
  setView: (view: string) => void;
}

export function ViewSwitch({ view, setView }: ViewStateProps) {
  return (
    <SegmentedControl
      data={[
        {
          value: "list",
          label: (
            <Center>
              <IconLayoutList size="1em" />
            </Center>
          ),
        },
        {
          value: "column",
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
