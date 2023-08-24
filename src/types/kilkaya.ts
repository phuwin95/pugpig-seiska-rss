export interface KilkayaResponse {
  meta: Meta;
  links: any[];
  data: Datum[];
  message: string;
}

export interface Datum {
  type: Type;
  id: ID;
  attributes: Attributes;
}

export interface Attributes {
  _id: ID;
  domain: Domain;
  articleView: number;
  url: string;
}

export interface ID {
  domain: Domain;
  url: string;
}

export type Domain = "seiska.fi";

export type Type = "analytics";

export interface Meta {
  from: Date;
  to: Date;
  tz: string;
  aggregate: string[];
  schemaname: string;
  schemaversion: string;
  filter: Filter[];
  prefilter: any[];
  reqtime: number;
  qtime: number;
  qlatency: number;
  cached: boolean;
  cacheid: string;
  cachetimeout: number;
  progress: null;
  resulttimestamp: Date;
  delayed: boolean;
}

export interface Filter {
  column: string;
  operator: string;
  value: Domain;
}
