import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from 'drizzle-orm';
import { z } from "zod";

/**
 * USERS TABLE
 * Stores all users (workers and employers)
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // worker or employer
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name"),
  companyDescription: text("company_description"),
  companyLogo: text("company_logo"),
  bio: text("bio"),
  skills: text("skills").array(),
  hourlyRate: integer("hourly_rate"),
  yearsExperience: integer("years_experience"),
  verified: boolean("verified").default(false)
});

/**
 * JOBS TABLE
 * Stores job postings and links them to an employer
 */
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  requirements: text("requirements").array(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  shiftStartTime: text("shift_start_time").notNull(),
  shiftEndTime: text("shift_end_time").notNull(),
  shiftHours: integer("shift_hours").notNull(),
  rate: integer("rate").notNull(),
  employerId: integer("employer_id").notNull().references(() => users.id),
  status: text("status").notNull().default("open")
});

/**
 * APPLICATIONS TABLE
 * Connects workers to jobs they applied for
 */
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  workerId: integer("worker_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

/**
 * TABLE RELATIONS
 * Allow fetching related data automatically
 */
export const jobsRelations = relations(jobs, ({ one }) => ({
  employer: one(users, { fields: [jobs.employerId], references: [users.id] }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  worker: one(users, { fields: [applications.workerId], references: [users.id] }),
}));

/**
 * INSERT SCHEMAS
 * Validate incoming data before inserting into the database
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  fullName: true,
  email: true,
  phone: true,
  companyName: true,
  companyDescription: true,
  companyLogo: true,
  bio: true,
  skills: true,
  hourlyRate: true,
  yearsExperience: true
}).extend({ skills: z.array(z.string()).optional().default([]) });

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  description: true,
  location: true,
  requirements: true,
  startDate: true,
  endDate: true,
  shiftStartTime: true,
  shiftEndTime: true,
  shiftHours: true,
  rate: true
}).extend({ startDate: z.coerce.date(), endDate: z.coerce.date(), requirements: z.array(z.string()).default([]) });

export const insertApplicationSchema = createInsertSchema(applications).pick({
  jobId: true,
  workerId: true,
  note: true
}).extend({ note: z.string().optional() });
