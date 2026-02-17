import { ScrollArea, Title } from "@mantine/core";
import { pb } from "../api/pocketbase";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Guten Morgen,";
  if (hour >= 12 && hour < 18) return "Guten Nachmittag,";
  if (hour >= 18 && hour < 22) return "Guten Abend,";
  return "Noch wach?";
}

export function Home() {
  return (
    <ScrollArea>
      <Title style={{ fontFamily: "IBM Plex Serif", fontWeight: 400 }}>
        {getGreeting()} {pb.authStore.record?.name}
      </Title>
    </ScrollArea>
  );
}
