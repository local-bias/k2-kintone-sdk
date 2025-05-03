import { PluginErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import {
  Notification,
  PluginBanner,
  PluginConfigProvider,
  PluginContent,
  PluginLayout,
} from '@konomi-app/kintone-utilities-react';
import { LoaderWithLabel } from '@konomi-app/ui-react';
import { URL_BANNER, URL_PROMOTION } from '@repo/constants';
import { store } from '@repo/jotai';
import { Provider } from 'jotai';
import { SnackbarProvider } from 'notistack';
import config from 'plugin.config.mjs';
import { Suspense } from 'react';
import Footer from './components/model/footer';
import Form from './components/model/form';
import Sidebar from './components/model/sidebar';

export default function App() {
  return (
    <Suspense fallback={<LoaderWithLabel label='画面の描画を待機しています' />}>
      <Provider store={store}>
        <ThemeProvider>
          <PluginErrorBoundary>
            <PluginConfigProvider config={config}>
              <Notification />
              <SnackbarProvider maxSnack={1}>
                <Suspense fallback={<LoaderWithLabel label='設定情報を取得しています' />}>
                  <PluginLayout>
                    <Sidebar />
                    <PluginContent>
                      <PluginErrorBoundary>
                        <Form />
                      </PluginErrorBoundary>
                    </PluginContent>
                    <PluginBanner url={URL_BANNER} />
                    <Footer />
                  </PluginLayout>
                </Suspense>
              </SnackbarProvider>
            </PluginConfigProvider>
          </PluginErrorBoundary>
        </ThemeProvider>
      </Provider>
      <iframe
        title='promotion'
        loading='lazy'
        src={URL_PROMOTION}
        className='border-0 w-full h-16'
      />
    </Suspense>
  );
}
