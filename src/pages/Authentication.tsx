import {
  Container,
  Center,
  Paper,
  Stack,
  Title,
  TextInput,
  PasswordInput,
  Space,
  Button,
} from "@mantine/core";
import { pb } from "../api/pocketbase";

export function Authentication() {
  return (
    <Container pt={"10em"}>
      <Center maw={900} h="70%" mx="auto">
        <Paper withBorder shadow="xl" p="xl" w={"20em"}>
          <Stack>
            <Title>Mello</Title>
            <TextInput placeholder="Email" label="Email"></TextInput>
            <PasswordInput placeholder="Password" label="Password" />
            <Space h="xs" />
            <Button
              variant="default"
              onClick={async () => {
                const result = await pb
                  .collection("users")
                  .authWithPassword(
                    import.meta.env.VITE_PB_USERNAME,
                    import.meta.env.VITE_PB_PASSWORD
                  );
                console.log(result);
              }}
            >
              Anmelden
            </Button>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
