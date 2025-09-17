/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface EventState {
  isCreating: boolean; // đang trong flow tạo
  isUploading: boolean; // disable form upload
  lastEvent: any | null; // lưu SSE event cuối
  evtSource: EventSource | null;
  setCreating: (creating: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setLastEvent: (event: any) => void;
  connectSSE: () => void;
  disconnectSSE: () => void;
  reset: () => void;
}

export const useEventStore = create<EventState>()(
  immer((set, get) => ({
    isCreating: false,
    isUploading: false,
    lastEvent: null,
    evtSource: null,

    setCreating: (creating) => {
      set((s) => {
        s.isCreating = creating;
        if (creating) s.isUploading = true;
      });
    },

    setUploading: (uploading) => {
      set((s) => {
        s.isUploading = uploading;
      });
    },

    setLastEvent: (event) => {
      set((s) => {
        s.lastEvent = event;
      });
    },
    connectSSE: () => {
      set({ isCreating: true, isUploading: true });

      const url = `${process.env.NEXT_PUBLIC_API_URL}/sse`;
      const evtSource = new EventSource(url, { withCredentials: true });

      const timeoutId = setTimeout(() => {
        set({ isUploading: false });
      }, 10000);

      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.event === "product_image_uploaded") {
          console.log("Image uploaded success")
          clearTimeout(timeoutId);

          set({
            isUploading: false,
            isCreating: false,
          });

          evtSource.close();
        }
      };

      evtSource.onerror = () => {
        clearTimeout(timeoutId);
        evtSource.close();
        set({ isUploading: false, isCreating: false });
      };
    },

    disconnectSSE: () => {
      const es = get().evtSource;
      if (es) es.close();
      set((s) => {
        s.evtSource = null;
      });
    },

    reset: () => {
      const es = get().evtSource;
      if (es) es.close();
      set((s) => {
        s.isCreating = false;
        s.isUploading = false;
        s.lastEvent = null;
        s.evtSource = null;
      });
    },
  }))
);
