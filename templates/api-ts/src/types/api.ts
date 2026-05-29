export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
};

export type StatusResponse = {
  name: string;
  version: string;
  environment: string;
};

export type HealthResponse = {
  status: 'ok';
  uptime: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type CreateUserInput = {
  email: string;
  name: string;
};

export type UserParams = {
  id: string;
};
