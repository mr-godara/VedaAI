import { Request, Response, NextFunction } from 'express';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In a real app, you might upload to S3 here.
    // For this assignment, we store locally and return the relative path.
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;

    res.status(200).json({ fileUrl, fileName });
  } catch (error) {
    next(error);
  }
};
