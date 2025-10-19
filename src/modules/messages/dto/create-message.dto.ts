import { ApiProperty } from "@nestjs/swagger";
import { MessageType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
  @ApiProperty({
    description: "Receiver user ID",
    example: "user123",
  })
  @IsString({ message: "Receiver ID must be a string" })
  @IsNotEmpty({ message: "Receiver ID is required" })
  receiverId: string;

  @ApiProperty({
    description: "Message content",
    example: "Hello, how are you feeling today?",
  })
  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  content: string;

  @ApiProperty({
    description: "Message type",
    example: "TEXT",
    enum: ["TEXT", "IMAGE", "FILE"],
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageType, {
    message: "Type must be one of: TEXT, IMAGE, FILE",
  })
  type?: MessageType = MessageType.TEXT;
}
