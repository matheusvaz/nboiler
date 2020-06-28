import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserCommand } from '@src/auth/commands/CreateUserCommand';
import { IssuePasswordRecoverTokenCommand } from '@src/auth/commands/IssuePasswordRecoverTokenCommand';
import { IssueTokenCommand } from '@src/auth/commands/IssueTokenCommand';
import { TokenService } from '@src/auth/services/TokenService';
import { UserService } from '@src/auth/services/UserService';
import { AppModule } from '@src/module';
import faker from 'faker';
import request from 'supertest';
import { PasswordResetRepository } from '@src/auth/repositories/PasswordResetRepository';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let tokenService: TokenService;
    let userService: UserService;
    let passwordResetRepository: PasswordResetRepository;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        tokenService = moduleFixture.get<TokenService>(TokenService);
        userService = moduleFixture.get<UserService>(UserService);
        passwordResetRepository = moduleFixture.get<PasswordResetRepository>(PasswordResetRepository);
    });

    it('should be defined', () => {
        expect(tokenService).toBeDefined();
        expect(userService).toBeDefined();
        expect(passwordResetRepository).toBeDefined();
    });

    describe('/user (POST)', () => {
        it('should respond BAD_REQUEST when command is null', () => {
            return request(app.getHttpServer())
                .post('/token')
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond BAD_REQUEST when name is null', () => {
            const command = new CreateUserCommand();
            command.name = null;
            command.email = faker.internet.email();
            command.password = faker.internet.password(6);

            return request(app.getHttpServer())
                .post('/user')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond BAD_REQUEST when email is null', () => {
            const command = new CreateUserCommand();
            command.name = faker.name.firstName();
            command.email = null;
            command.password = faker.internet.password(6);

            return request(app.getHttpServer())
                .post('/user')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond BAD_REQUEST when password is null', () => {
            const command = new CreateUserCommand();
            command.name = faker.name.firstName();
            command.email = faker.internet.email();
            command.password = null;

            return request(app.getHttpServer())
                .post('/user')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond CREATED when validation passes', () => {
            const command = new CreateUserCommand();
            command.name = faker.name.firstName();
            command.email = faker.internet.email();
            command.password = faker.internet.password(6);

            return request(app.getHttpServer())
                .post('/user')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.CREATED);
        });
    });

    describe('/user/profile (GET)', () => {
        it('should respond UNAUTHORIZED when user is not authenticated', () => {
            return request(app.getHttpServer())
                .get('/user/profile')
                .set('Content-Type', 'application/json')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond UNAUTHORIZED when token is invalid', () => {
            const token = faker.random.alphaNumeric();

            return request(app.getHttpServer())
                .get('/user/profile')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should respond OK when token is invalid', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.email = faker.internet.email();
            createUserCommand.password = faker.internet.password(6);

            await userService.create(createUserCommand);

            const command = new IssueTokenCommand();
            command.email = createUserCommand.email;
            command.password = createUserCommand.password;

            const token = await tokenService.issue(command);

            return request(app.getHttpServer())
                .get('/user/profile')
                .set('Content-Type', 'application/json')
                .set('Authorization', token.accessToken.token)
                .expect(HttpStatus.OK);
        });
    });

    describe('/user/password/recover (GET)', () => {
        it('should respond BAD_REQUEST when command is null', () => {
            return request(app.getHttpServer())
                .get('/user/password/recover')
                .set('Content-Type', 'application/json')
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond BAD_REQUEST when email is null', () => {
            const command = new IssuePasswordRecoverTokenCommand();
            command.email = null;

            return request(app.getHttpServer())
                .get('/user/password/recover')
                .set('Content-Type', 'application/json')
                .send(command)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should respond NO_CONTENT when email is valid', () => {
            const command = new IssuePasswordRecoverTokenCommand();
            command.email = faker.internet.email();

            return request(app.getHttpServer())
                .get('/user/password/recover')
                .set('Content-Type', 'application/json')
                .query(command)
                .expect(HttpStatus.NO_CONTENT);
        });

        it('should respond NO_CONTENT when email is found', async () => {
            const createUserCommand = new CreateUserCommand();
            createUserCommand.name = faker.name.firstName();
            createUserCommand.email = faker.internet.email();
            createUserCommand.password = faker.internet.password(6);

            await userService.create(createUserCommand);

            const command = new IssuePasswordRecoverTokenCommand();
            command.email = createUserCommand.email;

            return request(app.getHttpServer())
                .get('/user/password/recover')
                .set('Content-Type', 'application/json')
                .query(command)
                .expect(HttpStatus.NO_CONTENT);
        });
    });

    describe('/user/password/recover (PATCH)', () => { });

    describe('/password/recover/:token (GET)', () => { });
});
