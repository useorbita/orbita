import { useState } from "react";

import {
  Anchor,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { useSignIn, useSignUp } from "../api/auth";

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState(import.meta.env.VITE_PB_USERNAME);
  const [password, setPassword] = useState(import.meta.env.VITE_PB_PASSWORD);

  const signIn = useSignIn();

  const handleSubmit = () => {
    signIn.mutate({ email, password });
  };

  return (
    <Stack gap="md">
      <Title
        ta="center"
        style={{ fontFamily: "Outfit", fontWeight: 400 }}
        mb="xl"
      >
        Orbita
      </Title>
      <TextInput
        label="Email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
      />
      <Button
        variant="default"
        loading={signIn.isPending}
        onClick={handleSubmit}
        mt="lg"
      >
        Anmelden
      </Button>
      <Text ta="center" size="sm">
        Du hast keinen Account? <Anchor onClick={onSwitch}>Registrieren</Anchor>
      </Text>
    </Stack>
  );
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signUp = useSignUp();

  const handleSubmit = () => {
    signUp.mutate({ email, password, name });
  };

  return (
    <Stack gap="md">
      <Title
        ta="center"
        style={{ fontFamily: "Outfit", fontWeight: 400 }}
        mb="xl"
      >
        Orbita
      </Title>
      <TextInput
        label="Dein Name"
        placeholder="Name"
        description="Diesen Name sehen deine Teammitglieder"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <TextInput
        label="Email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
      />
      <Button
        variant="default"
        loading={signUp.isPending}
        onClick={handleSubmit}
        mt="lg"
      >
        Registrieren
      </Button>
      <Text ta="center" size="sm">
        Du hast bereits einen Account?{" "}
        <Anchor onClick={onSwitch}>Anmelden</Anchor>
      </Text>
    </Stack>
  );
}

export function Authentication() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <Center h="100vh" pos="relative">
      <Paper radius="md" p="xl" w="23em">
        {mode === "signin" ? (
          <SignInForm onSwitch={() => setMode("signup")} />
        ) : (
          <SignUpForm onSwitch={() => setMode("signin")} />
        )}
      </Paper>
      <Text pos="absolute" bottom={16} right={16} size="sm" c="dimmed">
        Orbita
      </Text>
    </Center>
  );
}
