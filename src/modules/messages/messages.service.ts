import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CurrentUserType } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../config/prisma.service";
import { CreateMessageDto, FindAllMessagesDto } from "./dto";

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: FindAllMessagesDto, user: CurrentUserType) {
    const { page = 1, limit = 20, receiverId, isRead } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    };

    if (receiverId) {
      where.AND = [
        {
          OR: [
            { senderId: user.id, receiverId },
            { senderId: receiverId, receiverId: user.id },
          ],
        },
      ];
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [messages, total] = await Promise.all([
      this.prismaService.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          sentAt: "desc",
        },
      }),
      this.prismaService.message.count({ where }),
    ]);

    return {
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createMessageDto: CreateMessageDto, user: CurrentUserType) {
    const message = await this.prismaService.message.create({
      data: {
        ...createMessageDto,
        senderId: user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`Message created: ${message.id} by user: ${user.id}`);

    return message;
  }

  async markAsRead(messageId: string, user: CurrentUserType) {
    const message = await this.prismaService.message.findFirst({
      where: {
        id: messageId,
        receiverId: user.id,
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    const updatedMessage = await this.prismaService.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    this.logger.log(`Message marked as read: ${messageId}`);

    return updatedMessage;
  }

  async getUnreadCount(user: CurrentUserType) {
    const count = await this.prismaService.message.count({
      where: {
        receiverId: user.id,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }
}
