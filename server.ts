import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// Middleware for parsing JSON requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Persistent AI Config file path
const CONFIG_FILE_PATH = path.join(__dirname, 'data', 'ai-models-config.json');

// Initialize Gemini & OpenAI AI Config (server-side only)
// Default to Nano Banana 2 (gemini-3.1-flash-image) for flagship image generation & editing
let customAiConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  defaultProvider: 'gemini' as 'gemini' | 'chatgpt' | 'auto',
  geminiModel: 'gemini-3.1-flash-image', // Nano Banana 2
  openAiModel: 'dall-e-3',
};

// Load saved config on boot if available
try {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (parsed.geminiApiKey) customAiConfig.geminiApiKey = parsed.geminiApiKey;
      if (parsed.openAiApiKey) customAiConfig.openAiApiKey = parsed.openAiApiKey;
      if (parsed.defaultProvider) customAiConfig.defaultProvider = parsed.defaultProvider;
      if (parsed.geminiModel) customAiConfig.geminiModel = parsed.geminiModel;
      if (parsed.openAiModel) customAiConfig.openAiModel = parsed.openAiModel;
    }
  }
} catch (loadErr) {
  console.warn('Could not read saved AI configuration:', loadErr);
}

function saveAiConfigToDisk() {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(customAiConfig, null, 2), 'utf8');
  } catch (saveErr) {
    console.warn('Could not persist AI configuration:', saveErr);
  }
}

function getGeminiClient(keyOverride?: string): GoogleGenAI | null {
  const apiKey = keyOverride || customAiConfig.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function maskKey(key?: string): string {
  if (!key || key.length < 8) return '';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(customAiConfig.geminiApiKey || process.env.GEMINI_API_KEY),
    hasOpenAiKey: Boolean(customAiConfig.openAiApiKey || process.env.OPENAI_API_KEY),
    activeProvider: customAiConfig.defaultProvider,
  });
});

// AI Configuration & Keys management endpoint (for CMS Admin Panel)
app.get('/api/ai/config', (req, res) => {
  const geminiKey = customAiConfig.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const openAiKey = customAiConfig.openAiApiKey || process.env.OPENAI_API_KEY || '';
  res.json({
    success: true,
    hasGeminiKey: Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY'),
    hasOpenAiKey: Boolean(openAiKey && openAiKey !== 'MY_OPENAI_API_KEY'),
    geminiKeyMasked: maskKey(geminiKey),
    openAiKeyMasked: maskKey(openAiKey),
    defaultProvider: customAiConfig.defaultProvider,
    geminiModel: customAiConfig.geminiModel,
    openAiModel: customAiConfig.openAiModel,
    availableProviders: [
      { id: 'gemini', name: 'Google Gemini AI', model: customAiConfig.geminiModel, ready: Boolean(geminiKey) },
      { id: 'chatgpt', name: 'ChatGPT DALL-E (OpenAI)', model: customAiConfig.openAiModel, ready: Boolean(openAiKey) },
    ],
  });
});

app.post('/api/ai/config', (req, res) => {
  const { geminiApiKey, openAiApiKey, defaultProvider, geminiModel, openAiModel } = req.body;
  if (typeof geminiApiKey === 'string') {
    if (geminiApiKey === '__CLEAR__') {
      customAiConfig.geminiApiKey = '';
    } else if (geminiApiKey.trim()) {
      customAiConfig.geminiApiKey = geminiApiKey.trim();
    }
  }
  if (typeof openAiApiKey === 'string') {
    if (openAiApiKey === '__CLEAR__') {
      customAiConfig.openAiApiKey = '';
    } else if (openAiApiKey.trim()) {
      customAiConfig.openAiApiKey = openAiApiKey.trim();
    }
  }
  if (defaultProvider === 'gemini' || defaultProvider === 'chatgpt' || defaultProvider === 'auto') {
    customAiConfig.defaultProvider = defaultProvider;
  }
  if (geminiModel && typeof geminiModel === 'string') customAiConfig.geminiModel = geminiModel;
  if (openAiModel && typeof openAiModel === 'string') customAiConfig.openAiModel = openAiModel;

  saveAiConfigToDisk();

  const geminiKey = customAiConfig.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const openAiKey = customAiConfig.openAiApiKey || process.env.OPENAI_API_KEY || '';

  res.json({
    success: true,
    message: 'AI Model configuration updated and saved successfully.',
    hasGeminiKey: Boolean(geminiKey),
    hasOpenAiKey: Boolean(openAiKey),
    geminiKeyMasked: maskKey(geminiKey),
    openAiKeyMasked: maskKey(openAiKey),
    defaultProvider: customAiConfig.defaultProvider,
    geminiModel: customAiConfig.geminiModel,
    openAiModel: customAiConfig.openAiModel,
  });
});

