import webpush from 'web-push';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.PRIVAYE_KEY as string
);

export async function POST(req: Request) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'subscribe.json');
    
    let fileData;
    try {
      fileData = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      return NextResponse.json(
        { error: "No subscription found! You need to visit localhost:3000 and allow Push Notifications first so the file is created." },
        { status: 404 }
      );
    }
    
    const subscription = JSON.parse(fileData);

    const { title, message } = await req.json();

    const payload = JSON.stringify({
      title: title || "New Notification!",
      body: message || "You have a new alert from Nexus.",
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true, message: "Notification sent!" }, { status: 200 });
  } catch (err) {
    console.error("Error sending push notification:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}