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

import { uuidv4 } from '@src/shared/helpers/uuidv4';
import { Role } from '@src/auth/entities/Role';
import { BaseEntity, BeforeInsert, Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ default: true })
    multiFactorEnabled: boolean;

    @Column({ default: true })
    lockoutEnabled: boolean;

    @Column({ nullable: true })
    lockoutEndDateUtc: Date;

    @ManyToMany(() => Role)
    @JoinTable({ name: 'user_role' })
    roles: Role[];

    @BeforeInsert()
    generateId(): void {
        this.id = uuidv4();
    }
}
