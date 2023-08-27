import PocketBase from "pocketbase";

export const pb = new PocketBase("http://127.0.0.1:8090");

if (import.meta.env.DEV) pb.autoCancellation(false);

export const createBoard = async ({ title, member }) => {
  const data = {
    title: title,
    members: [member],
  };

  await pb.collection("boards").create(data);
};
