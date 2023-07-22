import PocketBase from "pocketbase";

export const pb = new PocketBase("http://127.0.0.1:8090");

// TODO: remove this and replace with proper auth
await pb.admins.authWithPassword(
  import.meta.env.VITE_PB_USERNAME,
  import.meta.env.VITE_PB_PASSWORD
);
