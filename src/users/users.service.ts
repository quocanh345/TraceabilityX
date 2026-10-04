import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './users.repository';
import { UsersRepository } from './users.repository';
import { hashPassword } from './utils/password.util';

/**
 * Business logic for users. Talks only to `UsersRepository` — never to
 * Drizzle/the pool directly — and is what `UsersController` depends on.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<UserResponseDto[]> {
    const rows = await this.usersRepository.findAll();
    return rows.map(toUserResponse);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return toUserResponse(user);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`A user with email "${dto.email}" already exists`);
    }

    const passwordHash = await hashPassword(dto.password);
    const created = await this.usersRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
    });

    return toUserResponse(created);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    // Ensures a 404 is thrown consistently even though `.update()` below
    // would otherwise silently return `undefined` for a missing row.
    await this.findOne(id);

    const updated = await this.usersRepository.update(id, {
      ...dto,
      updatedAt: new Date(),
    });

    return toUserResponse(updated as User);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
  }
}

/** Strips `passwordHash` (and any future sensitive columns) before returning to a client. */
function toUserResponse(user: User): UserResponseDto {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}
