import fs from "fs";
import path from "path";
import { eventEmitter } from "./eventEmitter";

const dataPath = path.join(process.cwd(), "data", "queue.json");

export function readData() {
  try {
    if (!fs.existsSync(dataPath)) {
      const initialData = {
        currentTicket: 0,
        lastResetDate: new Date().toDateString(),
        cashiers: [
          {
            id: 1,
            name: "Window 1",
            currentNumber: 0,
            rangeStart: 0,
            rangeEnd: 0,
            isActive: true,
          },
        ],
        currentTicket: 0,
        lastResetDate: new Date().toDateString(),
      };
      fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const today = new Date().toDateString();

    if (data.lastResetDate !== today) {
      const resetData = {
        ...data,
        currentTicket: 0,
        lastResetDate: today,
        cashiers: data.cashiers.map((cashier) => ({
          ...cashier,
          currentNumber: 0,
        })),
      };
      writeData(resetData);
      return resetData;
    }

    return data;
  } catch (error) {
    console.error("Error reading queue data:", error);
    throw new Error("Failed to read queue data");
  }
}

export function writeData(data) {
  try {
    const dataToWrite = {
      ...data,
      lastResetDate: data.lastResetDate || new Date().toDateString(),
    };
    fs.writeFileSync(dataPath, JSON.stringify(dataToWrite, null, 2));
    eventEmitter.emit("update", dataToWrite);
  } catch (error) {
    console.error("Error writing queue data:", error);
    throw new Error("Failed to write queue data");
  }
}
