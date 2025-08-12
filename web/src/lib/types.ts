export type RequestStatus = "pending" | "approved" | "played" | "rejected";
export type SongRequest = {
  id: string;
  song: string;
  artist?: string;
  name?: string; // requester name
  status: RequestStatus;
  time: string; // ISO timestamp
  event_id: string;
};

export type Event = {
  id: string;
  name: string;
  is_live: boolean;
  started_at: string | null;
};

