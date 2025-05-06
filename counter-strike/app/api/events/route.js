import { eventEmitter } from "@/lib/eventEmitter";
import { readData } from "@/lib/queueData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stream = new ReadableStream({
      start(controller) {
        try {
          const initialData = readData();
          controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`);

          const listener = (data) => {
            try {
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            } catch (error) {
              console.error("Error sending SSE update:", error);
            }
          };

          eventEmitter.on("update", listener);

          return () => {
            eventEmitter.off("update", listener);
            controller.close();
          };
        } catch (error) {
          console.error("Error in stream start:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
