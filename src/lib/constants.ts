import path from 'path';

export const WORKSPACE_DIRECTORY = '.k2';
export const DEVELOPMENT_DIRECTORY = path.join(WORKSPACE_DIRECTORY, 'dev');

/** kintoneプラグインの一時ファイルを管理するフォルダ */
export const PLUGIN_WORKSPACE_DIRECTORY = '.plugin';
/** kintoneプラグインのcontents.zipに格納するファイルを管理するフォルダ */
export const PLUGIN_CONTENTS_DIRECTORY = path.join(PLUGIN_WORKSPACE_DIRECTORY, 'contents');
/** kintoneプラグインの開発時、ローカルサーバーに反映するファイルを管理するフォルダ */
export const PLUGIN_DEVELOPMENT_DIRECTORY = path.join(PLUGIN_WORKSPACE_DIRECTORY, 'dev');

/** ローカルサーバーのデフォルトポート番号 */
export const DEFAULT_PORT = 32767;
