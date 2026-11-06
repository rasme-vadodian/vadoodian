import { supabase } from '../api/supabase';

/**
 * اعلان زنده سبک.
 *
 * دادهٔ حساس از این کانال عبور نمی‌کند؛ فقط یک پیام «چیزی عوض شد» پخش
 * می‌شود و هر نقش دادهٔ خودش را با RPC امن دوباره می‌خواند. مزیت این کار
 * این است که ویتر بدون Supabase Auth هم می‌تواند فوراً باخبر شود.
 */

const CHANNEL_NAME = 'vadoodian:board';

export function subscribeToBoard(onChange: () => void): () => void {
  const channel = supabase
    .channel(CHANNEL_NAME)
    .on('broadcast', { event: 'changed' }, () => onChange())
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function notifyBoard(): void {
  const channel = supabase.channel(CHANNEL_NAME);
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      void channel.send({
        type: 'broadcast',
        event: 'changed',
        payload: { at: Date.now() },
      });
      window.setTimeout(() => {
        void supabase.removeChannel(channel);
      }, 800);
    }
  });
}
