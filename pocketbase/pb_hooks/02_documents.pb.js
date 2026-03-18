/// <reference path="../pb_data/types.d.ts" />

/**
 * this function will be used to track the creation event
 */
onRecordCreateRequest((e) => {
  e.next();

  const userId = e.auth?.id;
  const documentId = e.record.get("id");

  // track the creation event in events table
  const eventsCollection = $app.findCollectionByNameOrId("document_events");
  const event = new Record(eventsCollection, {
    document: documentId,
    user: userId,
    action: "CREATE",
  });
  $app.save(event);
}, "documents");

/**
 * this function will be used for tracking change events and
 * notifications
 */
onRecordUpdateRequest((e) => {
  const userId = e.auth?.id;

  // track the update event in events table
  const eventsCollection = $app.findCollectionByNameOrId("document_events");
  const event = new Record(eventsCollection, {
    document: e.record.get("id"),
    user: userId,
    action: "UPDATE",
  });
  $app.save(event);

  e.next();
}, "documents");
