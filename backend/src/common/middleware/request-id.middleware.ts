import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

type RequestWithId = Request & { requestId?: string };

export function requestIdMiddleware(
  req: RequestWithId,
  res: Response,
  next: NextFunction,
): void {
  const incomingRequestId = req.headers['x-request-id'];
  const requestId = Array.isArray(incomingRequestId)
    ? incomingRequestId[0]
    : incomingRequestId;

  req.requestId = requestId || randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
