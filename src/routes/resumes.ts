import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { transformToCamelCase, transformToSnakeCase } from '../utils/transform';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/resumes
 * Get all resumes for the authenticated user
 */
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const result = await query(
    'SELECT * FROM resumes WHERE user_id = $1 ORDER BY is_primary DESC, uploaded_at DESC',
    [userId]
  );

  res.json(transformToCamelCase(result.rows));
}));

/**
 * GET /api/resumes/tailored
 * Get all tailored resumes for the authenticated user
 */
router.get('/tailored', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const result = await query(
    `SELECT tr.*, r.name as original_resume_name, r.file_uri as original_resume_uri
     FROM tailored_resumes tr
     JOIN resumes r ON tr.original_resume_id = r.id
     WHERE tr.user_id = $1
     ORDER BY tr.tailored_at DESC`,
    [userId]
  );

  res.json(transformToCamelCase(result.rows));
}));

/**
 * GET /api/resumes/tailored/:id
 * Get a specific tailored resume
 */
router.get('/tailored/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const tailoredResumeId = req.params.id;
  const userId = req.userId!;

  const result = await query(
    `SELECT tr.*, r.name as original_resume_name, r.file_uri as original_resume_uri
     FROM tailored_resumes tr
     JOIN resumes r ON tr.original_resume_id = r.id
     WHERE tr.id = $1 AND tr.user_id = $2`,
    [tailoredResumeId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Tailored resume not found', 404);
  }

  res.json(transformToCamelCase(result.rows[0]));
}));

/**
 * GET /api/resumes/:id
 * Get a specific resume
 */
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const resumeId = req.params.id;
  const userId = req.userId!;

  const result = await query(
    'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
    [resumeId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Resume not found', 404);
  }

  res.json(transformToCamelCase(result.rows[0]));
}));

/**
 * POST /api/resumes
 * Upload a new resume
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('fileName').trim().notEmpty().withMessage('File name is required'),
    body('fileUri').trim().notEmpty().withMessage('File URI is required'),
    body('isPrimary').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId!;
    const { name, fileName, fileUri, isPrimary } = req.body;

    // If this is set as primary, unset other primary resumes
    if (isPrimary) {
      await query('UPDATE resumes SET is_primary = FALSE WHERE user_id = $1', [userId]);
    }

    const resumeId = uuidv4();
    const result = await query(
      `INSERT INTO resumes (id, user_id, name, file_name, file_uri, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [resumeId, userId, name, fileName, fileUri, isPrimary || false]
    );

    // Update user's resume_uri if this is primary
    if (isPrimary) {
      await query('UPDATE users SET resume_uri = $1 WHERE id = $2', [fileUri, userId]);
    }

    res.status(201).json(transformToCamelCase(result.rows[0]));
  })
);

/**
 * PUT /api/resumes/:id
 * Update a resume
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('isPrimary').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resumeId = req.params.id;
    const userId = req.userId!;

    // Verify resume belongs to user
    const existing = await query('SELECT id, file_uri FROM resumes WHERE id = $1 AND user_id = $2', [resumeId, userId]);
    if (existing.rows.length === 0) {
      throw new AppError('Resume not found', 404);
    }

    const updates = transformToSnakeCase(req.body);
    const { is_primary } = updates;

    // If setting as primary, unset other primary resumes
    if (is_primary) {
      await query('UPDATE resumes SET is_primary = FALSE WHERE user_id = $1 AND id != $2', [userId, resumeId]);
      // Update user's resume_uri
      await query('UPDATE users SET resume_uri = $1 WHERE id = $2', [existing.rows[0].file_uri, userId]);
    }

    const allowedFields = ['name', 'is_primary'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    updateValues.push(resumeId, userId);
    const result = await query(
      `UPDATE resumes SET ${updateFields.join(', ')} 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      updateValues
    );

    res.json(transformToCamelCase(result.rows[0]));
  })
);

/**
 * DELETE /api/resumes/:id
 * Delete a resume
 */
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const resumeId = req.params.id;
  const userId = req.userId!;

  const result = await query(
    'DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING id',
    [resumeId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Resume not found', 404);
  }

  res.json({ message: 'Resume deleted successfully' });
}));

/**
 * POST /api/resumes/tailor
 * Create a tailored resume
 */
