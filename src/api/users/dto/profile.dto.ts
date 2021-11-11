export class Profile {
  constructor(params: ProfileDto) {
    Object.assign(this, params);
  }
}

export interface ProfileDto {
  id: string;
  username: string;
  avatar: string;
  pushcartPoints: number;
  notificationsLevel: number;
  lastUpdate: string;
  steamId?: string;
  roles: string[];
}
