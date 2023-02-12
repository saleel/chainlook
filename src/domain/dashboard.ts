import User from './user';
import Widget from './widget';

export type DashboardDefinition = {
  title: string;
  elements: {
    widget?: Partial<Widget>;
    text?: { title: string, message: string };
    layout: { i: number, x: number, y: number, w: number, h: number };
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
  starred: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export default class Dashboard {
  id: string;

  slug: string;

  cid?: string;

  title: string;

  user: User;

  tags: string[];

  definition: DashboardDefinition;

  starred: number;

  version: number;

  createdAt: Date;

  updatedAt: Date;

  constructor(input: IDashboard) {
    this.id = input.id;
    this.slug = input.slug;
    this.cid = input.cid;
    this.title = input.title;
    this.tags = input.tags;
    this.user = input.user;
    this.definition = input.definition;
    this.starred = input.starred;
    this.version = input.version;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
