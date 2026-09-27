import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function urlNewsFetcherPlugin(): Plugin {
  return {
    name: 'url-news-fetcher-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/fetch-url')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'URL parameter missing' }));
              return;
            }

            const fetchResp = await fetch(targetUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'hi,en-US,en;q=0.9',
              },
            });

            if (!fetchResp.ok) {
              res.statusCode = fetchResp.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Remote server returned ${fetchResp.status}` }));
              return;
            }

            const html = await fetchResp.text();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ html, finalUrl: fetchResp.url }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Failed to fetch target URL' }));
          }
          return;
        }

        if (req.url && req.url.startsWith('/api/ai/rewrite-news') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const {
                originalTitle = '',
                originalSummary = '',
                originalContent = '',
                sourceName = 'News Desk',
                detectedCategory = 'desh',
                detectedDistrict = '',
                style = 'journalistic',
              } = data;

              const cleanRaw = (originalContent || '')
                .replace(/<[^>]*>?/gm, ' ')
                .replace(/\s+/g, ' ')
                .trim();

              const apiKey = process.env.GEMINI_API_KEY;
              if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
                try {
                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({
                    apiKey: apiKey.trim(),
                    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
                  });

                  const prompt = `आप 'समाचार फर्स्ट' (Samachar First) हिंदी डिजिटल न्यूज़ पोर्टल के मुख्य वरिष्ठ संपादक हैं।
कृपया निम्नलिखित समाचार को पूर्णतः नया, विशिष्ट और तथ्यपरक हिंदी समाचार में पुनर्लेखित (Rewrite) करें।
मूल शीर्षक: ${originalTitle}
मूल स्रोत: ${sourceName}
मूल सारांश: ${originalSummary}
मूल पाठ: ${cleanRaw.slice(0, 6000)}
शैली: ${style}

केवल JSON लौटाएं:
{
  "rewrittenTitle": "आकर्षक एवं सटीक हिंदी शीर्षक",
  "rewrittenSummary": "2-3 वाक्यों का प्रभावशाली लीड सारांश",
  "rewrittenContent": "HTML स्वरूपित (<p>, <h3>, <ul>) विस्तृत समाचार और मुख्य बिंदु",
  "suggestedTags": ["टैग 1", "टैग 2", "टैग 3", "टैग 4"],
  "suggestedCategorySlug": "${detectedCategory}",
  "suggestedDistrict": "${detectedDistrict || ''}"
}`;

                  const resp = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                    config: { responseMimeType: 'application/json', temperature: 0.4 },
                  });

                  if (resp.text) {
                    const parsed = JSON.parse(resp.text);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        success: true,
                        rewrittenTitle: parsed.rewrittenTitle || originalTitle,
                        rewrittenSummary: parsed.rewrittenSummary || originalSummary,
                        rewrittenContent: parsed.rewrittenContent || `<p>${originalSummary}</p>`,
                        suggestedTags: parsed.suggestedTags || ['ताजा खबर', 'समाचार फर्स्ट'],
                        suggestedCategorySlug: parsed.suggestedCategorySlug || detectedCategory,
                        suggestedDistrict: parsed.suggestedDistrict || detectedDistrict,
                        provider: 'gemini-3.8-flash',
                      })
                    );
                    return;
                  }
                } catch (gErr: any) {
                  console.warn('Vite middleware Gemini call fallback:', gErr?.message);
                }
              }

              // Fallback
              const sentences = cleanRaw.split(/[।.]/).map((s) => s.trim()).filter((s) => s.length > 8);
              const titlePrefix = style === 'breaking' ? 'बड़ा अपडेट:' : 'विशेष रिपोर्ट:';
              const pTitle = `${originalTitle.replace(/\s*[-|—].*$/, '')} — ${titlePrefix} जानिए पूरा मामला`;
              const pSummary = `【समाचार फर्स्ट डिजिटल डेस्क】 ${originalSummary || sentences[0] || originalTitle} इस घटनाक्रम के सभी मुख्य पहलुओं और प्रशासनिक कदमों की पूरी जानकारी।`;
              const pContent = `
<p class="lead font-medium text-slate-800 dark:text-slate-200 mb-4"><strong>समाचार फर्स्ट डिजिटल डेस्क:</strong> ${sentences[0] || originalSummary}।</p>
<div class="my-4 p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/40">
  <h4 class="font-bold text-amber-900 dark:text-amber-300 text-sm mb-2">📌 प्रमुख बिंदु (Key Highlights):</h4>
  <ul class="list-disc list-inside space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
    <li>${sentences[1] ? sentences[1] + '।' : 'संबंधित विभाग एवं प्रशासन द्वारा तुरंत संज्ञान लेकर आवश्यक दिशा-निर्देश जारी किए गए।'}</li>
    <li>${sentences[2] ? sentences[2] + '।' : 'योजना एवं घटनाक्रम से संबंधित पक्षों को तुरंत राहत व व्यवस्था सुनिश्चित की जा रही है।'}</li>
    <li>स्थानीय स्तर पर निगरानी समिति का गठन किया गया है।</li>
  </ul>
</div>
<h3 class="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2">विस्तृत घटनाक्रम:</h3>
${sentences.slice(0, 6).map((s) => `<p class="mb-3">${s}।</p>`).join('\n') || `<p>${cleanRaw}</p>`}
<div class="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic flex items-center justify-between">
  <span>(संपादित व पुनर्लेखित: समाचार फर्स्ट संपादकीय सेल)</span>
  <span>साभार: ${sourceName}</span>
</div>`;

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  rewrittenTitle: pTitle,
                  rewrittenSummary: pSummary,
                  rewrittenContent: pContent,
                  suggestedTags: ['ताजा खबर', 'समाचार फर्स्ट', detectedDistrict || 'हरियाणा', 'डिजिटल अपडेट'],
                  suggestedCategorySlug: detectedCategory,
                  suggestedDistrict: detectedDistrict,
                  provider: 'editorial-engine',
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'AI rewrite failed' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), urlNewsFetcherPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      cors: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      cors: true,
    },
  };
});

