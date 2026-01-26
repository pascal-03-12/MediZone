/// <reference types="vite/client" />

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: DataView;
  encoding?: string;
  lang?: string;
  toRecords?: () => NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber: string;
}

interface NDEFReader extends EventTarget {
  scan: (options?: { signal: AbortSignal }) => Promise<void>;
  write: (message: any, options?: { signal: AbortSignal }) => Promise<void>;
  onreading: (event: NDEFReadingEvent) => void;
  onreadingerror: (error: Event) => void;
}

declare class NDEFReader {
  constructor();
}