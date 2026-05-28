/**
 * API 响应基础结构
 */
export interface ApiResponse {
  status: number;
  body: {
    response?: any;
    error?: any;
    message?: string;
    isOk?: boolean;
    refresh?: boolean;
    data?: any;
    [key: string]: any;
  };
}

/**
 * API 函数参数选项
 */
export interface ApiOptions {
  method?: string;
  params?: Record<string, any>;
  option?: any;
  isFormat?: boolean | string;
  [key: string]: any;
}

/**
 * API 函数类型定义
 */
export type ApiFunction<T extends ApiOptions = ApiOptions> = (
  options: T
) => Promise<ApiResponse>;
