/* 
  🍳 k2 plugin 
    このファイルはビルドの起点になります。ファイル名やディレクトリを変更すると、ビルドが正しく動作しない可能性があります。
*/

const rootElement = document.getElementById('plugin-content');
if (!rootElement) {
  const message =
    'JavaScriptを適用するためのHTML要素が見つかりませんでした。src/contents/config.htmlを確認してください。';
  alert(message);
  throw new Error(message);
}
const element = document.createElement('div');
element.textContent = 'このテキストはJavaScriptによって追加されました。';
rootElement.append(element);
