import PocketBase from "npm:pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

const boardName = "TestiDummy";

await pb
  .collection("users")
  .authWithPassword("testuser@mello.com", "testpassword");

const boards = await pb.collection("boards").getFullList();
const states = await pb.collection("states").getFullList();
const cards = await pb.collection("cards").getFullList();

const board = boards.find((board) => board.title === boardName);

for (const card of cards) {
  if (card.board === board.id) {
    console.log("delete card", card.id);
    await pb.collection("cards").delete(card.id);
  }
}

for (const state of states) {
  if (state.board === board.id) {
    console.log("delete state", state.id);
    await pb.collection("states").delete(state.id);
  }
}

console.log("delete board", board.id);
await pb.collection("boards").delete(board.id);
