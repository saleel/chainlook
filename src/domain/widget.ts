type CreateWidgetInput = {
  id: string;
  title: string;
  definition: object;
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

  definition: object;

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
