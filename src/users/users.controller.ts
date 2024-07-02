import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { hashPassword } from 'src/utils/bcrypt.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findOne({ id: req.user.id });
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findMany(@Query('search') search: string) {
    return this.usersService.findMany(search);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }
    return this.usersService.update({ id: req.user.id }, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async remove(@Request() req) {
    return this.usersService.remove({ id: req.user.id });
  }
}
