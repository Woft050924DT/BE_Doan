import prisma from '../config/database';

export const sendChatMessage = async (data: {
  message: string;
  session_id?: string;
  user_id?: string;
  context?: {
    last_order_id?: string;
    last_product_id?: string;
    intent?: string;
  };
}) => {
  let sessionId = data.session_id;

  if (!sessionId) {
    const session = await prisma.ai_chat_sessions.create({
      data: { user_id: data.user_id || null },
    });
    sessionId = session.session_id;
  }

  const userMessage = await prisma.messages.create({
    data: {
      conversation_id: null,
      sender_id: data.user_id || null,
      sender_type: 'user',
      content: data.message,
      intent: data.context?.intent || null,
    },
  });

  const trainingData = await prisma.ai_training_data.findMany({
    where: { is_active: true },
  });

  let bestMatch: { question: string; answer: string; intent: string } | null = null;
  let bestScore = 0;

  for (const qa of trainingData) {
    const score = computeSimilarity(data.message.toLowerCase(), qa.question.toLowerCase());
    if (score > bestScore && score > 0.3) {
      bestScore = score;
      bestMatch = { question: qa.question, answer: qa.answer, intent: qa.intent || 'general' };
      await prisma.ai_training_data.update({
        where: { training_id: qa.training_id },
        data: { usage_count: { increment: 1 } },
      });
    }
  }

  const intent = bestMatch?.intent || detectIntent(data.message);
  const reply = bestMatch?.answer || getDefaultReply(data.message);
  const confidence = bestScore > 0.3 ? bestScore : 0.5;

  await prisma.ai_chat_logs.create({
    data: {
      session_id: sessionId,
      message_id: userMessage.message_id,
      prompt: data.message,
      response: reply,
      confidence_score: confidence,
      intent,
    },
  });

  const botMessage = await prisma.messages.create({
    data: {
      conversation_id: null,
      sender_type: 'bot',
      sender_id: null,
      content: reply,
      intent,
    },
  });

  const suggestions = getSuggestions(intent, data.message);

  return {
    reply,
    session_id: sessionId,
    intent,
    confidence,
    suggestions,
    handoff: confidence < 0.3,
    data: null,
  };
};

function computeSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
}

function detectIntent(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('đơn hàng') || msg.includes('order') || msg.includes('theo dõi')) return 'order_inquiry';
  if (msg.includes('giá') || msg.includes('price') || msg.includes('bao nhiêu')) return 'price_inquiry';
  if (msg.includes('mua') || msg.includes('order') || msg.includes('đặt')) return 'purchase_intent';
  if (msg.includes('hoàn') || msg.includes('trả') || msg.includes('refund')) return 'return_policy';
  if (msg.includes('giao') || msg.includes('ship') || msg.includes('vận chuyển')) return 'shipping_info';
  if (msg.includes('điện thoại') || msg.includes('laptop') || msg.includes('iphone') || msg.includes('samsung')) return 'product_inquiry';
  return 'general';
}

function getDefaultReply(message: string): string {
  const intent = detectIntent(message);
  const replies: Record<string, string> = {
    order_inquiry: 'Bạn có thể kiểm tra trạng thái đơn hàng trong mục "Đơn hàng của tôi" trên tài khoản. Nếu cần hỗ trợ thêm, vui lòng cung cấp mã đơn hàng.',
    price_inquiry: 'Bạn có thể xem giá sản phẩm trên trang chi tiết sản phẩm. Nếu bạn cần tư vấn thêm, mình sẵn sàng hỗ trợ!',
    product_inquiry: 'Cảm ơn bạn đã quan tâm! Mình có thể giúp bạn tìm hiểu thêm về sản phẩm. Bạn cần thông tin gì thêm?',
    shipping_info: 'Chúng tôi hỗ trợ giao hàng tiêu chuẩn (3-5 ngày) và giao hàng nhanh (1-2 ngày). Chi phí ship tùy thuộc vào địa chỉ nhận hàng.',
    return_policy: 'Bạn có thể hoàn trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên seal. Vui lòng liên hệ hotline để được hỗ trợ.',
    general: 'Cảm ơn bạn đã nhắn tin! Mình đã ghi nhận câu hỏi và sẽ hỗ trợ sớm nhất có thể. Bạn có thể mô tả thêm không?',
  };
  return replies[intent] || replies.general;
}

function getSuggestions(intent: string, message: string): string[] {
  const base: Record<string, string[]> = {
    order_inquiry: ['Kiểm tra đơn hàng', 'Hủy đơn hàng', 'Liên hệ hỗ trợ'],
    price_inquiry: ['Xem iPhone 15', 'Xem Samsung Galaxy', 'Khuyến mãi hiện tại'],
    product_inquiry: ['So sánh sản phẩm', 'Xem đánh giá', 'Tìm sản phẩm tương tự'],
    shipping_info: ['Phí ship', 'Thời gian giao', 'Đơn vị vận chuyển'],
    return_policy: ['Chi tiết đổi trả', 'Liên hệ hotline', 'Điều kiện đổi trả'],
    general: ['Xem sản phẩm mới', 'Khuyến mãi', 'Liên hệ hỗ trợ'],
  };
  return base[intent] || base.general;
}

export const getChatHistory = async (sessionId: string, limit: number = 50) => {
  return prisma.messages.findMany({
    where: { conversation_id: sessionId },
    orderBy: { created_at: 'asc' },
    take: limit,
  });
};
