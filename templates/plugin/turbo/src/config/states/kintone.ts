import { GUEST_SPACE_ID } from '@/lib/global';
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
