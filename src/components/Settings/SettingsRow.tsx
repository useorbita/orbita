import { Grid, Group, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

const descriptionSpan = 4;
const inputSpan = 8;
const offset = 0;

interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

export function SettingsRow({
  label,
  description,
  children,
}: SettingsRowProps) {
  return (
    <Grid align="center">
      <Grid.Col span={descriptionSpan}>
        <Stack gap="xs">
          <Text>{label}</Text>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
      </Grid.Col>
      <Grid.Col span={inputSpan} offset={offset}>
        <Group justify="flex-end">{children}</Group>
      </Grid.Col>
    </Grid>
  );
}
