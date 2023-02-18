import User from './user';

export type WidgetDefinition = {
  type: string;
  data?: object;
  chart?: object;
  table?: object;
  metric?: object;
  text?: object;
  pieChart?: object;
}

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
