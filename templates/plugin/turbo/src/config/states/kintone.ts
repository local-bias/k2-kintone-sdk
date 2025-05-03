import { GUEST_SPACE_ID, isDev } from '@/lib/global';
import { getFormFields, kintoneAPI } from '@konomi-app/kintone-utilities';
import { appFormFieldsAtom, currentAppIdAtom } from '@repo/jotai';
import { atom } from 'jotai';

export const currentAppFieldsAtom = atom((get) => {
  const app = get(currentAppIdAtom);
  return get(
    appFormFieldsAtom({
      appId: app,
      spaceId: GUEST_SPACE_ID,
      preview: true,
    })
  );
});

export const appFieldsAtom = atom<Promise<kintoneAPI.FieldProperty[]>>(async (get) => {
  const app = get(currentAppIdAtom);
  const { properties } = await getFormFields({
    app,
    preview: true,
    guestSpaceId: GUEST_SPACE_ID,
    debug: isDev,
  });

  const values = Object.values(properties);
  return values.sort((a, b) => a.label.localeCompare(b.label, 'ja'));
});
