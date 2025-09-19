/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface EventState {
  isCreating: boolean;
  isUploading: boolean;
  isCreatingPost: boolean;
  isUploadingPost: boolean;
  lastEvent: any | null;
  fromCreate: boolean;
  evtSource: EventSource | null;
  setCreating: (creating: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setCreatingPost: (creating: boolean) => void;
  setUploadingPost: (uploading: boolean) => void;
  setLastEvent: (event: any) => void;
  setFromCreate: (from: boolean) => void;
  connectSSE: (id: string, type: string) => void;
  disconnectSSE: () => void;
  reset: () => void;
}

export const useEventStore = create<EventState>()(
  immer((set, get) => ({
    isCreating: false,
    isUploading: false,
    isCreatingPost: false,
    isUploadingPost: false,
    lastEvent: null,
    fromCreate: false,
    evtSource: null,

    setFromCreate: (from) => {
      set((s) => {
        s.fromCreate = from;
      });
    },

    setCreatingPost: (creating) => {
      set((s) => {
        s.isCreatingPost = creating;
        if (creating) s.isUploadingPost = true;
      });
    },

    setUploadingPost: (uploading) => {
      set((s) => {
        s.isUploadingPost = uploading;
      });
    },

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

    connectSSE: (id: string, type: string) => {
      const existingEvtSource = get().evtSource;
      if (existingEvtSource) {
        console.log("🔌 Closing existing SSE connection");
        existingEvtSource.close();
      }

      if (type === "product") set({ isCreating: true, isUploading: true });
      if (type === "post") set({ isCreatingPost: true, isUploadingPost: true });
      const url = `${process.env.NEXT_PUBLIC_API_URL}/sse`;
      const evtSource = new EventSource(url, { withCredentials: true });

      const timeoutId = setTimeout(() => {
        if (type === "product") {
          set({ isUploading: false, isCreating: false });
        }
        if (type === "post") {
          set({ isUploadingPost: false, isCreatingPost: false });
        }

        evtSource.close();
      }, 10000);

      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        console.log(data);

        if (data.event === "product_image_uploaded" && data.product_id === id) {
          clearTimeout(timeoutId);

          set({
            isUploading: false,
            isCreating: false,
          });

          evtSource.close();
        }

        if (data.event === "post_image_uploaded" && data.post_id === id) {
          clearTimeout(timeoutId);

          set({
            isCreatingPost: false,
            isUploadingPost: false,
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
