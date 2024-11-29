/* 
  🍳 k2 plugin 
    このファイルはビルドの起点になります。ファイル名やディレクトリを変更すると、ビルドが正しく動作しない可能性があります。
*/

const rootElement = document.getElementById('plugin-content');
if (!rootElement) {
  alert('JavaScriptを適用するためのHTML要素が見つかりませんでした。');
  return;
}
const element = document.createElement('div');
element.textContent = 'このテキストはJavaScriptによって追加されました。';
rootElement.append(element);
