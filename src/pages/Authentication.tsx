import {
  Box,
  Button,
  Center,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title
} from "@mantine/core";
import { useUserStore } from "../stores/userStore";

export function Authentication() {
  const isLoading = useUserStore((state) => state.isLoading);
  const login = useUserStore((state) => state.login);

  return (
    <Group style={{ height: "100vh" }}>

      <Box style={{ backgroundColor: "#030303", height: "100vh", width: "33%" }} p={"3em"}>
        {/* TODO: add something cool */}
      </Box>

      <Box style={{ width: "65%" }}>
        <Center>
          <Box w={"23em"}>
            <Stack>
              <Title order={3} mb={"md"}>Anmelden</Title>

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
        </Center>
      </Box>
    </Group>
  );
}
