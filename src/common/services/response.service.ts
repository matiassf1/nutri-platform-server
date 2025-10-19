import { Injectable } from "@nestjs/common";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: string[];
  timestamp: string;
}

@Injectable()
export class ResponseService {
  success<T>(data: T, message = "Success"): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  successWithPagination<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message = "Success"
  ): ApiResponse<T[]> {
    return {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  error(message: string, errors?: string[]): ApiResponse {
    return {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  created<T>(
    data: T,
    message = "Resource created successfully"
  ): ApiResponse<T> {
    return this.success(data, message);
  }

  updated<T>(
    data: T,
    message = "Resource updated successfully"
  ): ApiResponse<T> {
    return this.success(data, message);
  }

  deleted(message = "Resource deleted successfully"): ApiResponse {
    return this.success(null, message);
  }
}
