declare module 'edfjs' {
  export class EDF {
    duration: number
    record_duration: number
    num_records: number
    num_channels: number
    startdatetime: Date
    channel_by_label: Record<string, EdfChannel>
    type: string
    read_buffer(buffer: ArrayBuffer, header_only?: boolean): void
    get annotations(): Array<{ onset: number; duration: number; label: string[] }>
  }

  export class Channel {
    label: string
    sampling_rate: number
    get_physical_samples(t0: number, dt: number | null, n?: number | null): Float32Array | Int16Array
  }

  type EdfChannel = Channel
}
