import { readData, writeData } from "@/lib/queueData";
import { eventEmitter } from "@/lib/eventEmitter";
 
export const dynamic = "force-dynamic";
 
export async function GET() {
  try {
    const data = readData();
    return Response.json(data);
  } catch (error) {
    console.error("Error in GET handler:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
 
export async function POST(request) {
  try {
    const data = readData();
    const { action, cashierId, name, isActive, rangeSize, priorityRangeSize, type } = await request.json();
 
    // Set range size for regular counters
    if (action === "setRangeSize") {
      if (!Number.isInteger(rangeSize) || rangeSize < 1) {
        return Response.json({ error: "Invalid range size" }, { status: 400 });
      }
      data.rangeSize = rangeSize;
      writeData(data);
      eventEmitter.emit("update", data);
      return Response.json({ success: true, rangeSize });
    }
 
    // Set range size for priority counters
    if (action === "setPriorityRangeSize") {
      if (!Number.isInteger(priorityRangeSize) || priorityRangeSize < 1) {
        return Response.json({ error: "Invalid priority range size" }, { status: 400 });
      }
      data.priorityRangeSize = priorityRangeSize;
      writeData(data);
      eventEmitter.emit("update", data);
      return Response.json({ success: true, priorityRangeSize });
    }
 
    // Add cashier (Regular or Priority)
    if (action === "addCashier") {
      const newId =
        data.cashiers.length > 0
          ? Math.max(...data.cashiers.map((c) => c.id)) + 1
          : 1;
      data.cashiers.push({
        id: newId,
        name,
        type: type === "priority" ? "priority" : "regular",
        currentNumber: 0,
        rangeStart: 0,
        rangeEnd: 0,
        isActive: true,
      });
    }
 
    // Next for cashier (Regular or Priority)
    else if (action === "next") {
      const cashier = data.cashiers.find((c) => c.id === cashierId);
      if (cashier) {
        if (cashier.type === "priority") {
          // Use priorityRangeSize for priority counters
          const size = data.priorityRangeSize || 5;
          if (!("priorityCurrentTicket" in data)) data.priorityCurrentTicket = 0;
          const currentRange = Math.floor((data.priorityCurrentTicket || 0) / size);
          const nextRange = currentRange + 1;
          const baseNumber = nextRange * size;
 
          cashier.currentNumber = baseNumber - (size - 1);
          cashier.rangeStart = baseNumber - (size - 1);
          cashier.rangeEnd = baseNumber;
          data.priorityCurrentTicket = baseNumber;
        } else {
          // Use rangeSize for regular counters
          const size = data.rangeSize || 5;
          const currentRange = Math.floor(data.currentTicket / size);
          const nextRange = currentRange + 1;
          const baseNumber = nextRange * size;
 
          cashier.currentNumber = baseNumber - (size - 1);
          cashier.rangeStart = baseNumber - (size - 1);
          cashier.rangeEnd = baseNumber;
          data.currentTicket = baseNumber;
        }
      }
    }
 
    // Toggle Active
    else if (action === "toggleActive") {
      const cashier = data.cashiers.find((c) => c.id === cashierId);
      if (cashier) {
        cashier.isActive = isActive;
      }
    }
 
    // Remove Cashier
    else if (action === "removeCashier") {
      const cashierIndex = data.cashiers.findIndex((c) => c.id === cashierId);
      if (cashierIndex !== -1) {
        data.cashiers.splice(cashierIndex, 1);
      }
    }
 
    // Reset All
    else if (action === "reset") {
      data.cashiers.forEach((cashier) => {
        cashier.currentNumber = 0;
        cashier.rangeStart = 0;
        cashier.rangeEnd = 0;
      });
      data.currentTicket = 0;
      data.priorityCurrentTicket = 0;
      data.lastResetDate = new Date().toISOString();
    }
 
    writeData(data);
    eventEmitter.emit("update", data);
    return Response.json(data);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}