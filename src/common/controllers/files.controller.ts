import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { existsSync } from "fs";
import { join } from "path";
import { Public } from "../decorators/public.decorator";

@Controller("uploads")
export class FilesController {
  @Get("*")
  @Public()
  serveFile(@Param() params: string[], @Res() res: Response) {
    const filename = params[0];
    const filePath = join(process.cwd(), "uploads", filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    // Set CORS headers for cross-origin requests
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    res.sendFile(filePath);
  }
}