router.post(
  '/tailor',
  [
    body('originalResumeId').trim().notEmpty().withMessage('Original resume ID is required'),
    body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('positionTitle').trim().notEmpty().withMessage('Position title is required'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId!;
    const { originalResumeId, jobDescription, companyName, positionTitle } = req.body;

    // Verify resume belongs to user
    const resume = await query('SELECT id FROM resumes WHERE id = $1 AND user_id = $2', [originalResumeId, userId]);
    if (resume.rows.length === 0) {
      throw new AppError('Resume not found', 404);
    }

    const tailoredResumeId = uuidv4();
    const result = await query(
      `INSERT INTO tailored_resumes (id, original_resume_id, user_id, job_description, company_name, position_title, processing_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'processing')
       RETURNING *`,
      [tailoredResumeId, originalResumeId, userId, jobDescription, companyName, positionTitle]
    );

    // TODO: In a real implementation, you would trigger an AI service here to process the resume
    // For now, we'll just return the created record with 'processing' status

    res.status(201).json(transformToCamelCase(result.rows[0]));
  })
);

/**
 * PUT /api/resumes/tailored/:id
 * Update a tailored resume (e.g. status, fileUri)
 */
router.put(
  '/tailored/:id',
  upload.single('file'), // Handle file upload
  [
    // fileUri is now optional/can be derived
    body('processingStatus').optional().isIn(['processing', 'completed', 'failed']),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Validation results (skip if it complains about missing fileUri, since we might upload file instead)

    // ... logic adjustment: if file is present, use it.

    const tailoredResumeId = req.params.id;
    const userId = req.userId!;
    const { processingStatus } = req.body;
    const file = req.file;

    // Verify it belongs to user
    console.log(`[Resume PUT Debug] Attempting update for ID: ${tailoredResumeId}, User: ${userId}`);
    const existing = await query('SELECT id FROM tailored_resumes WHERE id = $1 AND user_id = $2', [tailoredResumeId, userId]);
    if (existing.rows.length === 0) {
      console.error(`[Resume PUT Debug] 404 Not Found. ID: ${tailoredResumeId}, User: ${userId}`);
      throw new AppError('Tailored resume not found', 404);
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    // If file uploaded, update file_data AND set file_uri to download link
    if (file) {
      updates.push(`file_data = $${paramIndex}`);
      values.push(file.buffer);
      paramIndex++;

      const downloadUri = `/api/resumes/tailored/${tailoredResumeId}/download`;
      updates.push(`file_uri = $${paramIndex}`);
      values.push(downloadUri);
      paramIndex++;
    }

    if (processingStatus) {
      updates.push(`processing_status = $${paramIndex}`);
      values.push(processingStatus);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new AppError('No changes provided', 400);
    }

    values.push(tailoredResumeId, userId);

    const result = await query(
      `UPDATE tailored_resumes 
       SET ${updates.join(', ')} 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    // Return transformed result
    const r = result.rows[0];
    // We might need to join to get original resume name akin to GET endpoint?
    // For now, returning just the record is fine as frontend usually refetches.
    res.json(transformToCamelCase(r));
  })
);

/**
 * DELETE /api/resumes/tailored/:id
 * Delete a tailored resume
 */
router.delete(
  '/tailored/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tailoredResumeId = req.params.id;
    const userId = req.userId!;

    const result = await query(
      'DELETE FROM tailored_resumes WHERE id = $1 AND user_id = $2 RETURNING id',
      [tailoredResumeId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Tailored resume not found', 404);
    }

    res.json({ message: 'Tailored resume deleted successfully', id: tailoredResumeId });
  })
);

/**
 * GET /api/resumes/:id/download
 * Download a specific resume file
 */
router.get('/:id/download', asyncHandler(async (req: AuthRequest, res: Response) => {
  const resumeId = req.params.id;
  const userId = req.userId!;

  const result = await query(
    'SELECT file_name, file_data FROM resumes WHERE id = $1 AND user_id = $2',
    [resumeId, userId]
  );

  if (result.rows.length === 0 || !result.rows[0].file_data) {
    throw new AppError('Resume file not found', 404);
  }

  const fileData = result.rows[0].file_data;
  const fileName = result.rows[0].file_name;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(fileData);
}));

/**
 * GET /api/resumes/tailored/:id/download
 * Download a tailored resume file
 */
router.get('/tailored/:id/download', asyncHandler(async (req: AuthRequest, res: Response) => {
  const tailoredResumeId = req.params.id;
  const userId = req.userId!;

  const result = await query(
    'SELECT job_description, file_data FROM tailored_resumes WHERE id = $1 AND user_id = $2',
    [tailoredResumeId, userId]
  );

  if (result.rows.length === 0 || !result.rows[0].file_data) {
    throw new AppError('Tailored resume file not found', 404);
  }

  const fileData = result.rows[0].file_data;
  const fileName = `Tailored_Resume.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(fileData);
}));

export default router;
