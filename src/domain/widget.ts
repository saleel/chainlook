import User from './user';

export type WidgetDataSource = {
  provider?: 'graph' | 'thegraph' | 'ipfs' | 'tableland';
  subgraphId?: string;
  entity?: string;
  orderDirection?: 'asc' | 'desc';
  orderBy?: string;
  skip?: number;
  first?: number;
  filters?: {
    [k: string]: string;
  };
  cid?: string;
  network?: string;
  tableName?: string;
};

export type WidgetDataDefinition = {
  source?: WidgetDataSource;
  sources?: WidgetDataSource[];
  group?: { key: string; aggregations: Record<string, string> };
  join?: Record<string, string>;
  transforms?: Record<string, string>;
  dynamicFields?: Record<string, { operation: string; fields: string[] }>;
};

export type WidgetDefinition = {
  type: 'chart' | 'table' | 'metric' | 'pieChart';
  data?: WidgetDataDefinition;
  chart?: any;
  table?: any;
  metric?: any;
  text?: any;
  pieChart?: any;
};

type IWidget = {
  id: string;
  title: string;
  definition: WidgetDefinition;
  tags: string[];
  version: number;
  forkId?: string;
  forkVersion?: number;
  user: User;
  isPrivate?: boolean;
  createdOn: Date;
  updatedOn: Date;
};

export default class Widget {
  id: string;

  title: string;

  definition: WidgetDefinition;

  tags: string[];

  user: User;

  version: number;

  forkId?: string;

  forkVersion?: number;

  isPrivate?: boolean;

  createdOn: Date;

  updatedOn: Date;

  constructor(input: IWidget) {
    this.id = input.id;
    this.title = input.title;
    this.definition = input.definition;
    this.tags = input.tags?.filter(Boolean);
    this.user = input.user;
    this.version = input.version;
    this.forkId = input.forkId;
    this.forkVersion = input.forkVersion;
    this.isPrivate = input.isPrivate;
    this.createdOn = input.createdOn;
    this.updatedOn = input.updatedOn;
  }
}
