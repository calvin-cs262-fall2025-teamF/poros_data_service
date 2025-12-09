import { Router, Response } from 'express';
import { query } from '../config/database';
import { transformToCamelCase } from '../utils/transform';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

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


