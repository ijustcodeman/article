import { type ProfileResponsePayload } from '../dto/profile-response.dto';

type UserWithFollowers = {
  username: string;
  bio: string;
  image: string;
  followers?: { id: number }[];
};

/** Converts a user result into the public profile response payload. */
export function toProfilePayload(user: UserWithFollowers): ProfileResponsePayload {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: (user.followers?.length ?? 0) > 0,
  };
}
