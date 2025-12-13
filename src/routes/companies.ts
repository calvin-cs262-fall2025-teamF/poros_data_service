import { Router, Response } from 'express';
import { query } from '../config/database';
import { transformToCamelCase } from '../utils/transform';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/companies
 * Get all companies with event, course, and checklist counts
 */
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await query('SELECT * FROM company_recommendations_view ORDER BY name');
  res.json(transformToCamelCase(result.rows));
}));

/**
 * POST /api/companies
 * Create a new custom company (only if it doesn't exist)
 */
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    name,
    industry,
    logo,
    id,
    companyInfo,
    events,
    recommendedCourses,
    preparationChecklist,
    applicationTimeline
  } = req.body;

  if (!name || !industry) {
    return res.status(400).json({ error: 'Name and Industry are required' });
  }

  const companyId = id || `custom-${Date.now()}`;

  // Check if company exists first
  const existing = await query('SELECT * FROM companies WHERE name = $1', [name]);
  if (existing.rows.length > 0) {
    return res.json(transformToCamelCase(existing.rows[0]));
  }

  const companyLogo = logo || '🏢';

  // Extract info from nested object or use defaults
  const size = companyInfo?.size || 'Unknown';
  const culture = companyInfo?.culture || [];
  const benefits = companyInfo?.benefits || [];
  const interviewProcess = companyInfo?.interviewProcess || [];

  try {
    // Start transaction (simplified by just running sequential queries for now, ideally use client.query('BEGIN'))
    // 1. Insert Company
    const result = await query(
      `INSERT INTO companies (id, name, industry, logo, company_size, culture_values, benefits, interview_process, application_timeline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [companyId, name, industry, companyLogo, size, culture, benefits, interviewProcess, applicationTimeline || null]
    );

    const savedCompany = result.rows[0];

    // 2. Insert Events
    if (events && Array.isArray(events)) {
      for (const event of events) {
        await query(
          `INSERT INTO events (id, company_id, title, type, event_date, description, registration_link)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), companyId, event.title, event.type, event.date, event.description, event.registrationLink]
        );
      }
    }

    // 3. Insert Courses
    if (recommendedCourses && Array.isArray(recommendedCourses)) {
      for (const course of recommendedCourses) {
        await query(
          `INSERT INTO courses (id, company_id, title, provider, duration, level, skills, link)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uuidv4(), companyId, course.title, course.provider, course.duration, course.level, course.skills, course.link]
        );
      }
    }

    // 4. Insert Checklist Items (Templates)
    if (preparationChecklist && Array.isArray(preparationChecklist)) {
      for (const item of preparationChecklist) {
        await query(
          `INSERT INTO checklist_items (id, company_id, title, description, category, user_id)
           VALUES ($1, $2, $3, $4, $5, NULL)`,
          [uuidv4(), companyId, item.title, item.description, item.category]
        );
      }
    }

    // Return the full object
    // Re-fetch to be sure or just construct it? Constructing is faster.
    const fullCompany = {
      ...savedCompany,
      events: events || [],
      courses: recommendedCourses || [],
      checklistItems: preparationChecklist || []
    };

    res.status(201).json(transformToCamelCase(fullCompany));

  } catch (error) {
    console.error('Error creating company:', error);
    throw new AppError('Failed to save company data', 500);
  }
}));

/**
 * GET /api/companies/:id
 * Get company with all related events, courses, and checklist items
 */
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const companyId = req.params.id;

  // Get company
  const companyResult = await query('SELECT * FROM companies WHERE id = $1', [companyId]);
  if (companyResult.rows.length === 0) {
    throw new AppError('Company not found', 404);
  }

  const company = companyResult.rows[0];

  // Get events
  const eventsResult = await query(
    'SELECT * FROM events WHERE company_id = $1 ORDER BY event_date ASC',
    [companyId]
  );
  company.events = eventsResult.rows;

  // Get courses
  const coursesResult = await query(
    'SELECT * FROM courses WHERE company_id = $1 ORDER BY title ASC',
    [companyId]
  );
  company.courses = coursesResult.rows;

  // Get checklist items (template items where user_id is NULL)
  const checklistResult = await query(
    'SELECT * FROM checklist_items WHERE company_id = $1 AND user_id IS NULL ORDER BY category, title',
    [companyId]
  );
  company.checklistItems = checklistResult.rows;

  res.json(transformToCamelCase(company));
}));

export default router;


