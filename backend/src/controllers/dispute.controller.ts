import { Request, Response } from 'express';
import Dispute, { DisputeStatus, DisputeWinner } from '../models/Dispute.model';
import User from '../models/User.model';
import { emailService } from '../services/email.service';

export const disputeController = {
  async createDispute(req: Request, res: Response) {
    try {
      const {
        disputeId,
        jobId,
        client,
        freelancer,
        amount,
        evidence,
        transactionHash,
      } = req.body;

      const dispute = new Dispute({
        disputeId,
        jobId,
        client: client.toLowerCase(),
        freelancer: freelancer.toLowerCase(),
        amount,
        clientEvidence: evidence.client || '',
        freelancerEvidence: evidence.freelancer || '',
        status: DisputeStatus.OPEN,
        winner: DisputeWinner.NONE,
        transactionHash,
      });

      const clientUser = await User.findOne({ walletAddress: client.toLowerCase() });
      const freelancerUser = await User.findOne({ walletAddress: freelancer.toLowerCase() });

      if (clientUser?.email) {
        await emailService.sendDisputeNotification(
          clientUser.email,
          `Job #${jobId}`,
          String(disputeId)
        );
      }

      if (freelancerUser?.email) {
        await emailService.sendDisputeNotification(
          freelancerUser.email,
          `Job #${jobId}`,
          String(disputeId)
        );
      }

      res.status(201).json({
        success: true,
        dispute,
      });
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getDispute(req: Request, res: Response) {
    try {
      const { disputeId } = req.params;

      const dispute = await Dispute.findOne({ disputeId: parseInt(disputeId) });

      if (!dispute) {
        return res.status(404).json({
          success: false,
          message: 'Dispute not found',
        });
      }

      res.json({
        success: true,
        dispute,
      });
    } catch (error: any) {
      console.error('Error fetching dispute:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getUserDisputes(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      const address = walletAddress.toLowerCase();

      const disputes = await Dispute.find({
        $or: [{ client: address }, { freelancer: address }],
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        disputes,
      });
    } catch (error: any) {
      console.error('Error fetching user disputes:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async submitEvidence(req: Request, res: Response) {
    try {
      const { disputeId } = req.params;
      const { evidence, submitter } = req.body;

      const dispute = await Dispute.findOne({ disputeId: parseInt(disputeId) });

      if (!dispute) {
        return res.status(404).json({
          success: false,
          message: 'Dispute not found',
        });
      }

      if (dispute.status === DisputeStatus.RESOLVED) {
        return res.status(400).json({
          success: false,
          message: 'Dispute already resolved',
        });
      }

      const submitterLower = submitter.toLowerCase();

      if (submitterLower === dispute.client) {
        dispute.clientEvidence = evidence;
      } else if (submitterLower === dispute.freelancer) {
        dispute.freelancerEvidence = evidence;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to submit evidence',
        });
      }

      await dispute.save();

      res.json({
        success: true,
        dispute,
      });
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAllDisputes(req: Request, res: Response) {
    try {
      const { status } = req.query;

      const query: any = {};
      if (status) {
        query.status = status;
      }

      const disputes = await Dispute.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        disputes,
      });
    } catch (error: any) {
      console.error('Error fetching all disputes:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async updateDisputeStatus(req: Request, res: Response) {
    try {
      const { disputeId } = req.params;
      const { status } = req.body;

      const dispute = await Dispute.findOne({ disputeId: parseInt(disputeId) });

      if (!dispute) {
        return res.status(404).json({
          success: false,
          message: 'Dispute not found',
        });
      }

      dispute.status = status;
      await dispute.save();

      res.json({
        success: true,
        dispute,
      });
    } catch (error: any) {
      console.error('Error updating dispute status:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async resolveDispute(req: Request, res: Response) {
    try {
      const { disputeId } = req.params;
      const { winner, resolution, resolvedBy, transactionHash } = req.body;

      const dispute = await Dispute.findOne({ disputeId: parseInt(disputeId) });

      if (!dispute) {
        return res.status(404).json({
          success: false,
          message: 'Dispute not found',
        });
      }

      if (dispute.status === DisputeStatus.RESOLVED) {
        return res.status(400).json({
          success: false,
          message: 'Dispute already resolved',
        });
      }

      dispute.status = DisputeStatus.RESOLVED;
      dispute.winner = winner;
      dispute.resolution = resolution;
      dispute.resolvedBy = resolvedBy.toLowerCase();
      dispute.resolvedAt = new Date();
      dispute.transactionHash = transactionHash;

      await dispute.save();

      const clientUser = await User.findOne({ walletAddress: dispute.client });
      const freelancerUser = await User.findOne({ walletAddress: dispute.freelancer });

      const winnerText =
        winner === DisputeWinner.CLIENT
          ? 'Client'
          : winner === DisputeWinner.FREELANCER
          ? 'Freelancer'
          : 'Split Decision';

      if (clientUser?.email) {
        await emailService.sendDisputeResolvedNotification(
          clientUser.email,
          `Job #${dispute.jobId}`,
          resolution,
          winnerText
        );
      }

      if (freelancerUser?.email) {
        await emailService.sendDisputeResolvedNotification(
          freelancerUser.email,
          `Job #${dispute.jobId}`,
          resolution,
          winnerText
        );
      }

      res.json({
        success: true,
        dispute,
      });
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getDisputeStats(req: Request, res: Response) {
    try {
      const totalDisputes = await Dispute.countDocuments();
      const openDisputes = await Dispute.countDocuments({ status: DisputeStatus.OPEN });
      const underReview = await Dispute.countDocuments({
        status: DisputeStatus.UNDER_REVIEW,
      });
      const resolvedDisputes = await Dispute.countDocuments({
        status: DisputeStatus.RESOLVED,
      });

      const clientWins = await Dispute.countDocuments({
        winner: DisputeWinner.CLIENT,
      });
      const freelancerWins = await Dispute.countDocuments({
        winner: DisputeWinner.FREELANCER,
      });
      const splits = await Dispute.countDocuments({
        winner: DisputeWinner.SPLIT,
      });

      res.json({
        success: true,
        stats: {
          total: totalDisputes,
          open: openDisputes,
          underReview,
          resolved: resolvedDisputes,
          resolutionBreakdown: {
            clientWins,
            freelancerWins,
            splits,
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching dispute stats:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
