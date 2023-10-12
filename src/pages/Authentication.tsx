import {
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  Space,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useUserStore } from "../stores/userStore";

export function Authentication() {
  const isLoading = useUserStore((state) => state.isLoading);
  const login = useUserStore((state) => state.login);

  return (
    <Container pt={"10em"}>
      <Center maw={900} h="70%" mx="auto">
        <Paper withBorder shadow="xl" p="xl" w={"20em"}>
          <Stack>
            <Title>orbita</Title>
            <TextInput
              placeholder="Email"
              label="Email"
              value={import.meta.env.VITE_PB_USERNAME}
              readOnly
            ></TextInput>
            <PasswordInput
              placeholder="Password"
              label="Password"
              value={import.meta.env.VITE_PB_PASSWORD}
              readOnly
            />
            <Space h="xs" />
            <Button
              variant="default"
              loading={isLoading}
              onClick={async () => {
                login({
                  email: import.meta.env.VITE_PB_USERNAME,
                  password: import.meta.env.VITE_PB_PASSWORD,
                });
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
