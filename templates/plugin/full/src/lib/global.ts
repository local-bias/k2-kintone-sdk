import { detectGuestSpaceId } from '@konomi-app/kintone-utilities';

// ビルド時に文字列へ置換されるため、オプショナルチェイニングを使用しないでください
export const ENV = process.env.NODE_ENV;
export const isProd = ENV === 'production';
export const isDev = ENV === 'development';

export const PLUGIN_ID = kintone.$PLUGIN_ID;
export const GUEST_SPACE_ID = detectGuestSpaceId() ?? undefined;
export const LANGUAGE = kintone.getLoginUser()?.language;

if (!isProd) {
  console.log('[plugin] Global variables have been redefined', {
    PLUGIN_ID,
    GUEST_SPACE_ID,
    LANGUAGE,
  });
}
