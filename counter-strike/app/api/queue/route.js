import { readData, writeData } from "@/lib/queueData";

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
    const { action, cashierId, name, isActive } = await request.json();

    if (action === "next") {
      const cashier = data.cashiers.find((c) => c.id === cashierId);
      if (cashier) {
        // Find the next available set of 5 numbers
        const currentRange = Math.floor(data.currentTicket / 5);
        const nextRange = currentRange + 1;
        const baseNumber = nextRange * 5;

        // Assign the start of the next range of 5 numbers
        cashier.currentNumber = baseNumber - 4; // Starting number of the set
        cashier.rangeStart = baseNumber - 4;
        cashier.rangeEnd = baseNumber;

        // Update the global ticket counter
        data.currentTicket = baseNumber;
      }
    } else if (action === "addCashier") {
      const newId = Math.max(...data.cashiers.map((c) => c.id)) + 1;

      data.cashiers.push({
        id: newId,
        name,
        currentNumber: 0,
        rangeStart: 0,
        rangeEnd: 0,
        isActive: true,
      });
    } else if (action === "toggleActive") {
      const cashier = data.cashiers.find((c) => c.id === cashierId);
      if (cashier) {
        cashier.isActive = isActive;
      }
    } else if (action === "removeCashier") {
      // Find the index of the cashier to remove
      const cashierIndex = data.cashiers.findIndex((c) => c.id === cashierId);
      if (cashierIndex !== -1) {
        // Remove the cashier from the array
        data.cashiers.splice(cashierIndex, 1);
      }
    } else if (action === "reset") {
      // Reset all cashiers to their starting state
      data.cashiers.forEach((cashier) => {
        cashier.currentNumber = 0;
      });
      data.currentTicket = 0;
      data.lastResetDate = new Date().toDateString();
    }

    writeData(data);
    return Response.json(data);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
