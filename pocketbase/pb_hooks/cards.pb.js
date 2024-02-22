/// <reference path="../pb_data/types.d.ts" />

// ========== creation of a card ==========

/**
 * this function will be used to get the current card count
 * and generate a card number e.g. PB-23, also track the event
 */
onRecordBeforeCreateRequest((e) => {
  console.log("user id:", e.httpContext.get("authRecord").id);
  console.log("card will be created.");
}, "cards");

/**
 * this function will be used to update the card counter for
 * the board and track the creation event
 */
onRecordAfterCreateRequest((e) => {
  console.log("user id:", e.httpContext.get("authRecord").id);
  const newCard = e.record;
  console.log("card was created:", newCard.id);
}, "cards");

// ========== update of a card ==========

/**
 * this function will be used for tracking change events and
 * notifications
 */
onRecordAfterUpdateRequest((e) => {
  console.log("user id:", e.httpContext.get("authRecord").id);
  const updatedCard = e.record;
  console.log("card was updated:", updatedCard.id);
}, "cards");
