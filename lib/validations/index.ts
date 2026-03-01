import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  serviceInterest: z.enum([
    "AI Automation",
    "Full-Stack Development",
    "AI Integration",
    "SaaS Inquiry",
    "General",
  ]),
  budget: z.string().optional(),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().optional(),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "ARCHIVED"]),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  assignedToId: z.string(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  ogImage: z.string().optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

export const portfolioSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDesc: z.string().min(1).max(160, "Max 160 characters"),
  fullDesc: z.string().optional(),
  coverImage: z.string().min(1, "Cover image is required"),
  images: z.array(z.string()).optional(),
  category: z.string().min(1, "Category is required"),
  techStack: z.array(z.string()).optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;
