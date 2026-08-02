import { NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';

const client = new Client({
  baseUrl: process.env.QSTASH_URL || "https://qstash-us-east-1.upstash.io",
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { delayStr, title, body, email, push, pushSubscription } = await req.json();

    if (!delayStr) {
      return NextResponse.json({ error: 'Missing delay' }, { status: 400 });
    }

    const triggerUrl = `${process.env.NEXT_PUBLIC_URL}/api/trigger`;

    const res = await client.publishJSON({
      url: triggerUrl,
      body: {
        title,
        body,
        email,
        push,
        pushSubscription
      },
      delay: delayStr, // e.g. "120s" or "2h"
    });

    return NextResponse.json({ success: true, messageId: res.messageId });
  } catch (error: any) {
    console.error("QStash Publish Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to schedule notification' }, { status: 500 });
  }
}
