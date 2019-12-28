/*
 *           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                    Version 2, December 2004
 *
 * Copyright (C) 2019 Matheus Vaz <git@matheusvaz.com>
 *
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 *           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

import sodium from 'libsodium-wrappers';

export class Crypto {
    public static async genericHash(
        message: string,
        key?: string,
    ): Promise<string> {
        await sodium.ready;

        return sodium.to_base64(
            sodium.crypto_generichash(
                sodium.crypto_generichash_BYTES_MAX,
                message,
                key,
            ),
        );
    }

    public static async passwordHash(password: string): Promise<string> {
        await sodium.ready;
        return sodium.crypto_pwhash_str(
            password,
            sodium.crypto_pwhash_OPSLIMIT_MODERATE,
            65536 << 10,
        );
    }

    public static async passwordHashVerify(
        hashedPassword: string,
        password: string,
    ): Promise<boolean> {
        await sodium.ready;
        return sodium.crypto_pwhash_str_verify(hashedPassword, password);
    }

    public static async random(size: number): Promise<string> {
        await sodium.ready;
        return sodium.to_string(sodium.randombytes_buf(size));
    }

    public static async token(): Promise<string> {
        await sodium.ready;
        return sodium.to_base64(sodium.randombytes_buf(64));
    }
}
