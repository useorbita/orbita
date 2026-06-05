import { notifications } from "@mantine/notifications";

export function showNotImplemented() {
  notifications.show({
    title: "Noch nicht implementiert",
    message: "Das ist leider noch nicht implementiert :(",
    withBorder: true,
    color: "gray",
  });
}
