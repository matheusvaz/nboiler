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

import { User } from '@src/auth/entities/User';
import { uuidv4 } from '@src/shared/helpers/uuidv4';
import {
    BaseEntity,
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';

@Entity('password_reset')
export class PasswordReset extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column()
    token: string;

    @BeforeInsert()
    generateId(): void {
        this.id = uuidv4();
    }
}
