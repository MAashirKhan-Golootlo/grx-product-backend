import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy {
  public validate(payload: Record<string, unknown>): Record<string, unknown> {
    return payload;
  }
}
