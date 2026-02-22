import { Request, Response } from 'express';
import { badgeService } from '../services/badge.service';

export const mintBadge = async (req: Request, res: Response) => {
  try {
    const { recipientAddress, skillName, category, score } = req.body;

    if (!recipientAddress || typeof recipientAddress !== 'string') {
      return res.status(400).json({ error: 'Recipient address is required' });
    }

    if (!skillName || typeof skillName !== 'string') {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    if (category === undefined || typeof category !== 'number' || category < 0) {
      return res.status(400).json({ error: 'Valid category is required' });
    }

    if (!score || typeof score !== 'number' || score < 70) {
      return res.status(400).json({ error: 'Score must be at least 70 to mint a badge' });
    }

    const result = await badgeService.mintSkillBadge(
      recipientAddress,
      skillName,
      category,
      score
    );

    if (result.success) {
      res.json({ success: true, txHash: result.txHash });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Error in mintBadge controller:', error);
    res.status(500).json({
      error: error.message || 'Failed to mint badge',
    });
  }
};

export const checkSkill = async (req: Request, res: Response) => {
  try {
    const { address, category } = req.params;

    if (!address || !category) {
      return res.status(400).json({ error: 'Address and category are required' });
    }

    const hasSkill = await badgeService.checkHasSkill(address, parseInt(category));
    res.json({ hasSkill });
  } catch (error: any) {
    console.error('Error checking skill:', error);
    res.status(500).json({
      error: error.message || 'Failed to check skill',
    });
  }
};
