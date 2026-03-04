import { Center, SegmentedControl } from "@mantine/core";
import { IconLayout, IconLayoutList } from "@tabler/icons-react";

export function ViewSwitch({ view, onChange }: { view: string; onChange: (value: string) => void }) {
  return (
    <SegmentedControl
      data={[
        {
          value: "list",
          label: (
            <Center>
              <IconLayout size="1em" />
            </Center>
          ),
        },
        {
          value: "table",
          label: (
            <Center>
              <IconLayoutList size="1em" />
            </Center>
          ),
        },
      ]}
      value={view}
      onChange={onChange}
    />
  );
}
