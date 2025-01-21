import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      prompt,
      model = "gpt-3.5-turbo",
      temperature = 0.7,
      top_p = 1,
      presence_penalty = 0,
      frequency_penalty = 0,
      system_message = "You are a helpful assistant.",
    } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    let openAImodel = "gpt-3.5-turbo";
    const allowedModels = [
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-16k",
      "gpt-4",
      "gpt-4-32k",
    ];
    if (allowedModels.includes(model)) {
      openAImodel = model;
    }

    const messages = [
      {
        role: "system",
        content: system_message,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: openAImodel,
        messages,
        max_tokens: 2000,
        temperature,
        top_p,
        presence_penalty,
        frequency_penalty,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || !trimmed.startsWith("data:")) {
              continue;
            }
            const message = trimmed.replace("data: ", "");
            if (message === "[DONE]") {
              controller.close();
              break;
            }
            try {
              const json = JSON.parse(message);
              const token = json.choices?.[0]?.delta?.content || "";
              if (token) {
                const queued = encoder.encode(token);
                controller.enqueue(queued);
              }
            } catch (err) {
              console.error("JSON parse error:", err, trimmed);
            }
          }
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
