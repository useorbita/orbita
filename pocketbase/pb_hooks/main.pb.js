/// <reference path="../pb_data/types.d.ts" />

/**
 * this function us run on start and may be used for 
 * some cleanup or setting up things on start
 */
onBootstrap((e) => {
  console.log("PocketBase was initialized!");
  e.next()
});


/**
 * this function will be used to cleanup certain things
 */
cronAdd("hello", "*/1 * * * *", () => {
  console.log("clean up or manage user presence")
})