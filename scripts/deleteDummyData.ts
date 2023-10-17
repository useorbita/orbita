import PocketBase from "npm:pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

const boardName = "TestiDummy";

await pb
  .collection("users")
  .authWithPassword("testuser@orbita.com", "testpassword");

const boards = await pb.collection("boards").getFullList();
const lists = await pb.collection("lists").getFullList();
const cards = await pb.collection("cards").getFullList();

const board = boards.find((board) => board.title === boardName);

for (const card of cards) {
  if (card.board === board.id) {
    console.log("delete card", card.id);
    await pb.collection("cards").delete(card.id);
  }
}

for (const state of lists) {
  if (state.board === board.id) {
    console.log("delete state", state.id);
    await pb.collection("lists").delete(state.id);
  }
}

console.log("delete board", board.id);
await pb.collection("boards").delete(board.id);
