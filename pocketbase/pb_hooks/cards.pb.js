/// <reference path="../pb_data/types.d.ts" />

/**
 * this function will be used to get the current card count
 * and generate a card number e.g. PB-23, also track the event
 */
onRecordCreateRequest((e) => {
  const boardId = e.record.get("board");
  const board = $app.findRecordById("boards", boardId);
  const project = $app.findRecordById("projects", board.get("project"));

  // increment the project-level ticket counter and use it as the card number
  const counter = project.get("ticket_counter") + 1;
  project.set("ticket_counter", counter);
  $app.save(project);

  e.record.set("number", counter);

  e.next();

  // track the creation event in events table
  const eventsCollection = $app.findCollectionByNameOrId("card_events");
  const event = new Record(eventsCollection, {
    card: e.record.get("id"),
    user: e.auth?.id,
    action: "CREATE",
  });
  $app.save(event);
}, "cards");

/**
 * this function will be used for tracking change events and
 * notifications
 */
onRecordUpdateRequest((e) => {
  const userId = e.auth?.id;

  // track the update event in events table
  const eventsCollection = $app.findCollectionByNameOrId("card_events");
  const event = new Record(eventsCollection, {
    card: e.record.get("id"),
    user: userId,
    action: "UPDATE",
  });
  $app.save(event);

  e.next();
}, "cards");
