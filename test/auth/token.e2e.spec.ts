import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserCommand } from '@src/auth/commands/CreateUserCommand';
import { IssueTokenCommand } from '@src/auth/commands/IssueTokenCommand';
import { RefreshTokenCommand } from '@src/auth/commands/RefreshTokenCommand';
import { TokenService } from '@src/auth/services/TokenService';
import { UserService } from '@src/auth/services/UserService';
import { AppModule } from '@src/module';
import faker from 'faker';
import request from 'supertest';

describe('TokenController (e2e)', () => {
    let app: INestApplication;
    let tokenService: TokenService;
    let userService: UserService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        tokenService = moduleFixture.get<TokenService>(TokenService);
        userService = moduleFixture.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(tokenService).toBeDefined();
        expect(userService).toBeDefined();
    });

    describe('/token (POST)', () => {
        it('should respond BAD_REQUEST when command is null', () => {
            return request(app.getHttpServer())
                .post('/token')
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond BAD_REQUEST when email is null', () => {
            const command = new IssueTokenCommand();
            command.email = null;
            command.password = faker.internet.password();

            return request(app.getHttpServer())
                .post('/token')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond BAD_REQUEST when password is null', () => {
            const command = new IssueTokenCommand();
            command.email = faker.internet.email();
            command.password = null;

            return request(app.getHttpServer())
                .post('/token')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond UNAUTHORIZED when user does not exists and validation passes', async () => {
            const command = new IssueTokenCommand();
            command.email = faker.internet.email();
            command.password = faker.internet.password();

            return request(app.getHttpServer())
                .post('/token')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond UNAUTHORIZED when user exists and email is incorrect', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.email = faker.internet.email();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.password = faker.internet.password(6);

            await userService.create(createUserCommand);

            const command = new IssueTokenCommand();
            command.email = faker.internet.email();
            command.password = createUserCommand.password;

            return request(app.getHttpServer())
                .post('/token')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond UNAUTHORIZED when user exists and password is incorrect', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.email = faker.internet.email();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.password = faker.internet.password(6);

            await userService.create(createUserCommand);

            const command = new IssueTokenCommand();
            command.email = createUserCommand.email;
            command.password = faker.internet.password(8);

            return request(app.getHttpServer())
                .post('/token')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond OK when user exists and credentials is correct', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.email = faker.internet.email();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.password = faker.internet.password(6);

            await userService.create(createUserCommand);

            const command = new IssueTokenCommand();
            command.email = createUserCommand.email;
            command.password = createUserCommand.password;

            return request(app.getHttpServer())
                .post('/token')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.OK);
        });
    });

    describe('/token/refresh (PATCH)', () => {
        it('should respond BAD_REQUEST when command is null', () => {
            return request(app.getHttpServer())
                .patch('/token/refresh')
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond BAD_REQUEST when refreshToken is null', () => {
            const command = new RefreshTokenCommand();
            command.refreshToken = null;

            return request(app.getHttpServer())
                .patch('/token/refresh')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond UNAUTHORIZED when refreshToken does not exists', () => {
            const command = new RefreshTokenCommand();
            command.refreshToken = faker.random.alphaNumeric();

            return request(app.getHttpServer())
                .patch('/token/refresh')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond UNAUTHORIZED when refreshToken is not a refresh token', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.email = faker.internet.email();
            createUserCommand.password = faker.internet.password(6);

            const issueTokenCommand = new IssueTokenCommand();
            issueTokenCommand.email = createUserCommand.email;
            issueTokenCommand.password = createUserCommand.password;

            await userService.create(createUserCommand);
            const token = await tokenService.issue(issueTokenCommand);

            const command = new RefreshTokenCommand();
            command.refreshToken = token.accessToken.token;

            return request(app.getHttpServer())
                .patch('/token/refresh')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond OK when refreshToken is correct', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.email = faker.internet.email();
            createUserCommand.password = faker.internet.password(6);

            const issueTokenCommand = new IssueTokenCommand();
            issueTokenCommand.email = createUserCommand.email;
            issueTokenCommand.password = createUserCommand.password;

            await userService.create(createUserCommand);
            const token = await tokenService.issue(issueTokenCommand);

            const command = new RefreshTokenCommand();
            command.refreshToken = token.refreshToken.token;

            return request(app.getHttpServer())
                .patch('/token/refresh')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.OK);
        });
    });

    describe('/token/destroy (DELETE)', () => {
        it('should respond UNAUTHORIZED when user is not authenticated', () => {
            return request(app.getHttpServer())
                .delete('/token/destroy')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond NO_CONTENT when user is authenticated', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.email = faker.internet.email();
            createUserCommand.password = faker.internet.password(6);

            const issueTokenCommand = new IssueTokenCommand();
            issueTokenCommand.email = createUserCommand.email;
            issueTokenCommand.password = createUserCommand.password;

            await userService.create(createUserCommand);
            const token = await tokenService.issue(issueTokenCommand);

            return request(app.getHttpServer())
                .delete('/token/destroy')
                .set('Content-Type', 'application/json')
                .set('Authorization', token.accessToken.token)
                .expect(HttpStatus.NO_CONTENT);
        });
    });
});
