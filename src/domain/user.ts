type IUser = {
  id: string;
  username?: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export default class User {
  id: string;

  username?: string;

  address: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(input: IUser) {
    this.id = input.id;
    this.username = input.username;
    this.address = input.address;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
