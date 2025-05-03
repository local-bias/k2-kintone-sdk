import { t } from '@/lib/i18n';
import { createRoot } from 'react-dom/client';
import invariant from 'tiny-invariant';
import App from './app';

const root = document.getElementById('settings');
invariant(root, t('common.config.error.rootNotFound'));
createRoot(root).render(<App />);
