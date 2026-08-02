import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import { Receiver } from '@upstash/qstash';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// Initialize lazily in the POST handler to avoid build-time errors
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    // 1. Verify QStash Signature to ensure the request is actually from QStash
    const bodyText = await req.text();
    const signature = req.headers.get('upstash-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing upstash-signature header' }, { status: 401 });
    }

    const isValid = await receiver.verify({
      signature,
      body: bodyText,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse the payload
    const { title, body, email, push, pushSubscription } = JSON.parse(bodyText);

    const promises = [];

    // 3. Send Email Notification
    if (email) {
      promises.push(
        transporter.sendMail({
          from: process.env.SMTP_USER,
          to: process.env.SMTP_USER, // Send to self as requested
          subject: title,
          text: body,
          html: `<h2>${title}</h2><p>${body}</p>`,
        })
      );
    }

    // 4. Send Web Push Notification
    if (push && pushSubscription) {
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.PRIVATE_KEY) {
        console.error("Missing VAPID keys");
      } else {
        webpush.setVapidDetails(
          'mailto:somgorai726@gmail.com',
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          process.env.PRIVATE_KEY
        );
        promises.push(
          webpush.sendNotification(
            pushSubscription,
            JSON.stringify({ title, body, icon: '/icon-192.jpg' })
          ).catch((pushErr) => {
            console.error("WEB PUSH FAILED DETAILED LOG:", {
              errorName: pushErr?.name,
              errorMessage: pushErr?.message,
              endpoint: pushSubscription?.endpoint,
              statusCode: pushErr?.statusCode,
              body: pushErr?.body
            });
            throw pushErr;
          })
        );
      }
    }

    const results = await Promise.allSettled(promises);
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`Promise ${i} rejected:`, r.reason);
      }
    });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Trigger execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
