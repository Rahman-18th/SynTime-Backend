export declare function getEmployeeDashboard(employeeId: bigint): Promise<{
    employee: {
        name: string;
        role: string;
        workLocation: string;
    };
    today: {
        date: string | undefined;
        attendanceStatus: string;
        checkInTime: string | null;
        checkOutTime: string | null;
        totalMinutes: number;
    };
    schedule: {
        shiftName: string;
        startTime: string | null;
        endTime: string | null;
        location: string;
    } | null;
    summary: {
        present: number;
        late: number;
        leave: number;
        absent: number;
    };
    notificationCount: number;
    remainingLeave: null;
} | null>;
export declare function getAdminDashboard(): Promise<{
    period: {
        date: string | undefined;
        month: number;
        year: number;
    };
    employees: {
        total: number;
        active: number;
        inactive: number;
    };
    attendance: {
        presentToday: number;
        lateToday: number;
        totalCheckedInToday: number;
    };
    requests: {
        pending: number;
    };
    payroll: {
        totalPayslips: number;
        published: number;
        draft: number;
        totalTakeHomePay: number;
    };
    announcements: {
        published: number;
    };
    recentAttendance: {
        id: string;
        employee: {
            id: string;
            employeeNumber: string;
            name: string;
        };
        office: string;
        status: string;
        workDate: string | undefined;
        checkInTime: string | null;
        checkOutTime: string | null;
    }[];
    recentRequests: {
        id: string;
        employee: {
            id: string;
            employeeNumber: string;
            name: string;
        };
        type: string;
        status: string;
        submittedAt: string;
    }[];
}>;
//# sourceMappingURL=dashboard.service.d.ts.map