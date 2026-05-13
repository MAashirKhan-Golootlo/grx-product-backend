import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { TenantService } from '../../tenant/tenant.service';

type IntegrationRequest = Request & { tenant?: TenantEntity };

@Injectable()
export class TenantIntegrationAuthGuard implements CanActivate {
  public constructor(private readonly tenantService: TenantService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IntegrationRequest>();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing Basic Authorization header');
    }

    const encoded = authHeader.slice(6).trim();
    const decoded = this.decodeBasicAuth(encoded);
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex < 1) {
      throw new UnauthorizedException('Invalid Basic Authorization format');
    }

    const clientId = decoded.slice(0, separatorIndex);
    const clientSecret = decoded.slice(separatorIndex + 1);
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Invalid integration credentials');
    }

    const tenant = await this.tenantService.findByIntegrationCredentials(
      clientId,
      clientSecret,
    );
    if (!tenant) {
      throw new UnauthorizedException('Invalid integration credentials');
    }

    req.tenant = tenant;
    return true;
  }

  private decodeBasicAuth(encoded: string): string {
    try {
      return Buffer.from(encoded, 'base64').toString('utf8');
    } catch {
      throw new UnauthorizedException('Invalid Basic Authorization header');
    }
  }
}
