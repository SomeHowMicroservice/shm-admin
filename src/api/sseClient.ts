/* eslint-disable @typescript-eslint/no-explicit-any */
export function createSseConnection(
  endpoint: string,
  onMessage: (data: any) => void,
  onError?: (err: any) => void
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      onMessage(event.data);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE error:", err);
    if (onError) onError(err);
    eventSource.close();
  };

  return eventSource;
}
