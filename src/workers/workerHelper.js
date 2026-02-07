let worker = null;
let messageId = 0;
const pendingMessages = new Map();

export function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./aleoWorker.js", import.meta.url), {
      type: "module",
    });

    worker.addEventListener("message", (event) => {
      const { id, type, result, error } = event.data;
      const pending = pendingMessages.get(id);
      if (pending) {
        pendingMessages.delete(id);
        if (type === "error") {
          pending.reject(new Error(error));
        } else {
          pending.resolve(result);
        }
      }
    });
  }
  return worker;
}

export function postWorkerMessage(type, payload = {}) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pendingMessages.set(id, { resolve, reject });
    getWorker().postMessage({ type, payload, id });
  });
}
