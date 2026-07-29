import path from "path";
import fs from "fs/promises";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { subscribe } = await req.json();

    const pathJoin = path.join(process.cwd(), "public", "subscribe.json");
    await fs.writeFile(pathJoin, JSON.stringify(subscribe, null, 2));

    return NextResponse.json("subscribe file saved successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
