import { useEffect, useState } from 'react';

// Import every API module you created
import { ArticlesApi } from '@/api/ArticlesController';
import { ContactInfoApi } from '@/api/ContactInfoController';
import { ContactMessagesApi } from '@/api/ContactMessagesController';
import { EbooksApi } from '@/api/EbooksController';
import { ImagesApi } from '@/api/ImagesController';
import { MainPagesApi } from '@/api/MainPagesController';
import { ProvidedServicesApi } from '@/api/ProvidedServicesController';
import { RecipesApi } from '@/api/RecipesController';
import { ResumesApi } from '@/api/ResumeController';
import { SocialMediaLinksApi } from '@/api/SocialMediaLinksController';
import { AppointmentsApi } from '@/api/AppointmentsController';

type SmokeResult = { name: string; ok: boolean; info?: any; error?: string };

async function testListAndMaybeGet(
  name: string,
  list: () => Promise<any[]>,
  get?: (id: string | number) => Promise<any>
): Promise<SmokeResult> {
  try {
    const items = await list();
    let info: any = { count: Array.isArray(items) ? items.length : 'n/a' };
    if (Array.isArray(items) && items.length && get) {
      const first = items[0];
      const id = (first && (first.id ?? first.Id)) as string | number | undefined;
      if (id !== undefined) {
        const one = await get(id);
        info.sample = { id, ok: !!one };
      }
    }
    return { name, ok: true, info };
  } catch (e: any) {
    return { name, ok: false, error: e?.message ?? String(e) };
  }
}

export default function ApiSmoke() {
  const [results, setResults] = useState<SmokeResult[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      setRunning(true);

      const out: SmokeResult[] = [];

      // Simple list + get checks
      out.push(await testListAndMaybeGet('Articles', () => ArticlesApi.list(), (id) => ArticlesApi.get(Number(id))));
      out.push(await testListAndMaybeGet('ContactInfo', () => ContactInfoApi.list(), (id) => ContactInfoApi.get(Number(id))));
      out.push(await testListAndMaybeGet('ContactMessages', () => ContactMessagesApi.list(), (id) => ContactMessagesApi.get(Number(id))));
      out.push(await testListAndMaybeGet('Ebooks', () => EbooksApi.list(), (id) => EbooksApi.get(Number(id))));
      out.push(await testListAndMaybeGet('Images', () => ImagesApi.list(), (id) => ImagesApi.get(Number(id))));
      out.push(await testListAndMaybeGet('ProvidedServices', () => ProvidedServicesApi.list(), (id) => ProvidedServicesApi.get(Number(id))));
      out.push(await testListAndMaybeGet('Recipes', () => RecipesApi.list(), (id) => RecipesApi.get(Number(id))));
      out.push(await testListAndMaybeGet('Resumes', () => ResumesApi.list(), (id) => ResumesApi.get(Number(id))));
      out.push(await testListAndMaybeGet('SocialMediaLinks', () => SocialMediaLinksApi.list(), (id) => SocialMediaLinksApi.get(String(id))));
      out.push(await testListAndMaybeGet('Appointments', () => AppointmentsApi.list(), (id) => AppointmentsApi.get(Number(id))));
      out.push(await testListAndMaybeGet('MainPages', () => MainPagesApi.list(), (id) => MainPagesApi.get(Number(id))));

      // Extra: if there is at least one main page, try its picture-url endpoint
      try {
        const pages = await MainPagesApi.list();
        if (pages.length) {
          const pic = await MainPagesApi.getMainPictureUrl(Number(pages[0].id));
          out.push({ name: 'MainPages.getMainPictureUrl', ok: true, info: pic });
        } else {
          out.push({ name: 'MainPages.getMainPictureUrl', ok: true, info: 'no pages to test' });
        }
      } catch (e: any) {
        out.push({ name: 'MainPages.getMainPictureUrl', ok: false, error: e?.message ?? String(e) });
      }

      setResults(out);
      setRunning(false);
    })();
  }, []);

  const passed = results.filter(r => r.ok).length;
  const total = results.length;

  return (
    <div style={{ padding: 16, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>
      <h2>API Smoke Test</h2>
      <p>Base URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      <p>Status: {running ? 'Running…' : 'Done'} — {passed}/{total} passed</p>
      <pre style={{ background: '#111', color: '#ddd', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}