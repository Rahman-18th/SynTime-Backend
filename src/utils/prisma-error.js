import { Prisma } from "../generated/prisma/client.js";
export function isPrismaKnownError(error) {
    return (error instanceof
        Prisma.PrismaClientKnownRequestError);
}
//# sourceMappingURL=prisma-error.js.map