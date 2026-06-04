import prisma from '../config/database';

const addressSelect = {
  address_id: true,
  user_id: true,
  address_type: true,
  full_name: true,
  phone: true,
  address_line1: true,
  address_line2: true,
  city: true,
  district: true,
  ward: true,
  postal_code: true,
  country: true,
  is_default: true,
  created_at: true,
  updated_at: true,
};

export const getAddresses = async (userId: string) => {
  return prisma.user_addresses.findMany({
    where: { user_id: userId },
    orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    select: addressSelect,
  });
};

export const createAddress = async (userId: string, data: any) => {
  const {
    address_type,
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    district,
    ward,
    postal_code,
    country,
    is_default,
  } = data;

  if (!full_name || !phone || !address_line1 || !city) {
    throw new Error('Required address fields are missing');
  }

  if (is_default) {
    await prisma.user_addresses.updateMany({
      where: { user_id: userId },
      data: { is_default: false },
    });
  }

  return prisma.user_addresses.create({
    data: {
      user_id: userId,
      address_type: address_type || 'shipping',
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      district,
      ward,
      postal_code,
      country: country || 'Vietnam',
      is_default: is_default ?? false,
    },
    select: addressSelect,
  });
};

export const updateAddress = async (userId: string, addressId: string, data: any) => {
  const existing = await prisma.user_addresses.findFirst({
    where: { address_id: addressId, user_id: userId },
  });

  if (!existing) {
    throw new Error('Address not found');
  }

  if (data.is_default) {
    await prisma.user_addresses.updateMany({
      where: { user_id: userId },
      data: { is_default: false },
    });
  }

  const patch: Record<string, unknown> = { updated_at: new Date() };
  const keys = [
    'address_type',
    'full_name',
    'phone',
    'address_line1',
    'address_line2',
    'city',
    'district',
    'ward',
    'postal_code',
    'country',
    'is_default',
  ] as const;
  for (const k of keys) {
    if (data[k] !== undefined) patch[k] = data[k];
  }

  return prisma.user_addresses.update({
    where: { address_id: addressId },
    data: patch as any,
    select: addressSelect,
  });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const existing = await prisma.user_addresses.findFirst({
    where: { address_id: addressId, user_id: userId },
  });

  if (!existing) {
    throw new Error('Address not found');
  }

  await prisma.user_addresses.delete({ where: { address_id: addressId } });

  return { success: true };
};
