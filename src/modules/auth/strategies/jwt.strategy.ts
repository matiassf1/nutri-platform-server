import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    this.logger.log(`[JwtStrategy.validate] Validating JWT payload: ${JSON.stringify({
      sub: payload.sub,
      email: payload.email,
      role: payload.role
    })}`);
    
    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      this.logger.warn(`[JwtStrategy.validate] User validation failed for payload: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Invalid token');
    }
    
    this.logger.log(`[JwtStrategy.validate] User validation successful: ${JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patientId
    })}`);
    
    return user;
  }
}
