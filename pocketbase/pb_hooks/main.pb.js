/// <reference path="../pb_data/types.d.ts" />

/**
 * this function us run on start and may be used for 
 * some cleanup or setting up things on start
 */
onAfterBootstrap(() => {
  console.log("PocketBase was initialized!");
});


/**
 * this function will be used to cleanup certain things
 */
cronAdd("hello", "*/1 * * * *", () => {
  console.log("clean up or manage user presence")
})