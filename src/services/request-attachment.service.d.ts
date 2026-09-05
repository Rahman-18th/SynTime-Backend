export declare function createRequestAttachment(data: {
    requestId: bigint;
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: bigint;
}): Promise<{
    id: bigint;
    requestId: bigint;
    fileName: string;
    fileUrl: string;
    fileType: string | null;
    fileSize: bigint | null;
    createdAt: Date;
}>;
export declare function getAttachmentsByRequest(requestId: bigint): Promise<{
    id: bigint;
    requestId: bigint;
    fileName: string;
    fileUrl: string;
    fileType: string | null;
    fileSize: bigint | null;
    createdAt: Date;
}[]>;
//# sourceMappingURL=request-attachment.service.d.ts.map