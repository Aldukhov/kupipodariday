import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 250)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 1500)
  description: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;
}
