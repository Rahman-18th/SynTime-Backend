import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import prisma from "../config/prisma.js";
/*
|--------------------------------------------------------------------------
| Temporary Password Generator
|--------------------------------------------------------------------------
*/
function generateTemporaryPassword(length = 12) {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%";
    const allCharacters = uppercase +
        lowercase +
        numbers +
        symbols;
    const passwordCharacters = [
        uppercase[randomInt(uppercase.length)],
        lowercase[randomInt(lowercase.length)],
        numbers[randomInt(numbers.length)],
        symbols[randomInt(symbols.length)],
    ];
    while (passwordCharacters.length <
        length) {
        passwordCharacters.push(allCharacters[randomInt(allCharacters.length)]);
    }
    /*
    |--------------------------------------------------------------------------
    | Shuffle
    |--------------------------------------------------------------------------
    */
    for (let i = passwordCharacters.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [
            passwordCharacters[i],
            passwordCharacters[j],
        ] = [
            passwordCharacters[j],
            passwordCharacters[i],
        ];
    }
    return passwordCharacters.join("");
}
/*
|--------------------------------------------------------------------------
| Create Employee Login Account
|--------------------------------------------------------------------------
*/
export async function createEmployeeAccount(employeeId) {
    const employee = await prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
        include: {
            user: true,
        },
    });
    if (!employee) {
        throw new Error("EMPLOYEE_NOT_FOUND");
    }
    if (employee.user) {
        throw new Error("EMPLOYEE_ALREADY_HAS_ACCOUNT");
    }
    const existingEmailUser = await prisma.user.findUnique({
        where: {
            email: employee.email,
        },
    });
    if (existingEmailUser) {
        throw new Error("EMAIL_ALREADY_HAS_ACCOUNT");
    }
    const employeeRole = await prisma.role.findUnique({
        where: {
            name: "employee",
        },
    });
    if (!employeeRole) {
        throw new Error("EMPLOYEE_ROLE_NOT_FOUND");
    }
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
            data: {
                employeeId: employee.id,
                email: employee.email,
                passwordHash,
                isActive: employee.status ===
                    "active",
            },
        });
        await tx.userRole.create({
            data: {
                userId: createdUser.id,
                roleId: employeeRole.id,
            },
        });
        return createdUser;
    });
    return {
        user: {
            id: user.id.toString(),
            employeeId: employee.id.toString(),
            email: user.email,
            isActive: user.isActive,
        },
        temporaryPassword,
    };
}
/*
|--------------------------------------------------------------------------
| Reset Temporary Password
|--------------------------------------------------------------------------
*/
export async function resetEmployeePassword(employeeId) {
    const employee = await prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
        include: {
            user: true,
        },
    });
    if (!employee) {
        throw new Error("EMPLOYEE_NOT_FOUND");
    }
    if (!employee.user) {
        throw new Error("EMPLOYEE_ACCOUNT_NOT_FOUND");
    }
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const user = await prisma.user.update({
        where: {
            id: employee.user.id,
        },
        data: {
            passwordHash,
        },
    });
    return {
        user: {
            id: user.id.toString(),
            employeeId: employee.id.toString(),
            email: user.email,
            isActive: user.isActive,
        },
        temporaryPassword,
    };
}
/*
|--------------------------------------------------------------------------
| Update Account Status
|--------------------------------------------------------------------------
*/
export async function updateEmployeeAccountStatus(employeeId, isActive) {
    const employee = await prisma.employee.findUnique({
        where: {
            id: employeeId,
        },
        include: {
            user: true,
        },
    });
    if (!employee) {
        throw new Error("EMPLOYEE_NOT_FOUND");
    }
    if (!employee.user) {
        throw new Error("EMPLOYEE_ACCOUNT_NOT_FOUND");
    }
    const user = await prisma.user.update({
        where: {
            id: employee.user.id,
        },
        data: {
            isActive,
        },
        select: {
            id: true,
            employeeId: true,
            email: true,
            isActive: true,
        },
    });
    return {
        id: user.id.toString(),
        employeeId: user.employeeId?.toString() ??
            null,
        email: user.email,
        isActive: user.isActive,
    };
}
//# sourceMappingURL=employee-account.service.js.map