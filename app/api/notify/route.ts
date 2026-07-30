import webpush from 'web-push';
import { NextResponse } from 'next/server';


webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.PRIVAYE_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription object provided in the request body." },
        { status: 400 }
      );
    }

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