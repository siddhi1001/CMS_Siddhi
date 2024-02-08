export class StatusRequest {
  status: string;
  SetStatusRow: SetStatusRow[];
}

export class SetStatusRow {
  subworkid: string;
  dataid: string;
  isCC: string;
  transID: string;
  NotesComplete: string;
  currentStatus: string;
  userid: string;
}
