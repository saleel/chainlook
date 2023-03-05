import User from './user';

export type DataSource = {
  provider: 'graph' | 'thegraph' | 'ipfs' | 'tableland';
  subgraphId?: string;
  entity?: string;
  orderDirection?: 'asc' | 'desc';
  orderBy?: string;
  skip?: number;
  first?: number;
  filters?: {};
  cid?: string;
  network?: string;
  tableName?: string;
};

export type Field = string;
export type Transformer = string;
export type Aggregation = string;
export type DynamicFieldOperation = string;
export type Formatter = string;

export type Chart = {
  xAxis: {
    dataKey: Field;
    format?: Formatter;
    reversed?: boolean;
  };
  yAxis?: {
    format?: Formatter;
  };
  lines?: [
    {
      dataKey: Field;
      label?: string;
    },
    ...{
      dataKey: Field;
      label?: string;
    }[],
  ];
  bars?: [
    {
      dataKey: Field;
      label?: string;
    },
    ...{
      dataKey: Field;
      label?: string;
    }[],
  ];
  areas?: [
    {
      dataKey: Field;
      label?: string;
    },
    ...{
      dataKey: Field;
      label?: string;
    }[],
  ];
};

export type Table = {
  columns: [
    {
      dataKey: Field;
      label?: string;
      format?: Formatter;
    },
    ...{
      dataKey: Field;
      label?: string;
      format?: Formatter;
    }[],
  ];
};

export type PieChart = {
  dataKey: Field;
  nameKey: Field;
  format?: Formatter;
};

export type Metric = {
  dataKey: Field;
  format?: Formatter;
  unit: string;
};

export type Text = {
  message: Field;
};

export type DataDefinition = {
  source?: DataSource;
  sources?: {
    [k: string]: DataSource;
  };
  join?: {
    [k: string]: Field;
  };
  transforms?: {
    [k: string]: Transformer;
  };
  group?: {
    key: Field;
    aggregations?: {
      [k: string]: Aggregation;
    };
  };
  dynamicFields?: {
    [k: string]: {
      operation?: DynamicFieldOperation;
      fields?: Field[];
    };
  };
};

export type WidgetDefinition = {
  type: 'table' | 'chart' | 'pieChart' | 'metric' | 'text';
  data?: DataDefinition;
  table?: Table;
  chart?: Chart;
  pieChart?: PieChart;
  metric?: Metric;
  text?: Text;
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
