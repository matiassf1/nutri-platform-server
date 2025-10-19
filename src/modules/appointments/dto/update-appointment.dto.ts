import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { CreateAppointmentDto } from "./create-appointment.dto";

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({
    description: "Appointment status",
    enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"],
    example: "COMPLETED",
    required: false,
  })
  @IsEnum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"])
  @IsOptional()
  status?: string;
}
