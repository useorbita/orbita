/// <reference path="../pb_data/types.d.ts" />

/**
 * this function will be used to get the current card count
 * and generate a card number e.g. PB-23, also track the event
 */
onRecordBeforeCreateRequest((e) => {
  const userId = e.httpContext.get("authRecord").id;
  const boardId = e.record.get("board");

  // set a card number based on card count
  const board = $app.dao().findRecordById("boards", boardId);
  const counter = board.get("cardCount") + 1;
  e.record.set("number", counter);
}, "cards");

/**
 * this function will be used to update the card counter for
 * the board and track the creation event
 */
onRecordAfterCreateRequest((e) => {
  const userId = e.httpContext.get("authRecord").id;
  const boardId = e.record.get("board");

  // update the card counter on the board
  const board = $app.dao().findRecordById("boards", boardId);
  const counter = board.get("cardCount") + 1;
  board.set("cardCount", counter);
  $app.dao().saveRecord(board);

  // track the creation event in events table
  const events = $app.dao().findCollectionByNameOrId("events");
  const event = new Record(events, {
    card: e.record.get("id"),
    user: userId,
    action: "CREATE",
  });
  $app.dao().saveRecord(event);
}, "cards");

/**
 * this function will be used for tracking change events and
 * notifications
 */
onRecordAfterUpdateRequest((e) => {
  const userId = e.httpContext.get("authRecord").id;

  // track the update event in events table
  const events = $app.dao().findCollectionByNameOrId("events");
  const event = new Record(events, {
    card: e.record.get("id"),
    user: userId,
    action: "UPDATE",
  });
  $app.dao().saveRecord(event);
}, "cards");
