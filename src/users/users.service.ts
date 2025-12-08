import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { Role } from '../common/roles';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async createUser(params: { name: string; email: string; password: string; role?: Role }) {
    const existing = await this.findByEmail(params.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);

    const user = new this.userModel({
      name: params.name,
      email: params.email,
      passwordHash,
      role: params.role ?? Role.User,
    });

    return user.save();
  }
}
