import PocketBase from "npm:pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

const boardName = "TestiDummy";
const states = ["Backlog", "Next", "In Progress", "Waiting", "Done", "Closed"];

await pb
  .collection("users")
  .authWithPassword("testuser@orbita.com", "testpassword");

const board = await pb.collection("boards").create({
  title: boardName,
  members: [pb.authStore.model?.id],
});

for (const state of states) {
  console.log("add state", state);

  const stateRecord = await pb.collection("states").create({
    title: state,
    board: board.id,
    position: 123,
  });

  for (let index = 0; index < 10; index++) {
    const data = {
      title: "Lorem Ipsum",
      description:
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
      //   members: ["RELATION_RECORD_ID"],
      //   labels: ["RELATION_RECORD_ID"],
      state: stateRecord.id,
      date: "2022-01-01 10:00:00.123Z",

      priority: "medium",
      author: pb.authStore.model?.id,
      board: board.id,
      position: index * 10,
    };

    const record = await pb.collection("cards").create(data);
    console.log("added card", record.id);
  }
}
