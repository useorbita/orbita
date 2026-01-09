import { ScrollArea } from "@mantine/core";

export function CodeView(props: any) {
  return (
    <ScrollArea>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </ScrollArea>
  );
}
