/* 
  🍳 k2 plugin 
    このファイルはビルドの起点になります。ファイル名やディレクトリを変更すると、ビルドが正しく動作しない可能性があります。
*/

(() => {
  kintone.events.on('app.record.index.show', (event) => {
    console.log('k2 plugin', event);
    return event;
  });
})();
