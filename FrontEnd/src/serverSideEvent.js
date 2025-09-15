let eventSource = null;
const listeners = [];

const APIUrl =
  process.env.Platform && process.env.Platform.toUpperCase() === "DEV"
    ? process.env.RestApiLocal
    : process.env.RestApiProd;

export const initSSE = () => {
  if (!eventSource) {
    eventSource = new EventSource(`${APIUrl}/doctors-kiosk/sse`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Notify all registered listeners
        listeners.forEach((callback) => callback(data.message));
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection lost. Reconnecting...");
      eventSource.close();
      eventSource = null;
      setTimeout(initSSE, 15000);
    };
  }
};

export const listenEvent = (callback) => {
  listeners.push(callback);
};
