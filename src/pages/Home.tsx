import { ScrollArea, Space, Text, Title } from "@mantine/core";
import { pb } from "../api/pocketbase";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Guten Morgen, ${name}`;
  if (hour >= 12 && hour < 18) return `Guten Nachmittag, ${name}`;
  if (hour >= 18 && hour < 22) return `Guten Abend, ${name}`;
  return `Noch wach, ${name}?`;
}

export function Home() {
  return (
    <ScrollArea p={"xl"}>
      <Title style={{ fontFamily: "IBM Plex Serif", fontWeight: 400 }}>
        {getGreeting(pb.authStore.record?.name)}
      </Title>
      <Space h={"md"} />
      <Text>„Richte Deine Aufmerksamkeit auf das, was vor Dir liegt.“</Text>
      <Text fs="italic">Marcus Aurelius</Text>
    </ScrollArea>
  );
}
