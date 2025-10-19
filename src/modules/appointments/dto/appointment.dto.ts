import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class AppointmentDto {
  @ApiProperty({
    description: "Appointment ID",
    example: "clx1234567890abcdef",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Patient ID",
    example: "clx1234567890abcdef",
  })
  @Expose()
  patientId: string;

  @ApiProperty({
    description: "Nutritionist ID",
    example: "clx1234567890abcdef",
  })
  @Expose()
  nutritionistId: string;

  @ApiProperty({
    description: "Appointment date",
    example: "2024-12-15T00:00:00.000Z",
  })
  @Expose()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: "Appointment time",
    example: "14:30",
  })
  @Expose()
  time: string;

  @ApiProperty({
    description: "Type of appointment",
    enum: ["INITIAL_CONSULTATION", "FOLLOW_UP", "REVIEW", "EMERGENCY"],
    example: "INITIAL_CONSULTATION",
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: "Duration in minutes",
    example: 60,
  })
  @Expose()
  duration: number;

  @ApiProperty({
    description: "Appointment status",
    enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"],
    example: "SCHEDULED",
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: "Additional notes",
    example: "Patient prefers morning appointments",
    required: false,
  })
  @Expose()
  notes?: string;

  @ApiProperty({
    description: "Creation date",
    example: "2024-12-01T10:00:00.000Z",
  })
  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-12-01T10:00:00.000Z",
  })
  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  // Relaciones
  @ApiProperty({
    description: "Patient information",
    type: "object",
  })
  @Expose()
  @Type(() => Object)
  patient?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };

  @ApiProperty({
    description: "Nutritionist information",
    type: "object",
  })
  @Expose()
  @Type(() => Object)
  nutritionist?: {
    id: string;
    name: string;
    email: string;
  };
}
