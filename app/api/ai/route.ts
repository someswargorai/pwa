import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { transcript, currentTime } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
    }

    const apiKey = process.env.AI_KEY;
    const model = "gemini-3.5-flash"; // User specifically requested 2.5 flash
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
  "command_type": "open_website" | "open_camera" | "dark_mode" | "form" | "joke" | "coin" | "time" | "creator" | null (for GENERAL_COMMAND)",
  "app_uri": "The native app deep link URI scheme if the user wants to open a specific app (e.g. 'youtube://', 'instagram://app', 'twitter://', 'spotify:search:shape+of+you'). Required if open_website and it is a known app.",
  "website_url": "The full standard https fallback url to open (e.g. 'https://www.youtube.com/'). Required if open_website."
}

Examples:
- "remember that react is a good library" -> intent: SAVE_MEMORY, fact: "react is a good library"
- "remember that i have to buy sattu at 10pm coming from office" -> intent: SCHEDULE_TASK, task: "buy sattu coming from office", time_ms_from_now: (calculate based on 10pm)
- "what did i tell you about react today" -> intent: QUERY_MEMORY, topic: "react", time_filter: "today"
- "tell me a joke" -> intent: GENERAL_COMMAND, command_type: "joke"
- "open instagram" -> intent: GENERAL_COMMAND, command_type: "open_website", app_uri: "instagram://app", website_url: "https://instagram.com"
- "open mkbhd video on youtube" -> intent: GENERAL_COMMAND, command_type: "open_website", app_uri: "youtube://results?search_query=mkbhd", website_url: "https://www.youtube.com/results?search_query=mkbhd"
- "play shape of you on spotify" -> intent: GENERAL_COMMAND, command_type: "open_website", app_uri: "spotify:search:shape+of+you", website_url: "https://open.spotify.com/search/shape%20of%20you"
- "open bill gates linkedin profile" -> intent: GENERAL_COMMAND, command_type: "open_website", app_uri: "linkedin://", website_url: "https://www.linkedin.com/search/results/all/?keywords=bill%20gates"
- "open camera" or "take a photo" -> intent: GENERAL_COMMAND, command_type: "open_camera"
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
    let resultText = data.candidates[0].content.parts[0].text;
    
    // Remove markdown code block if Gemini wrapped it
    if (resultText.startsWith("```")) {
      resultText = resultText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    }
    
    let resultJson;
    try {
      resultJson = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse AI response. Raw text was:", resultText);
      throw e;
    }

    return NextResponse.json(resultJson);

  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
