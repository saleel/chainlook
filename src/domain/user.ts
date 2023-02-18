type IUser = {
  id: string;
  username?: string;
  address: string;
  createdOn?: Date;
  updatedOn?: Date;
};

export default class User {
  id: string;

  username?: string;

  address: string;

  createdOn?: Date;

  updatedOn?: Date;

  constructor(input: IUser) {
    this.id = input.id;
    this.username = input.username;
    this.address = input.address;
    this.createdOn = input.createdOn;
    this.updatedOn = input.updatedOn;
  }
}
