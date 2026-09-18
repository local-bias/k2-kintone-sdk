/**
 * 連続した呼び出しをまとめ、最後の呼び出しから `waitMs` 経過後に一度だけ実行します
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => unknown,
  waitMs: number
): (...args: Args) => void {
  let timer: NodeJS.Timeout | undefined;

  return (...args: Args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      void fn(...args);
    }, waitMs);
  };
}
