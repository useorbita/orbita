import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Center h="100%">
      <Container ta="center">
        <Stack gap="md" align="center">
          <Title style={{ fontFamily: "Outfit", fontWeight: 400 }}>
            Nicht gefunden
          </Title>
          <Text c="dimmed" mb="md">
            Was du suchst, gibt es hier leider nicht.
            <br />
            Der Link ist vermutlich falsch oder unvollständig.
          </Text>
          <Button variant="default" onClick={() => navigate("/")}>
            Zurück zum Dashboard
          </Button>
        </Stack>
      </Container>
    </Center>
  );
}
