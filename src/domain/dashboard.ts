import User from './user';
import Widget from './widget';

export type DashboardDefinition = {
  title: string;
  elements: {
    widget?: Partial<Widget>;
    text?: { title: string; message: string };
    layout: { i: number; x: number; y: number; w: number; h: number };
  }[];
};

type IDashboard = {
  id: string;
  slug: string;
  cid?: string;
  title: string;
  user: User;
  tags: string[];
  definition: DashboardDefinition;
  starCount: number;
  createdOn: Date;
  updatedOn: Date;
  version: number;
  isPrivate?: boolean;
};

export default class Dashboard {
  id: string;

  slug: string;

  cid?: string;

  title: string;

  user: User;

  tags: string[];

  definition: DashboardDefinition;

  starCount: number;

  version: number;

  isPrivate?: boolean;

  createdOn: Date;

  updatedOn: Date;

  constructor(input: IDashboard) {
    this.id = input.id;
    this.slug = input.slug;
    this.cid = input.cid;
    this.title = input.title;
    this.tags = input.tags;
    this.user = input.user;
    this.definition = input.definition;
    this.starCount = input.starCount;
    this.version = input.version;
    this.isPrivate = input.isPrivate;
    this.createdOn = input.createdOn;
    this.updatedOn = input.updatedOn;
  }
}
