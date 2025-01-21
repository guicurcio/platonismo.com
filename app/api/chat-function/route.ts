import { NextResponse } from "next/server";

/**
 * Define a message type that matches the structure
 * used in the conversation array.
 */
interface ChatMessage {
  role: "system" | "user" | "assistant" | "function";
  name?: string;
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

/**
 * Example function to demonstrate how you'd handle GPT's function_call.
 * In production, replace this with your real logic, e.g. call a weather API.
 */
async function getWeather(city: string, days: number) {
  // Fake data for demonstration
  return {
    city,
    days,
    forecast: [
      { day: 1, weather: "Sunny", high: 72, low: 58 },
      { day: 2, weather: "Partly Cloudy", high: 70, low: 57 },
      { day: 3, weather: "Rainy", high: 65, low: 55 },
    ].slice(0, days),
  };
}

// Hard-coded function definitions for GPT
const functions = [
  {
    name: "getWeather",
    description: "Get the weather forecast for a given city and number of days.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The city for which to get the weather forecast",
        },
        days: {
          type: "number",
          description: "Number of days of forecast data needed",
          default: 1,
        },
      },
      required: ["city"],
    },
  },
];

export async function POST(req: Request) {
  try {
    const {
      messages, // array of {role, content}, or single user prompt
      model = "gpt-3.5-turbo",
      temperature = 0.7,
      top_p = 1,
      presence_penalty = 0,
      frequency_penalty = 0,
      system_message = "You are a helpful assistant. You can call functions if needed.",
    } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    /**
     * Convert `messages` into an array of ChatMessage.
     * If `messages` is just a single user string (instead of an array),
     * wrap it with system and user roles.
     */
    let msgs: ChatMessage[] = messages;
    if (!Array.isArray(messages)) {
      msgs = [
        { role: "system", content: system_message },
        { role: "user", content: String(messages || "") },
      ];
    } else {
      // Ensure we have at least one system message (optional, but often useful)
      const hasSystem = msgs.some((m) => m.role === "system");
      if (!hasSystem) {
        msgs.unshift({ role: "system", content: system_message });
      }
    }

    // First call to see if GPT wants to call a function
    const firstResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body: JSON.stringify({
        model,
        messages: msgs,
        functions,
        function_call: "auto", // let GPT decide
        temperature,
        top_p,
        presence_penalty,
        frequency_penalty,
        // Non-streaming
        stream: false,
      }),
    });

    if (!firstResponse.ok) {
      const errorText = await firstResponse.text();
      return NextResponse.json({ error: errorText }, { status: firstResponse.status });
    }

    const firstData = await firstResponse.json();
    const firstMsg = firstData.choices?.[0]?.message;
    if (!firstMsg) {
      return NextResponse.json({ error: "No message returned" }, { status: 500 });
    }

    // Check if GPT decided to call a function
    const functionCall = firstMsg.function_call;
    if (!functionCall) {
      // No function call, just return the text
      const text = firstMsg.content || "";
      return NextResponse.json({ content: text });
    }

    // Parse the function call
    const { name, arguments: argStr } = functionCall;
    let parsedArgs;
    try {
      parsedArgs = JSON.parse(argStr);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON in function call" }, { status: 400 });
    }

    // Handle function logic
    let functionResult: any;
    switch (name) {
      case "getWeather":
        functionResult = await getWeather(parsedArgs.city, parsedArgs.days ?? 1);
        break;
      default:
        return NextResponse.json({ error: `Unknown function: ${name}` }, { status: 400 });
    }

    // Now we give the model the result of the function call in a new function role message
    msgs.push({
      role: "function",
      name,
      content: JSON.stringify(functionResult),
    });

    // Second call: let GPT incorporate the function result into a final answer
    const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body: JSON.stringify({
        model,
        messages: msgs,
        temperature,
        top_p,
        presence_penalty,
        frequency_penalty,
        stream: false,
      }),
    });

    if (!secondResponse.ok) {
      const errorText = await secondResponse.text();
      return NextResponse.json({ error: errorText }, { status: secondResponse.status });
    }

    const secondData = await secondResponse.json();
    const finalMsg = secondData.choices?.[0]?.message;
    const finalText = finalMsg?.content || "";

    return NextResponse.json({ content: finalText });
  } catch (error) {
    console.error("chat-function route error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
