export declare function getPublishedAnnouncements(): Promise<{
    id: bigint;
    title: string;
    message: string;
    priority: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getAllAnnouncements(): Promise<{
    id: bigint;
    title: string;
    message: string;
    priority: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getAnnouncementById(id: bigint): Promise<{
    id: bigint;
    title: string;
    message: string;
    priority: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
} | null>;
interface CreateAnnouncementInput {
    title: string;
    message: string;
    priority?: string;
    isPublished?: boolean;
}
export declare function createAnnouncement(data: CreateAnnouncementInput): Promise<{
    id: bigint;
    title: string;
    message: string;
    priority: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
interface UpdateAnnouncementInput {
    title?: string;
    message?: string;
    priority?: string;
    isPublished?: boolean;
}
export declare function updateAnnouncement(id: bigint, data: UpdateAnnouncementInput): Promise<{
    id: bigint;
    title: string;
    message: string;
    priority: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteAnnouncement(id: bigint): Promise<{
    id: bigint;
    title: string;
    message: string;
    priority: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export {};
//# sourceMappingURL=announcement.service.d.ts.map