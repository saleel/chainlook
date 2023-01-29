type WidgetDefinition = {
  type: string;
  data: object;
  chart?: object;
  table?: object;
  metric?: object;
  text?: object;
  pieChart?: object;
}

type CreateWidgetInput = {
  id: string;
  title: string;
  definition: WidgetDefinition;
  authorId: string;
  authorName: string;
  tags: string[];
  version: number;
  forkId?: string;
  forkVersion?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default class Widget {
  id: string;

  title: string;

  definition: WidgetDefinition;

  tags: string[];

  authorId: string;

  authorName: string;

  version: number;

  forkId?: string;

  forkVersion?: number;

  createdAt: Date;

  updatedAt: Date;

  constructor(input: CreateWidgetInput) {
    this.id = input.id;
    this.title = input.title;
    this.definition = input.definition;
    this.tags = input.tags;
    this.authorId = input.authorId;
    this.authorName = input.authorName;
    this.version = input.version;
    this.forkId = input.forkId;
    this.forkVersion = input.forkVersion;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
