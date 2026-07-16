import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const createCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        userId,
      },
    });

    return res.status(201).json({ message: "Course created.", course });
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({ message: "Failed to create course." });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        user: { select: { id: true, email: true } },
        files: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Get courses error:", error);
    return res.status(500).json({ message: "Failed to fetch courses." });
  }
};