import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { Request } from 'express';

@Injectable()
export class AuthService {
  async getUserKey(req: Request): Promise<string> {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return `ip:${this.getClientIp(req)}`;
    if (!process.env.CLERK_SECRET_KEY) return `ip:${this.getClientIp(req)}`;
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
