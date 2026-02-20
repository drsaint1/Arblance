import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';

export const generateJobTitles = async (req: Request, res: Response) => {
  try {
    const { keywords } = req.body;

    if (!keywords || typeof keywords !== 'string') {
      return res.status(400).json({ error: 'Keywords are required' });
    }

    const titles = await aiService.generateJobTitle(keywords);

    res.json({
      success: true,
      suggestions: titles,
    });
  } catch (error: any) {
    console.error('Error generating job titles:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate job titles',
    });
  }
};

export const generateJobDescriptions = async (req: Request, res: Response) => {
  try {
    const { title, context } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Job title is required' });
    }

    const descriptions = await aiService.generateJobDescription(title, context);

    res.json({
      success: true,
      suggestions: descriptions,
    });
  } catch (error: any) {
    console.error('Error generating job descriptions:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate job descriptions',
    });
  }
};

export const improveText = async (req: Request, res: Response) => {
  try {
    const { text, type } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!type || !['title', 'description'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "title" or "description"' });
    }

    const improved = await aiService.improveText(text, type);

    res.json({
      success: true,
      improved,
    });
  } catch (error: any) {
    console.error('Error improving text:', error);
    res.status(500).json({
      error: error.message || 'Failed to improve text',
    });
  }
};

export const generateMilestones = async (req: Request, res: Response) => {
  try {
    const { description, count } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const numberOfMilestones = count && typeof count === 'number' ? count : 3;

    const milestones = await aiService.generateMilestones(description, numberOfMilestones);

    res.json({
      success: true,
      suggestions: milestones,
    });
  } catch (error: any) {
    console.error('Error generating milestones:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate milestones',
    });
  }
};

export const generateReviewSuggestions = async (req: Request, res: Response) => {
  try {
    const { rating, jobType } = req.body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    const type = jobType || 'freelance';

    const suggestions = await aiService.generateReviewSuggestions(rating, type);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
      console.error('Error generating review suggestions:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate review suggestions',
    });
  }
};
