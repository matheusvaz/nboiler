import { UserFactory } from '@src/auth/factories/UserFactory';
import faker from 'faker';

describe('UserFactory', () => {
    it('should be defined', () => {
        expect(UserFactory).toBeDefined();
    });

    describe('create', () => {
        it('should create token object', async () => {
            // Arrange
            const command = {
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(6),
            };

            // Act
            const factory = new UserFactory();
            const result = await factory.create(
                command.name,
                command.email,
                command.password,
            );

            // Assert
            expect(result).toBeDefined();
        });
    });
});
