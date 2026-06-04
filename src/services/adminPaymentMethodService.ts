const METHODS = [
  { id: 'cod', name: 'Tiền mặt khi nhận hàng (COD)', icon: '💵', description: 'Thanh toán bằng tiền mặt khi nhận được hàng', enabled: true, fee: '0%', min_amount: 0, max_amount: 50000000, instructions: 'Khách hàng thanh toán cho nhân viên giao hàng khi nhận được đơn hàng.' },
  { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', icon: '🏦', description: 'Thanh toán qua chuyển khoản ATM hoặc internet banking', enabled: true, fee: '0%', min_amount: 10000, max_amount: 500000000, instructions: 'Sau khi đặt hàng, quý khách vui lòng chuyển khoản vào tài khoản ngân hàng của chúng tôi và gửi slip xác nhận.' },
  { id: 'vnpay', name: 'VNPay', icon: '💳', description: 'Thanh toán qua cổng thanh toán VNPay', enabled: false, fee: '2.5%', min_amount: 1000, max_amount: 50000000, instructions: 'Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.' },
  { id: 'momo', name: 'MoMo', icon: '📱', description: 'Thanh toán qua ví MoMo', enabled: false, fee: '2.5%', min_amount: 1000, max_amount: 50000000, instructions: 'Quét mã QR MoMo để thanh toán nhanh chóng và an toàn.' },
];

export const getPaymentMethods = () => {
  return METHODS;
};

export const updatePaymentMethod = (id: string, data: Partial<typeof METHODS[0]>) => {
  const idx = METHODS.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Payment method not found');
  Object.assign(METHODS[idx], data);
  return METHODS[idx];
};

export const updatePaymentSettings = (data: any) => {
  return { message: 'Payment settings updated successfully' };
};
