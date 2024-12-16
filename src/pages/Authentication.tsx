import {
  Box,
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useUserStore } from "../stores/userStore";

export function Authentication() {
  const isLoading = useUserStore((state) => state.isLoading);
  const login = useUserStore((state) => state.login);

  return (
    <Container h={"100vh"} fluid>
      <Title pt="xl" pl="xl" style={{ fontFamily: "Outfit", fontWeight: 400 }}>
        Orbita
      </Title>
      <Center>
        <Paper radius="md" p="xl" mt={"20vh"}>
          <Box w={"23em"}>
            <Stack>
              <TextInput
                placeholder="Email"
                label="Email"
                value={import.meta.env.VITE_PB_USERNAME}
                readOnly
              >
              </TextInput>
              <PasswordInput
                placeholder="Password"
                label="Password"
                value={import.meta.env.VITE_PB_PASSWORD}
                readOnly
              />

              <Button
                mt={"xl"}
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
          </Box>
        </Paper>
      </Center>
    </Container>
  );
}
