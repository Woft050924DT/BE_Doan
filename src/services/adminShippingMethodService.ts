const METHODS = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    courier: 'GHTK / GHN',
    eta: '3-5 ngày',
    base_price: 30000,
    free_threshold: 500000,
    max_weight: 30000,
    enabled: true,
    available_cities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa', 'Nha Trang', 'Huế', 'Qui Nhơn', 'Vũng Tàu'],
  },
  {
    id: 'express',
    name: 'Giao hàng nhanh',
    courier: 'GHTK Express',
    eta: '1-2 ngày',
    base_price: 50000,
    free_threshold: 1000000,
    max_weight: 10000,
    enabled: true,
    available_cities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
  },
  {
    id: 'COD',
    name: 'Giao hàng COD',
    courier: 'GHTK / GHN / ViettelPost',
    eta: '3-7 ngày',
    base_price: 35000,
    free_threshold: 0,
    max_weight: 50000,
    enabled: true,
    available_cities: ['Toàn quốc'],
  },
];

export const getShippingMethods = () => {
  return METHODS;
};

export const updateShippingMethod = (id: string, data: Partial<typeof METHODS[0]>) => {
  const idx = METHODS.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Shipping method not found');
  Object.assign(METHODS[idx], data);
  return METHODS[idx];
};

export const updateShippingSettings = (data: any) => {
  return { message: 'Shipping settings updated successfully' };
};