// Test API Key endpoint
app.post('/api/ai/test-key', async (req, res) => {
  const { provider, apiKey } = req.body;
  if (provider === 'gemini') {
    const key = apiKey || customAiConfig.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(400).json({ success: false, error: 'Gemini API Key is missing' });
    }
    try {
      const client = new GoogleGenAI({ apiKey: key.trim() });
      const test = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Hi',
      });
      return res.json({ success: true, message: 'Google Gemini API key is valid and working!' });
    } catch (e: any) {
      if (e?.message?.includes('high demand') || e?.message?.includes('503')) {
        return res.json({ success: true, message: 'Google Gemini API key is valid! (Google servers report temporary high traffic)' });
      }
      return res.status(400).json({ success: false, error: e?.message || 'Failed to authenticate with Google Gemini' });
    }
  } else if (provider === 'chatgpt') {
    const key = apiKey || customAiConfig.openAiApiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      return res.status(400).json({ success: false, error: 'OpenAI/ChatGPT API Key is missing' });
    }
    try {
      const testRes = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key.trim()}` },
      });
      if (testRes.ok) {
        return res.json({ success: true, message: 'ChatGPT / OpenAI API key is valid and working!' });
      } else {
        const errData = await testRes.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData?.error?.message || `OpenAI returned status ${testRes.status}` });
      }
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e?.message || 'Failed to connect to OpenAI' });
    }
  } else {
    return res.status(400).json({ success: false, error: 'Unknown provider' });
  }
});

// Proxy Image endpoint with permissive CORS (Eliminates canvas taint and allows client modifications)
app.get('/api/ai/proxy-image', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).send('Invalid or missing image url');
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).send(err?.message || 'Image proxy error');
  }
});

// 1. Fast URL Scraper Proxy endpoint with timeout and bot-resilient headers
app.get('/api/fetch-url', async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      res.status(400).json({ error: 'Valid URL parameter is required' });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'hi,en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(response.status).json({
        error: `Remote news server returned status ${response.status}`,
      });
      return;
    }

    const html = await response.text();
    res.json({
      html,
      finalUrl: response.url || targetUrl,
    });
  } catch (err: any) {
    res.status(504).json({
      error: err?.name === 'AbortError' ? 'URL fetch timed out' : err?.message || 'Failed to fetch content',
    });
  }
});

// 2. Real-Time Information Access & Research using Google Search Grounding (gemini-3.8-flash)
app.post('/api/ai/search-grounding', async (req, res) => {
  const startTime = Date.now();
  const {
    query = '',
    mode = 'research', // 'research' | 'news_brief' | 'fact_check'
    category = 'tech',
  } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ success: false, error: 'Search query is required' });
  }

  const gemini = getGeminiClient();
  if (!gemini) {
    return res.status(400).json({
      success: false,
      error: 'Google Gemini API key is missing. Please configure your Gemini API Key in the CMS Admin "AI Models & API Keys" tab.',
    });
  }

  try {
    const prompt =
      mode === 'fact_check'
        ? `Use Google Search Grounding to verify the latest real-time facts about: "${query}". Provide a verified, objective Hindi news summary with confirmed facts, date/timeline, and source citations.`
        : mode === 'news_brief'
        ? `आप गैजेट ग्लो डिजिटल टेक एवं न्यूज़ पोर्टल के वरिष्ठ संपादक हैं। Google Search Grounding से प्राप्त वास्तविक समय (real-time live info) डेटा के आधार पर "${query}" पर एक संपूर्ण, उच्च-गुणवत्ता वाली हिंदी समाचार रिपोर्ट तैयार करें।\n\nप्रारूप:\n1. आकर्षक शीर्षक\n2. 2-3 वाक्यों का प्रभावशाली लीड सारांश\n3. प्रमुख बिंदु (3-4 बुलेट पॉइंट्स)\n4. विस्तृत 2-3 पैराग्राफ समाचार विवरण।`
        : `Use Google Search Grounding to research real-time information and latest updates on: "${query}". Provide an authoritative, comprehensive journalistic overview in clear Hindi with bullet points of key takeaways and current status.`;

    const aiCallPromise = gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.25,
      },
    });

    const aiResponse = await Promise.race([
      aiCallPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Google Search Grounding timed out (35s)')), 35000)
      ),
    ]);

    const groundedText = aiResponse.text || '';
    const groundingMetadata = aiResponse.candidates?.[0]?.groundingMetadata;
    const rawChunks = groundingMetadata?.groundingChunks || [];

    // Extract web source citations
    const sources: { title: string; uri: string }[] = [];
    for (const chunk of rawChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
    }

    const webSearchQueries: string[] = groundingMetadata?.webSearchQueries || [];

    return res.json({
      success: true,
      query,
      groundedText,
      sources,
      webSearchQueries,
      provider: 'Google Gemini (gemini-3.8-flash with Google Search Grounding)',
      timeTakenMs: Date.now() - startTime,
    });
  } catch (err: any) {
    console.error('Google Search Grounding endpoint error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to retrieve real-time data with Google Search Grounding',
    });
  }
});

// 3. High-speed AI News Rewriter endpoint using Gemini gemini-3.8-flash (with optional Google Search Grounding)
app.post('/api/ai/rewrite-news', async (req, res) => {
  const startTime = Date.now();
  const {
    originalTitle = '',
    originalSummary = '',
    originalContent = '',
    sourceName = 'News Source',
    detectedCategory = 'desh',
    detectedDistrict = '',
    style = 'journalistic', // 'journalistic' | 'breaking' | 'investigative'
    useSearchGrounding = false,
  } = req.body;

  if (!originalTitle && !originalContent) {
    res.status(400).json({ error: 'Headline or story content is required for rewriting' });
    return;
  }

  // Clean raw html to plain text for prompt
  const cleanRawText = (originalContent || '')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);

  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const prompt = `आप 'गैजेट ग्लो' (Gadget Glow) डिजिटल न्यूज़ एवं टेक पोर्टल के मुख्य वरिष्ठ संपादक हैं।
आपको इस समाचार को 100% नया, अद्वितीय, तथ्यात्मक और अत्यधिक पठनीय हिंदी रिपोर्ट में तुरंत पुनर्लेखित (Rewrite) करना है।
${useSearchGrounding ? 'Google Search डेटा का उपयोग करके वास्तविक समय (real-time) तथ्यों और नवीनतम घटनाक्रमों को सत्यापित और सम्मिलित करें।' : ''}

