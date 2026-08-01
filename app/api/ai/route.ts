import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { transcript, currentTime } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
    }

    const apiKey = "AIzaSyCQhIKrZrB3GybRPWDqtFIakYHtrrBhrnQ";
    const model = "gemini-2.5-flash"; // User specifically requested 2.5 flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are the brain of a voice assistant named Nexus. 
The user is speaking to you. The current time is ${currentTime}.
Parse the user's transcript and return a structured JSON object with NO markdown formatting, just the raw JSON.

Schema:
{
  "intent": "SAVE_MEMORY" | "SCHEDULE_TASK" | "QUERY_MEMORY" | "QUERY_TASKS" | "GENERAL_COMMAND" | "UNKNOWN",
  "topic": "extracted topic or keyword if querying memory (optional)",
  "time_filter": "extracted timeframe like 'today', 'yesterday' if querying (optional)",
  "fact": "extracted fact to save if saving memory (optional)",
  "task": "extracted action item if scheduling (optional)",
  "time_ms_from_now": "calculated milliseconds from now until the scheduled time (optional, required if SCHEDULE_TASK)",
  "command_type": "open_youtube" | "open_github" | "dark_mode" | "form" | "joke" | "coin" | "time" | "creator" | null (for GENERAL_COMMAND)
}

Examples:
- "remember that react is a good library" -> intent: SAVE_MEMORY, fact: "react is a good library"
- "remember that i have to buy sattu at 10pm coming from office" -> intent: SCHEDULE_TASK, task: "buy sattu coming from office", time_ms_from_now: (calculate based on 10pm)
- "what did i tell you about react today" -> intent: QUERY_MEMORY, topic: "react", time_filter: "today"
- "tell me a joke" -> intent: GENERAL_COMMAND, command_type: "joke"
- "am i forgetting anything" or "what tasks do i have" -> intent: QUERY_TASKS
`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: transcript }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", err);
      return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);

  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
