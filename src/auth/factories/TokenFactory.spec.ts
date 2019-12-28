import { User } from '@src/auth/entities/User';
import { TokenFactory } from '@src/auth/factories/TokenFactory';
import faker from 'faker';

describe('TokenFactory', () => {
    it('should be defined', () => {
        expect(TokenFactory).toBeDefined();
    });

    describe('create', () => {
        it('should create token object', async () => {
            // Arrange
            const user = { id: faker.random.alphaNumeric() } as User;

            // Act
            const factory = new TokenFactory();
            const result = await factory.create(user);

            // Assert
            expect(result).toBeDefined();
        });
    });
});
