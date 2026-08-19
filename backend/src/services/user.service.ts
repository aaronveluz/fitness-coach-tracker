import { User } from '../models';
import { BaseRepository } from '../models/app.model';
import { BaseService } from './app.services';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }
}

export class UserService extends BaseService<User> {
  constructor() {
    super(new UserRepository());
  }
}
