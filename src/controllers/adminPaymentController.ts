import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminPayments as getAdminPaymentsService,
  refundPayment as refundPaymentService,
  updatePaymentStatus as updatePaymentStatusService,
} from '../services/adminPaymentService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, status, payment_method } = req.query;
    const result = await getAdminPaymentsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      status: status as string | undefined,
      payment_method: payment_method as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refundPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid payment ID format' });
    const { refund_amount } = req.body;
    const result = await refundPaymentService(id as string, refund_amount);
    res.json(result);
  } catch (error: any) {
    console.error('Refund payment error:', error);
    if (error.message === 'Payment not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid payment ID format' });
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const result = await updatePaymentStatusService(id as string, status);
    res.json(result);
  } catch (error: any) {
    console.error('Update payment status error:', error);
    if (error.message === 'Payment not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
