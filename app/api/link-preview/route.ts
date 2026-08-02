import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // Try to ensure the URL is valid and has a protocol
    let finalUrl = targetUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const response = await fetch(finalUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      next: { revalidate: 3600 } // cache for 1 hour if possible
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') 
               || $('meta[name="twitter:title"]').attr('content')
               || $('title').text() 
               || '';
               
    const description = $('meta[property="og:description"]').attr('content') 
                     || $('meta[name="twitter:description"]').attr('content')
                     || $('meta[name="description"]').attr('content') 
                     || '';
                     
    let image = $('meta[property="og:image"]').attr('content') 
             || $('meta[name="twitter:image"]').attr('content')
             || $('link[rel="apple-touch-icon"]').attr('href')
             || '';

    // Fix relative image URLs
    if (image && !/^https?:\/\//i.test(image)) {
      try {
        const urlObj = new URL(finalUrl);
        if (image.startsWith('/')) {
          image = `${urlObj.protocol}//${urlObj.host}${image}`;
        } else {
          image = `${urlObj.protocol}//${urlObj.host}/${image}`;
        }
      } catch (e) {
        // ignore invalid url
      }
    }

    const domain = new URL(finalUrl).hostname.replace('www.', '');

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
      domain,
      url: finalUrl
    });

  } catch (error: any) {
    console.error("Link preview error:", error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
