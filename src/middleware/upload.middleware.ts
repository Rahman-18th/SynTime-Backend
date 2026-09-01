import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    cb(null, uploadDirectory);
  },

  filename: (
    req,
    file,
    cb
  ) => {
    const timestamp = Date.now();

    const randomNumber =
      Math.round(
        Math.random() * 1_000_000
      );

    const extension =
      path.extname(file.originalname);

    const safeName =
      path
        .basename(
          file.originalname,
          extension
        )
        .replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

    cb(
      null,
      `${timestamp}-${randomNumber}-${safeName}${extension}`
    );
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const allowedExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  const extension =
    path
      .extname(file.originalname)
      .toLowerCase();

  const isMimeAllowed =
    allowedMimeTypes.includes(
      file.mimetype
    );

  const isExtensionAllowed =
    allowedExtensions.includes(
      extension
    );

  if (
    isMimeAllowed ||
    isExtensionAllowed
  ) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only PDF, JPG, JPEG, and PNG files are allowed"
    )
  );
};


export const uploadRequestAttachment =
  multer({
    storage,
    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });