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

import { EntityManager, getManager } from 'typeorm';

export class Transaction {
    public async start<T>(
        callback: (entityManager: EntityManager) => Promise<T>,
    ): Promise<T> {
        return await getManager().transaction<T>(callback);
    }
}
