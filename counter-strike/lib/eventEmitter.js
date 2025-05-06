import { EventEmitter } from "events";

let eventEmitterInstance;

function getEventEmitter() {
  if (!eventEmitterInstance) {
    eventEmitterInstance = new EventEmitter();
    eventEmitterInstance.setMaxListeners(100);
  }
  return eventEmitterInstance;
}

export const eventEmitter = getEventEmitter();
