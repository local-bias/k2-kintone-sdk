/* 
  🍳 k2 plugin template

    This file is the starting point for the build. If you change the file name or directory, the build may not work properly.
    If you want to add processing, create a file in the same directory as this file and import it from this file.
*/

(() => {
  kintone.events.on('app.record.index.show', (event) => {
    console.log('k2 plugin', event);
    return event;
  });
})();
