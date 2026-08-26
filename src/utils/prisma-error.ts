import { Prisma } from "../generated/prisma/client.js";

export function isPrismaKnownError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof
    Prisma.PrismaClientKnownRequestError
  );
}