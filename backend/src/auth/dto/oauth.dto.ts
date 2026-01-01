import { IsString, IsEnum } from 'class-validator';

export class GoogleOAuthLoginDto {
  @IsString()
  firebaseToken: string;
}

export class LinkSocialAccountDto {
  @IsEnum(['GOOGLE', 'FACEBOOK', 'GITHUB'])
  provider: string;

  @IsString()
  firebaseToken: string;
}
