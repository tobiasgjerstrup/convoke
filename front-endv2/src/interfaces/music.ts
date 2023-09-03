export interface playlist {
  id: number;
  name: string;
  createdOn: string;
  lastModifiedOn: string;
  lastModifiedBy: string;
  createdBy: string;
  active: number;
}

export interface song {
  id: number;
  playlist: number;
  name: string;
  url: string;
  addedOn: string;
  lastModifiedOn: string;
  lastModifiedBy: string;
  addedBy: string;
  active: number;
}