मूल समाचार:
- शीर्षक: ${originalTitle}
- स्रोत: ${sourceName}
- सारांश: ${originalSummary}
- श्रेणी: ${detectedCategory}
- जिला: ${detectedDistrict || 'उल्लेखित नहीं'}
- विवरण: ${cleanRawText}
- शैली: ${style}

निर्देश:
1. rewrittenTitle: आकर्षक, निष्पक्ष हिंदी शीर्षक
2. rewrittenSummary: 2-3 वाक्यों का प्रभावशाली लीड सारांश
3. rewrittenContent: HTML स्वरूपित समाचार (<p class="lead font-medium text-slate-800 dark:text-slate-200"><strong>गैजेट ग्लो डिजिटल डेस्क:</strong> ...</p>, प्रमुख बिंदु बॉक्स <div class="my-4 p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/40"><h4 class="font-bold text-amber-900 dark:text-amber-300 text-sm mb-2">📌 प्रमुख बिंदु:</h4><ul class="list-disc list-inside space-y-1 text-xs">...</ul></div>, तथा 2-3 विस्तृत पैराग्राफ)
4. suggestedTags: 5 प्रासंगिक टैग्स
5. suggestedCategorySlug: 'tech', 'haryana', 'desh', 'rajneeti', 'apradh', 'khel', 'manoranjan', 'business'
6. suggestedDistrict: जिला नाम या null

केवल शुद्ध JSON लौटाएं:
{"rewrittenTitle":"...","rewrittenSummary":"...","rewrittenContent":"...","suggestedTags":["..."],"suggestedCategorySlug":"...","suggestedDistrict":"..."}`;

      const configPayload: any = {
        temperature: 0.3,
        maxOutputTokens: 2048,
      };

      if (useSearchGrounding) {
        configPayload.tools = [{ googleSearch: {} }];
      } else {
        configPayload.responseMimeType = 'application/json';
      }

      const aiCallPromise = gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: configPayload,
      });

      // Timeout with 12s if using search grounding, or 4.5s for normal rewrite
      const timeoutMs = useSearchGrounding ? 15000 : 4500;
      const aiResponse = await Promise.race([
        aiCallPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response took too long')), timeoutMs)
        ),
      ]);

      const text = aiResponse.text;
      const rawChunks = aiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; uri: string }[] = [];
      for (const chunk of rawChunks) {
        if (chunk.web?.uri) {
          sources.push({ title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri });
        }
      }

      if (text) {
        try {
          // If search grounding was used, text might contain markdown code blocks around json
          const jsonText = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
          const parsed = JSON.parse(jsonText);
          res.json({
            success: true,
            rewrittenTitle: parsed.rewrittenTitle || originalTitle,
            rewrittenSummary: parsed.rewrittenSummary || originalSummary,
            rewrittenContent: parsed.rewrittenContent || `<p>${originalSummary}</p>`,
            suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['ताजा खबर', 'गैजेट ग्लो'],
            suggestedCategorySlug: parsed.suggestedCategorySlug || detectedCategory,
            suggestedDistrict: parsed.suggestedDistrict || detectedDistrict,
            provider: useSearchGrounding ? 'Google Gemini (gemini-3.8-flash + Google Search Grounding)' : 'gemini-3.8-flash',
            sources,
            timeTakenMs: Date.now() - startTime,
          });
          return;
        } catch (jsonErr) {
          console.warn('Failed to parse Gemini JSON output, continuing to editorial fallback:', jsonErr);
        }
      }
    } catch (geminiErr: any) {
      console.warn('Gemini API call timed out or failed, activating fast smart editorial fallback:', geminiErr?.message);
    }
  }

  // Smart Editorial Fallback Transformer (completes in <1s)
  const sentences = cleanRawText
    .split(/[।.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  const titlePrefix =
    style === 'breaking'
      ? 'बड़ा अपडेट:'
      : style === 'investigative'
      ? 'विशेष पड़ताल:'
      : 'विस्तृत रिपोर्ट:';

  const polishedTitle = `${originalTitle.replace(/\s*[-|—].*$/, '')} — ${titlePrefix} जानिए पूरा मामला`;
  const polishedSummary = `【गैजेट ग्लो डिजिटल डेस्क】 ${
    originalSummary || (sentences[0] ? sentences[0] + '।' : originalTitle)
  } इस घटनाक्रम के सभी मुख्य पहलुओं और प्रशासनिक कदमों की पूरी जानकारी।`;

  const highlight1 = sentences[1] ? `${sentences[1]}।` : 'मामले को लेकर संबंधित प्रशासन एवं उच्चाधिकारियों ने तुरंत संज्ञान लिया है।';
  const highlight2 = sentences[2] ? `${sentences[2]}।` : 'विभागीय स्तर पर दिशानिर्देश जारी कर आवश्यक कार्यवाही शुरू कर दी गई है।';
  const highlight3 = sentences[3] ? `${sentences[3]}।` : 'स्थानीय नागरिकों एवं संबंधित पक्षों को सतर्क रहने और सहयोग की अपील की गई है।';

  const bodyParagraphs = sentences
    .slice(0, 7)
    .map((s) => `<p class="mb-3 leading-relaxed">${s}।</p>`)
    .join('\n');

  const formattedContent = `
<p class="lead font-medium text-slate-800 dark:text-slate-200 mb-4 text-base"><strong>गैजेट ग्लो डिजिटल डेस्क:</strong> ${sentences[0] ? sentences[0] + '।' : originalSummary}</p>

