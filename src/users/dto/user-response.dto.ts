import { ApiProperty } from '@nestjs/swagger';

/**
 * Public shape of a user, returned by the API.
 * Deliberately omits `passwordHash` — never send it to a client.
 */
export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
