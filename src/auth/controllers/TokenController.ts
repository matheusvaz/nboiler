import { Body, Controller, Delete, HttpCode, HttpStatus, Patch, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { IssueTokenCommand } from '@src/auth/commands/IssueTokenCommand';
import { RefreshTokenCommand } from '@src/auth/commands/RefreshTokenCommand';
import { Token } from '@src/auth/models/Token';
import { TokenService } from '@src/auth/services/TokenService';
import { AuthenticationRequired } from '@src/shared/guards/AuthenticationRequired';

@Controller('/token')
export class TokenController {
    constructor(private readonly tokenService: TokenService) {}

    @Post('/')
    @UsePipes(IssueTokenCommand.Schema)
    @HttpCode(HttpStatus.OK)
    public async issue(@Body() command: IssueTokenCommand): Promise<Token> {
        return await this.tokenService.issue(command);
    }

    @Patch('/refresh')
    @UsePipes(RefreshTokenCommand.Schema)
    @HttpCode(HttpStatus.OK)
    public async refresh(@Body() command: RefreshTokenCommand): Promise<Token> {
        return await this.tokenService.refresh(command);
    }

    @Delete('/destroy')
    @UseGuards(AuthenticationRequired)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async destroy(@Req() request): Promise<void> {
        await this.tokenService.destroy(request.accessToken);
    }
}
