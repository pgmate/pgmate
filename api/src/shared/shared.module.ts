import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { CookieService } from './services/cookie.service';
import { HashService } from './services/hash.service';
import { JwtService } from './services/jwt.service';

@Global()
@Module({
  providers: [EncryptionService, JwtService, CookieService, HashService],
  exports: [EncryptionService, JwtService, CookieService, HashService],
  imports: [HttpModule],
})
export class SharedModule {}
