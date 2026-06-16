import { type UserModel } from '../../../generated/prisma/models/User';
import { type UserResponsePayload } from '../dto/user-response.dto';

type UserWithToken = Pick<
  UserModel,
  'username' | 'email' | 'bio' | 'image'
> & {
  token: string;
};

/** Converts a user and JWT into the public authentication response payload. */
export function toUserResponsePayload(user: UserWithToken): UserResponsePayload {
  return {
    username: user.username,
    email: user.email,
    token: user.token,
    bio: user.bio,
    image: user.image,
  };
}
