import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    console.log("📥 Received Form Submission:", data);

    // In a real application, you would save this to a database here.
    // For now, we simulate processing delay and return success.
    
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

    return NextResponse.json({ success: true, message: "Form submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing form:", error);
    return NextResponse.json({ success: false, error: "Failed to process form" }, { status: 500 });
  }
}
