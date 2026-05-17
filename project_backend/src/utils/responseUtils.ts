import { Response } from "express";

type ValidationErrors = unknown;

export const ok = <T>(res: Response, data: T): Response => {
  return res.status(200).send({
    success: true,
    data,
    status: 200,
    message: "ok",
  });
};

export const notFound = (res: Response): Response => {
  return res.status(404).send({
    success: false,
    status: 404,
    message: "Cannot find resouces",
  });
};

export const error = (res: Response, message?: string): Response => {
  return res.status(500).send({
    success: false,
    status: 500,
    message: message || "Internal server error",
  });
};

export const unauthorized = (res: Response, message?: string): Response => {
  return res.status(200).send({
    success: false,
    status: 401,
    message: message || "Unauthorized",
  });
};

export const forbidden = (res: Response, message?: string): Response => {
  return res.status(403).send({
    success: false,
    status: 403,
    message: message || "Forbidden",
  });
};

export const invalidated = (res: Response, errors: ValidationErrors): Response => {
  return res.status(422).send({
    success: false,
    status: 422,
    data: errors,
  });
};

export default { ok, notFound, error, unauthorized, forbidden, invalidated };
