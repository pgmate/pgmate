import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService {
  fromJSON(data: object): string {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }
  fromString(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }
  fromStrings(data: string[]): string {
    return crypto.createHash('md5').update(data.join('-')).digest('hex');
  }
  anonymizeUUID(id: string): string {
    const hash = crypto.createHash('md5').update(id).digest('hex');
    return hash.substring(hash.length - 8);
  }
}