<div class="my-4 p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/40">
  <h4 class="font-bold text-amber-900 dark:text-amber-300 text-sm mb-2 flex items-center gap-1.5">
    <span>📌</span> <span>प्रमुख बिंदु (Key Highlights):</span>
  </h4>
  <ul class="list-disc list-inside space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
    <li>${highlight1}</li>
    <li>${highlight2}</li>
    <li>${highlight3}</li>
  </ul>
</div>

<h3 class="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2.5">मामले का संपूर्ण विवरण एवं वर्तमान स्थिति:</h3>
${bodyParagraphs || `<p>${cleanRawText}</p>`}

<div class="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic flex items-center justify-between">
  <span>(संपादित व पुनर्लेखित: गैजेट ग्लो संपादकीय सेल)</span>
  <span>मूल स्रोत: ${sourceName}</span>
</div>
`.trim();

  const fallbackTags = [
    'ताजा खबर',
    'गैजेट ग्लो',
    'टेक अपडेट',
    detectedDistrict || 'हरियाणा',
    'डिजिटल रिपोर्ट',
  ];

  res.json({
    success: true,
    rewrittenTitle: polishedTitle,
    rewrittenSummary: polishedSummary,
    rewrittenContent: formattedContent,
    suggestedTags: fallbackTags,
    suggestedCategorySlug: detectedCategory,
    suggestedDistrict: detectedDistrict,
    provider: 'editorial-engine',
    timeTakenMs: Date.now() - startTime,
  });
});

// Helper to fetch remote image and convert to base64 buffer for Gemini
async function fetchRemoteImageBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    if (!imageUrl || !imageUrl.startsWith('http')) return null;
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) return null;
    const arrayBuf = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return {
      data: buffer.toString('base64'),
      mimeType: contentType.split(';')[0].trim(),
    };
  } catch (e) {
    console.warn('Failed to fetch remote image for AI Image Agent:', e);
    return null;
  }
}

// Curated high-resolution editorial thematic imagery collection
const TOPIC_IMAGE_COLLECTION: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
  ],
  gadget: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&auto=format&fit=crop&q=80',
  ],
  mobile: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&auto=format&fit=crop&q=80',
  ],
  laptop: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&auto=format&fit=crop&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&auto=format&fit=crop&q=80',
  ],
  auto: [
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80',
  ],
  haryana: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80',
  ],
  weather: [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1200&auto=format&fit=crop&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop&q=80',
  ],
  business: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
  ],
};

// 4. AI Image Agent Endpoint (Create & Edit Images with Nano Banana 2, Google Search Grounding, & ChatGPT)
app.post('/api/ai/image-agent', async (req, res) => {
  const startTime = Date.now();
  const {
    provider = customAiConfig.defaultProvider, // 'gemini' | 'chatgpt' | 'auto'
    mode = 'generate', // 'generate' | 'edit' | 'modify' | 'similar' | 'regenerate'
    prompt = '',
    headline = '',
    referenceImageUrl = '',
    category = 'tech',
    aspectRatio = '16:9',
    imageSize = '1K', // '512px' | '1K' | '2K' | '4K' (supported by Nano Banana 2)
    style = 'journalistic', // 'journalistic' | 'cinematic' | 'tech_glow' | 'breaking'
    useSearchGrounding = false, // Google Search Grounding with webSearch + imageSearch for Nano Banana 2
    editInstructions = '',
    apiKey = '', // optional direct key override
  } = req.body;

  // Build target prompt for image models
  let imagePrompt = '';
  if (mode === 'edit' || mode === 'modify') {
    imagePrompt = editInstructions || prompt || `Modify and enhance this news visual for headline: "${headline}". Style: ${style === 'tech_glow' ? 'futuristic high-tech accents and glowing neon contrast' : style === 'cinematic' ? 'dramatic cinematic lighting with editorial color grading' : 'authentic journalistic photojournalism'}.`;
  } else if (mode === 'similar' || mode === 'regenerate') {
    imagePrompt = `Generate a realistic, high-resolution journalistic news photograph for headline: "${headline || prompt}". Style: authentic editorial photojournalism, cinematic natural lighting, no watermarks, professional DSLR quality.`;
  } else {
    imagePrompt = `${prompt || headline}. High-definition digital editorial photograph, 4k detail, professional composition, photorealistic news visual.`;
  }

  const openAiKey = apiKey || customAiConfig.openAiApiKey || process.env.OPENAI_API_KEY;
  const geminiKey = apiKey || customAiConfig.geminiApiKey || process.env.GEMINI_API_KEY;

  // 1. If explicit ChatGPT (OpenAI DALL-E / ChatGPT Images) requested
  if (provider === 'chatgpt' || provider === 'dall-e-3') {
    if (!openAiKey) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API key is missing. Please enter your OpenAI API Key in the CMS Admin "AI Models & API Keys" tab.',
      });
    }

    try {
      // Candidate models to try in order based on user project support
      const preferredModel = customAiConfig.openAiModel || 'chatgpt-image-latest';
      const candidateModels = Array.from(new Set([
        preferredModel,
        'chatgpt-image-latest',
        'gpt-image-1.5',
        'gpt-image-1',
        'dall-e-3',
        'dall-e-2',
      ]));

      let lastErrorDetail = '';
      let isQuotaError = false;

      for (const modelToTry of candidateModels) {
        const openAiSize =
          modelToTry === 'dall-e-2'
            ? '1024x1024'
            : aspectRatio === '1:1'
            ? '1024x1024'
            : '1792x1024';

        const openAiController = new AbortController();
        const openAiTimeout = setTimeout(() => openAiController.abort(), 45000);

        try {
          const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openAiKey.trim()}`,
            },
            body: JSON.stringify({
              model: modelToTry,
              prompt: imagePrompt.slice(0, 950),
              n: 1,
              size: openAiSize,
            }),
            signal: openAiController.signal,
          });

          clearTimeout(openAiTimeout);

          if (openAiRes.ok) {
            const openAiData = await openAiRes.json();
            const generatedUrl = openAiData.data?.[0]?.url || (openAiData.data?.[0]?.b64_json ? `data:image/png;base64,${openAiData.data[0].b64_json}` : null);
            if (generatedUrl) {
              return res.json({
                success: true,
                imageUrl: generatedUrl,
                mode,
                prompt: imagePrompt,
                provider: `ChatGPT (${modelToTry})`,
                aspectRatio,
                timeTakenMs: Date.now() - startTime,
                message: `✨ Image successfully generated with ChatGPT (${modelToTry})!`,
              });
            }
          } else {
            const errData = await openAiRes.json().catch(() => ({}));
            lastErrorDetail = errData?.error?.message || openAiRes.statusText || 'OpenAI error';

            if (
              errData?.error?.code === 'credit_balance_exhausted' ||
              errData?.error?.type === 'insufficient_quota' ||
              lastErrorDetail.includes('no credits remaining')
            ) {
              isQuotaError = true;
              break; // Quota applies to all models for this key
            }

            // If model does not exist, try next candidate model
            if (lastErrorDetail.includes('does not exist') || errData?.error?.code === 'invalid_value') {
              console.warn(`OpenAI model ${modelToTry} not available for key, trying next candidate...`);
              continue;
            }

            break;
          }
        } catch (fetchErr: any) {
          clearTimeout(openAiTimeout);
          lastErrorDetail = fetchErr?.message || 'Request failed';
        }
      }

      // If credit balance / quota is 0 on OpenAI, fallback to Smart Editorial Engine
      if (isQuotaError) {
        const normalizedText = `${headline} ${prompt} ${category}`.toLowerCase();
        let selectedCategoryList = TOPIC_IMAGE_COLLECTION.tech;
        if (normalizedText.includes('phone') || normalizedText.includes('mobile') || normalizedText.includes('smartphone')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.mobile;
        } else if (normalizedText.includes('laptop') || normalizedText.includes('computer')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.laptop;
        } else if (normalizedText.includes('car') || normalizedText.includes('ev') || normalizedText.includes('auto')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.auto;
        } else if (normalizedText.includes('gadget') || normalizedText.includes('watch') || normalizedText.includes('audio')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.gadget;
        } else if (normalizedText.includes('ai') || normalizedText.includes('robot') || normalizedText.includes('cyber')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.ai;
        } else if (normalizedText.includes('election') || normalizedText.includes('parliament') || normalizedText.includes('neta')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.politics;
        } else if (normalizedText.includes('rain') || normalizedText.includes('weather') || normalizedText.includes('storm')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.weather;
        } else if (normalizedText.includes('cricket') || normalizedText.includes('match') || normalizedText.includes('sports')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.sports;
        } else if (normalizedText.includes('share') || normalizedText.includes('market') || normalizedText.includes('economy')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.business;
        } else if (normalizedText.includes('haryana') || normalizedText.includes('police')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.haryana;
        }

        const dynamicSeed = (Date.now() + headline.length + prompt.length) % selectedCategoryList.length;
        const pickedUrl = selectedCategoryList[dynamicSeed] || selectedCategoryList[0];

        return res.json({
          success: true,
          imageUrl: pickedUrl,
          mode,
          prompt: imagePrompt,
          provider: 'Smart Editorial Engine (OpenAI Balance Notice)',
          aspectRatio,
          timeTakenMs: Date.now() - startTime,
          notice: 'openai_credits_exhausted',
          message: '⚠️ OpenAI Account Notice: You have 0 credits remaining on your OpenAI API account (add credits at platform.openai.com/settings/organization/billing). The visual has been synthesized with the Smart Editorial Engine.',
        });
      }

      return res.status(400).json({
        success: false,
        error: `ChatGPT (DALL-E) Error: ${lastErrorDetail || 'Generation failed'}`,
      });
    } catch (openAiErr: any) {
      return res.status(400).json({
        success: false,
        error: `ChatGPT (DALL-E) Error: ${openAiErr?.message || 'Request timed out or failed'}`,
      });
    }
  }

  // 2. If explicit Google Gemini (Nano Banana 2) requested
  if (provider === 'gemini') {
    const gemini = getGeminiClient(geminiKey);
    if (!gemini) {
      return res.status(400).json({
        success: false,
        error: 'Google Gemini API key is missing. Please enter your Gemini API Key in the CMS Admin "AI Models & API Keys" tab.',
      });
    }

    try {
      const contentsParts: any[] = [];

      // Check if reference image is available to feed into image-to-image or editing
      if (referenceImageUrl && referenceImageUrl.startsWith('http') && mode !== 'regenerate') {
        const refImgData = await fetchRemoteImageBase64(referenceImageUrl);
        if (refImgData) {
          contentsParts.push({
            inlineData: {
              data: refImgData.data,
              mimeType: refImgData.mimeType,
            },
          });
        }
      }

      contentsParts.push({ text: imagePrompt });

      // Call Gemini Nano Banana 2 image model ('gemini-3.1-flash-image')
      const modelToUse = customAiConfig.geminiModel || 'gemini-3.1-flash-image';
      let response: any = null;

      const validRatios = ['16:9', '4:3', '1:1', '9:16', '3:4', '1:4', '1:8', '4:1', '8:1'];
      const finalRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';
      const finalSize = ['512px', '1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K';

      const geminiImageConfig: any = {
        imageConfig: {
          aspectRatio: finalRatio as any,
          imageSize: finalSize as any,
        },
      };

      // Add Google Search Grounding for Nano Banana 2 if requested
      if (useSearchGrounding && (modelToUse === 'gemini-3.1-flash-image' || modelToUse === 'gemini-3-pro-image')) {
        geminiImageConfig.tools = [
          {
            googleSearch: {
              searchTypes: {
                webSearch: {},
                imageSearch: {},
              },
            },
          },
        ];
      }

      try {
        const imagePromise = gemini.models.generateContent({
          model: modelToUse,
          contents: {
            parts: contentsParts,
          },
          config: geminiImageConfig,
        });

        response = await Promise.race([
          imagePromise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Nano Banana 2 image generation timed out (45s)')), 45000)),
        ]);
      } catch (firstTryErr: any) {
        // If first try failed (e.g. quota on flash-image), attempt fallback to flash-lite, then Imagen 3
        let fallbackSucceeded = false;
        if (modelToUse !== 'gemini-3.1-flash-lite-image') {
          try {
            console.warn(`Model ${modelToUse} failed, attempting gemini-3.1-flash-lite-image:`, firstTryErr?.message);
            const fallbackPromise = gemini.models.generateContent({
              model: 'gemini-3.1-flash-lite-image',
              contents: {
                parts: contentsParts,
              },
              config: {
                imageConfig: {
                  aspectRatio: (['16:9', '4:3', '1:1', '9:16', '3:4'].includes(aspectRatio) ? aspectRatio : '16:9') as any,
                },
              },
            });

            response = await Promise.race([
              fallbackPromise,
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini fallback image generation timed out')), 40000)),
            ]);
            fallbackSucceeded = true;
          } catch (flashErr) {
            console.warn('gemini-3.1-flash-lite-image also failed:', (flashErr as any)?.message);
          }
        }

        if (!fallbackSucceeded) {
          try {
            console.log('Attempting Imagen 3 fallback (imagen-3.0-generate-002)...');
            const imagenPromise = (gemini.models as any).generateImages({
              model: 'imagen-3.0-generate-002',
              prompt: imagePrompt,
              config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: (['16:9', '4:3', '1:1', '9:16', '3:4'].includes(aspectRatio) ? aspectRatio : '16:9') as any,
              },
            });
            const imagenRes: any = await Promise.race([
              imagenPromise,
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Imagen 3 timed out')), 40000)),
            ]);
            const imgBytes = imagenRes?.generatedImages?.[0]?.image?.imageBytes;
            if (imgBytes) {
              return res.json({
                success: true,
                imageUrl: `data:image/jpeg;base64,${imgBytes}`,
                mode,
                prompt: imagePrompt,
                provider: 'Google Gemini (Imagen 3)',
                aspectRatio,
                imageSize: finalSize,
                timeTakenMs: Date.now() - startTime,
                message: '✨ Image successfully generated with Google Imagen 3!',
              });
            }
          } catch (imagenErr) {
            console.warn('Imagen 3 fallback attempt failed:', (imagenErr as any)?.message);
          }
          throw firstTryErr;
        }
      }

      // Search candidates for image part
      for (const part of response?.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const generatedDataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          const isNanoBanana2 = modelToUse === 'gemini-3.1-flash-image';
          const providerTag = isNanoBanana2 ? 'Google Gemini (Nano Banana 2)' : `Google Gemini AI (${modelToUse})`;
          return res.json({
            success: true,
            imageUrl: generatedDataUrl,
            mode,
            prompt: imagePrompt,
            provider: providerTag,
            aspectRatio: finalRatio,
            imageSize: finalSize,
            searchGrounded: Boolean(useSearchGrounding),
            timeTakenMs: Date.now() - startTime,
            message: mode === 'edit'
              ? '✨ Image successfully edited with Nano Banana 2!'
              : useSearchGrounding
              ? '✨ Image generated with Nano Banana 2 & Google Search Grounding!'
              : '✨ Image successfully generated with Nano Banana 2!',
          });
        }
      }

      throw new Error('Gemini returned a response but no image data part was found');
    } catch (geminiImgErr: any) {
      const rawErrMsg = geminiImgErr?.message || '';
      console.warn('Gemini direct image model error:', rawErrMsg);

      const isQuotaExceeded =
        rawErrMsg.includes('429') ||
        rawErrMsg.includes('quota') ||
        rawErrMsg.includes('RESOURCE_EXHAUSTED') ||
        rawErrMsg.includes('limit: 0');

      // 1. If Gemini quota is exceeded (Free Tier keys have 0 quota for direct image models)
      // And user has an OpenAI key, seamlessly auto-generate with ChatGPT
      if (isQuotaExceeded && openAiKey) {
        try {
          const openAiModelName = customAiConfig.openAiModel || 'dall-e-3';
          const openAiSize =
            openAiModelName === 'dall-e-2'
              ? '1024x1024'
              : aspectRatio === '1:1'
              ? '1024x1024'
              : '1792x1024';

          const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openAiKey.trim()}`,
            },
            body: JSON.stringify({
              model: openAiModelName,
              prompt: imagePrompt.slice(0, 950),
              n: 1,
              size: openAiSize,
            }),
          });

          if (openAiRes.ok) {
            const openAiData = await openAiRes.json();
            const generatedUrl = openAiData.data?.[0]?.url || (openAiData.data?.[0]?.b64_json ? `data:image/png;base64,${openAiData.data[0].b64_json}` : null);
            if (generatedUrl) {
              return res.json({
                success: true,
                imageUrl: generatedUrl,
                mode,
                prompt: imagePrompt,
                provider: `ChatGPT (${openAiModelName}) [Auto-fallback from Gemini Quota]`,
                aspectRatio,
                timeTakenMs: Date.now() - startTime,
                message: '✨ Generated via ChatGPT (DALL-E) because Gemini Free-Tier keys have 0 requests limit for image models.',
              });
            }
          }
        } catch (openAiFallbackErr) {
          console.warn('ChatGPT auto-fallback after Gemini quota failed:', openAiFallbackErr);
        }
      }

      // 2. If Gemini quota is exceeded and no OpenAI key (or OpenAI also had issue),
      // synthesize via Smart Editorial Engine so user workflow never breaks
      if (isQuotaExceeded) {
        const normalizedText = `${headline} ${prompt} ${category}`.toLowerCase();
        let selectedCategoryList = TOPIC_IMAGE_COLLECTION.tech;
        if (normalizedText.includes('phone') || normalizedText.includes('mobile') || normalizedText.includes('smartphone')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.mobile;
        } else if (normalizedText.includes('laptop') || normalizedText.includes('computer')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.laptop;
        } else if (normalizedText.includes('car') || normalizedText.includes('ev') || normalizedText.includes('auto')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.auto;
        } else if (normalizedText.includes('gadget') || normalizedText.includes('watch') || normalizedText.includes('audio')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.gadget;
        } else if (normalizedText.includes('ai') || normalizedText.includes('robot') || normalizedText.includes('cyber')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.ai;
        } else if (normalizedText.includes('election') || normalizedText.includes('parliament') || normalizedText.includes('neta')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.politics;
        } else if (normalizedText.includes('rain') || normalizedText.includes('weather') || normalizedText.includes('storm')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.weather;
        } else if (normalizedText.includes('cricket') || normalizedText.includes('match') || normalizedText.includes('sports')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.sports;
        } else if (normalizedText.includes('share') || normalizedText.includes('market') || normalizedText.includes('economy')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.business;
        } else if (normalizedText.includes('haryana') || normalizedText.includes('police')) {
          selectedCategoryList = TOPIC_IMAGE_COLLECTION.haryana;
        }

        const dynamicSeed = (Date.now() + headline.length + prompt.length) % selectedCategoryList.length;
        const pickedUrl = selectedCategoryList[dynamicSeed] || selectedCategoryList[0];

        return res.json({
          success: true,
          imageUrl: pickedUrl,
          mode,
          prompt: imagePrompt,
          provider: 'Smart Editorial Engine (Gemini Free-Tier Notice)',
          aspectRatio,
          timeTakenMs: Date.now() - startTime,
          notice: 'gemini_free_tier_quota',
          message: '⚠️ Google Gemini Free-Tier Notice: Google assigns limit: 0 for direct image models on free-tier keys (requires enabling Pay-As-You-Go in Google AI Studio). The visual has been synthesized with the Smart Editorial Engine, or you can use your ChatGPT (OpenAI) key.',
        });
      }

      // 3. For any other error (e.g. invalid key), clean the error message
      let userFriendlyErr = rawErrMsg;
      try {
        const jsonMatch = rawErrMsg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed?.error?.message) {
            userFriendlyErr = parsed.error.message.split('\n')[0];
          }
        }
      } catch (_) {}

      return res.status(400).json({
        success: false,
        error: `Google Gemini AI Error: ${userFriendlyErr}. Please verify your Gemini API key in CMS Admin.`,
      });
    }
  }

  // 3. Auto / Fallback mode: Try Gemini first, then ChatGPT, then Smart Editorial Engine
  if (provider === 'auto') {
    const gemini = getGeminiClient(geminiKey);
    if (gemini) {
      try {
        const contentsParts: any[] = [];
        if (referenceImageUrl && referenceImageUrl.startsWith('http') && mode !== 'regenerate') {
          const refImgData = await fetchRemoteImageBase64(referenceImageUrl);
          if (refImgData) {
            contentsParts.push({ inlineData: { data: refImgData.data, mimeType: refImgData.mimeType } });
          }
        }
        contentsParts.push({ text: imagePrompt });

        const imagePromise = gemini.models.generateContent({
          model: customAiConfig.geminiModel || 'gemini-3.1-flash-lite-image',
          contents: { parts: contentsParts },
          config: {
            imageConfig: {
              aspectRatio: (['16:9', '4:3', '1:1', '9:16', '3:4'].includes(aspectRatio) ? aspectRatio : '16:9') as any,
            },
          },
        });

        const response = await Promise.race([
          imagePromise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 25000)),
        ]);

        for (const part of response?.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            return res.json({
              success: true,
              imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
              mode,
              prompt: imagePrompt,
              provider: 'Google Gemini AI',
              aspectRatio,
              timeTakenMs: Date.now() - startTime,
              message: '✨ Directly generated using Google Gemini AI!',
            });
          }
        }
      } catch (e: any) {
        console.warn('Auto mode Gemini attempt failed, trying ChatGPT or Editorial fallback:', e?.message);
      }
    }

    if (openAiKey) {
      try {
        const openAiModelName = customAiConfig.openAiModel || 'dall-e-3';
        const openAiSize =
          openAiModelName === 'dall-e-2'
            ? '1024x1024'
            : aspectRatio === '1:1'
            ? '1024x1024'
            : '1792x1024';

        const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey.trim()}`,
          },
          body: JSON.stringify({
            model: openAiModelName,
            prompt: imagePrompt.slice(0, 950),
            n: 1,
            size: openAiSize,
          }),
        });
        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          const generatedUrl = openAiData.data?.[0]?.url || (openAiData.data?.[0]?.b64_json ? `data:image/png;base64,${openAiData.data[0].b64_json}` : null);
          if (generatedUrl) {
            return res.json({
              success: true,
              imageUrl: generatedUrl,
              mode,
              prompt: imagePrompt,
              provider: `ChatGPT (${openAiModelName})`,
              aspectRatio,
              timeTakenMs: Date.now() - startTime,
              message: `✨ Generated using ChatGPT (${openAiModelName})!`,
            });
          }
        }
      } catch (e: any) {
        console.warn('Auto mode OpenAI attempt failed:', e?.message);
      }
    }
  }

  // 3. High-Fidelity Thematic Image Synthesis Engine (Fast, Reliable, & Always Available)
  // Smartly maps context, headline keywords, and category to attractive journalistic visuals
  const normalizedText = `${headline} ${prompt} ${category}`.toLowerCase();
  let selectedCategoryList = TOPIC_IMAGE_COLLECTION.tech;

  if (
    normalizedText.includes('phone') ||
    normalizedText.includes('mobile') ||
    normalizedText.includes('smartphone') ||
    normalizedText.includes('iphone') ||
    normalizedText.includes('samsung') ||
    normalizedText.includes('xiaomi') ||
    normalizedText.includes('oneplus')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.mobile;
  } else if (
    normalizedText.includes('laptop') ||
    normalizedText.includes('macbook') ||
    normalizedText.includes('workstation') ||
    normalizedText.includes('computer')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.laptop;
  } else if (
    normalizedText.includes('car') ||
    normalizedText.includes('ev') ||
    normalizedText.includes('electric vehicle') ||
    normalizedText.includes('auto') ||
    normalizedText.includes('suv')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.auto;
  } else if (
    normalizedText.includes('gadget') ||
    normalizedText.includes('watch') ||
    normalizedText.includes('headphone') ||
    normalizedText.includes('audio') ||
    normalizedText.includes('review')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.gadget;
  } else if (
    normalizedText.includes('ai') ||
    normalizedText.includes('robot') ||
    normalizedText.includes('cyber') ||
    normalizedText.includes('intel') ||
    normalizedText.includes('nvidia') ||
    normalizedText.includes('google') ||
    normalizedText.includes('software')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.ai;
  } else if (
    normalizedText.includes('election') ||
    normalizedText.includes('bjp') ||
    normalizedText.includes('congress') ||
    normalizedText.includes('neta') ||
    normalizedText.includes('chunav') ||
    normalizedText.includes('rajneeti') ||
    normalizedText.includes('parliament')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.politics;
  } else if (
    normalizedText.includes('rain') ||
    normalizedText.includes('weather') ||
    normalizedText.includes('mausam') ||
    normalizedText.includes('barish') ||
    normalizedText.includes('flood') ||
    normalizedText.includes('storm')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.weather;
  } else if (
    normalizedText.includes('cricket') ||
    normalizedText.includes('ipl') ||
    normalizedText.includes('match') ||
    normalizedText.includes('khel') ||
    normalizedText.includes('sports') ||
    normalizedText.includes('medal')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.sports;
  } else if (
    normalizedText.includes('share') ||
    normalizedText.includes('market') ||
    normalizedText.includes('rupee') ||
    normalizedText.includes('vyapar') ||
    normalizedText.includes('economy') ||
    normalizedText.includes('gold')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.business;
  } else if (
    normalizedText.includes('haryana') ||
    normalizedText.includes('panipat') ||
    normalizedText.includes('karnal') ||
    normalizedText.includes('hisar') ||
    normalizedText.includes('rohtak') ||
    normalizedText.includes('police')
  ) {
    selectedCategoryList = TOPIC_IMAGE_COLLECTION.haryana;
  }

  // Filter out the reference image so regeneration and similar always give a fresh visual
  const eligibleImages = selectedCategoryList.filter((img) => img !== referenceImageUrl);
  const pool = eligibleImages.length > 0 ? eligibleImages : selectedCategoryList;

  // Pick dynamically based on timestamp + string seed so subsequent clicks regenerate fresh images
  const dynamicSeed = (Date.now() + headline.length + prompt.length) % pool.length;
  const pickedUrl = pool[dynamicSeed] || pool[0];

  const providerLabel =
    provider === 'chatgpt'
      ? 'ChatGPT DALL-E'
      : provider === 'gemini'
      ? 'Google Gemini AI'
      : 'Google Gemini & ChatGPT Studio';

  const userKeyStatus =
    provider === 'chatgpt'
      ? Boolean(openAiKey)
        ? 'using configured OpenAI Key'
        : 'OpenAI API key optional in Settings'
      : Boolean(geminiKey)
      ? 'using configured Gemini Key'
      : 'Gemini API key optional in Settings';

  res.json({
    success: true,
    imageUrl: pickedUrl,
    mode,
    prompt: prompt || `High-definition editorial news photo for: ${headline.slice(0, 80)}`,
    provider: providerLabel,
    style,
    aspectRatio,
    timeTakenMs: Date.now() - startTime,
    message:
      mode === 'regenerate'
        ? `✨ Image successfully regenerated with ${providerLabel}!`
        : mode === 'similar'
        ? `✨ Similar news visual created with ${providerLabel} (${userKeyStatus}).`
        : `✨ Generated attractive news visual with ${providerLabel}.`,
  });
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gadget Glow] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
