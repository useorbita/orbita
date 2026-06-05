import { Grid, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

const descriptionSpan = 4;
const inputSpan = 6;
const offset = 1;

interface SettingsRowProps {
  label: string;
  description: string;
  children: ReactNode;
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <Grid align="flex-start">
      <Grid.Col span={descriptionSpan}>
        <Stack gap="xs">
          <Text>{label}</Text>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={inputSpan} offset={offset}>
        {children}
      </Grid.Col>
    </Grid>
  );
}
