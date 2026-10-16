import { afterEach, describe, expect, it, vi } from 'vitest';
import { remoteAndroidVersion } from '../src/native/android';

afterEach(() => vi.unstubAllGlobals());
describe('manifest aggiornamenti Android', () => {
  it('legge la versione numerica senza usare cache', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({version:'1.0.10',versionCode:10,apkUrl:'https://nutritrack-pro-zeta.vercel.app/nutritrack.apk?v=10',notes:'Aggiornamento'}) });
    vi.stubGlobal('fetch', fetcher);
    expect((await remoteAndroidVersion()).versionCode).toBe(10);
    expect(fetcher).toHaveBeenCalledWith(expect.stringMatching(/^\/version.json\?t=/), {cache:'no-store'});
  });
  it('rifiuta APK da un dominio esterno o da HTTP', async () => {
    for (const apkUrl of ['https://example.com/app.apk','http://nutritrack-pro-zeta.vercel.app/nutritrack.apk']) {
      vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({versionCode:2,apkUrl})}));
      await expect(remoteAndroidVersion()).rejects.toThrow('non valida');
    }
  });
});
