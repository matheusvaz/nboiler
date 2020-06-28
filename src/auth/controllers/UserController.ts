import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import { ChangePasswordCommand } from '@src/auth/commands/ChangePasswordCommand';
import { CheckPasswordRecoveryTokenCommand } from '@src/auth/commands/CheckPasswordRecoveryTokenCommand';
import { CreateUserCommand } from '@src/auth/commands/CreateUserCommand';
import { IssuePasswordRecoverTokenCommand } from '@src/auth/commands/IssuePasswordRecoverTokenCommand';
import { Profile } from '@src/auth/models/Profile';
import { UserService } from '@src/auth/services/UserService';
import { AuthenticationRequired } from '@src/shared/guards/AuthenticationRequired';

@Controller('/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/')
    @UsePipes(CreateUserCommand.Schema)
    @HttpCode(HttpStatus.CREATED)
    public async create(@Body() command: CreateUserCommand): Promise<void> {
        await this.userService.create(command);
    }

    @Get('/profile')
    @UseGuards(AuthenticationRequired)
    @HttpCode(HttpStatus.OK)
    public async profile(@Req() request): Promise<Profile> {
        return await this.userService.getProfile(request.userId);
    }

    @Get('/password/recover')
    @UsePipes(IssuePasswordRecoverTokenCommand.Schema)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async recoverPassword(@Query() command: IssuePasswordRecoverTokenCommand): Promise<void> {
        await this.userService.issuePasswordRecoverToken(command);
    }

    @Patch('/password/recover')
    @UsePipes(ChangePasswordCommand.Schema)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async changePassword(@Body() command: ChangePasswordCommand): Promise<void> {
        await this.userService.changePassword(command);
    }

    @Get('/password/recover/:token')
    @UsePipes(CheckPasswordRecoveryTokenCommand.Schema)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async checkPasswordRecoveryToken(@Param() command: CheckPasswordRecoveryTokenCommand): Promise<void> {
        await this.userService.checkPasswordRecoveryToken(command);
    }
}
