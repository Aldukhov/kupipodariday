import { PartialType } from '@nestjs/mapped-types';
import { CreateWishlistDto } from './create-wishlist.dto';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsOptional()
  @IsString()
  @Length(2, 250)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 1500)
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}
