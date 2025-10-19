import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { InvitationsService } from "../../modules/invitations/invitations.service";

@Injectable()
export class InvitationGuard implements CanActivate {
  constructor(private readonly invitationsService: InvitationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.params.token || request.query.token;

    if (!token) {
      throw new BadRequestException("Token de invitación requerido");
    }

    try {
      const invitation =
        await this.invitationsService.validateInvitation(token);
      request.invitation = invitation;
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
