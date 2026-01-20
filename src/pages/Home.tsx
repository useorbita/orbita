import { ScrollArea, Title } from "@mantine/core";
import { pb } from "../api/pocketbase";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Guten Morgen";
  if (hour >= 12 && hour < 18) return "Guten Tag";
  if (hour >= 18 && hour < 22) return "Guten Abend";
  return "Gute Nacht";
}

export function Home() {
  return (
    <ScrollArea>
      <Title order={2}>
        {getGreeting()}, {pb.authStore.record?.name}
      </Title>
    </ScrollArea>
  );
}
