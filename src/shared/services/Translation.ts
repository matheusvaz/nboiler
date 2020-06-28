import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import fs from 'fs';
import util from 'util';

@Injectable({ scope: Scope.REQUEST })
export class Translation {
    constructor(@Inject(REQUEST) private readonly req) {}

    public t(key: string, ...data: string[]): string {
        const message = this.dictionary()[key];

        return message.includes('{}') ? util.format(message.replace('{}', '%s'), data.join(' ')) : message;
    }

    private dictionary(): string[] {
        const path = `${__dirname}/../i18n`;
        let lang = this.req.query.lang;

        if (lang) {
            lang = lang.replace(/[^-a-zA-Z]+/g, '');
        }

        if (!fs.existsSync(`${path}/${lang}.js`)) {
            lang = process.env.APP_LANG;
        }

        return require(`${path}/${lang}`).default;
    }
}
