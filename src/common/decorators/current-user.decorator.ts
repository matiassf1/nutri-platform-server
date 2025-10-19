import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserType {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  patientId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserType | undefined, ctx: ExecutionContext): CurrentUserType | any => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserType = request.user;

    return data ? user?.[data] : user;
  },
);
