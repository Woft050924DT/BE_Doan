import bcrypt from 'bcrypt';
import prisma from '../config/database';

const userSelect = {
  user_id: true,
  email: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  role: true,
  status: true,
  email_verified: true,
  last_login: true,
  created_at: true,
  updated_at: true,
} as const;

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
} as const;

const normalizeProfileData = (data: any) => {
  const allowedFields = ['full_name', 'phone', 'avatar_url'];
  const updateData: any = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

  return updateData;
};

const normalizeAddressData = (data: any, partial = false) => {
  const addressData: any = {};
  const fieldMap: Record<string, string> = {
    addressType: 'address_type',
    fullName: 'full_name',
    addressLine1: 'address_line1',
    addressLine2: 'address_line2',
    postalCode: 'postal_code',
    isDefault: 'is_default',
  };

  [
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
  ].forEach((field) => {
    if (data[field] !== undefined) {
      addressData[field] = data[field];
    }
  });

  Object.entries(fieldMap).forEach(([inputField, dbField]) => {
    if (data[inputField] !== undefined) {
      addressData[dbField] = data[inputField];
    }
  });

  if (!partial) {
    const requiredFields = ['full_name', 'phone', 'address_line1', 'city'];
    const missingFields = requiredFields.filter((field) => !addressData[field]);

    if (missingFields.length > 0) {
      throw new Error('Full name, phone, address line 1 and city are required');
    }
  }

  return addressData;
};

export const createProfile = async (data: any) => {
  const email = data.email;
  const password = data.password;
  const fullName = data.full_name || data.fullName;

  if (!email || !password || !fullName) {
    throw new Error('Email, password and full name are required');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone: data.phone,
        avatar_url: data.avatar_url || data.avatarUrl,
      },
      select: userSelect,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    throw error;
  }
};

export const getProfile = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      ...userSelect,
      user_addresses: {
        select: addressSelect,
        orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
      },
    },
  });

  if (!user) {
    throw new Error('Profile not found');
  }

  return user;
};

export const updateProfile = async (userId: string, data: any) => {
  const updateData = normalizeProfileData(data);

  if (Object.keys(updateData).length === 0) {
    throw new Error('No profile fields to update');
  }

  try {
    return await prisma.users.update({
      where: { user_id: userId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
      select: userSelect,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Profile not found');
    }
    throw error;
  }
};

export const deleteProfile = async (userId: string) => {
  try {
    await prisma.users.delete({
      where: { user_id: userId },
    });
    return { message: 'Profile deleted successfully' };
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Profile not found');
    }
    throw error;
  }
};

export const getAddresses = async (userId: string) => {
  return prisma.user_addresses.findMany({
    where: { user_id: userId },
    select: addressSelect,
    orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
  });
};

export const getAddress = async (userId: string, addressId: string) => {
  const address = await prisma.user_addresses.findFirst({
    where: {
      address_id: addressId,
      user_id: userId,
    },
    select: addressSelect,
  });

  if (!address) {
    throw new Error('Address not found');
  }

  return address;
};

export const createAddress = async (userId: string, data: any) => {
  const addressData = normalizeAddressData(data);

  return prisma.$transaction(async (tx) => {
    if (addressData.is_default === true) {
      await tx.user_addresses.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    return tx.user_addresses.create({
      data: {
        ...addressData,
        user_id: userId,
      },
      select: addressSelect,
    });
  });
};

export const updateAddress = async (userId: string, addressId: string, data: any) => {
  const addressData = normalizeAddressData(data, true);

  if (Object.keys(addressData).length === 0) {
    throw new Error('No address fields to update');
  }

  return prisma.$transaction(async (tx) => {
    const address = await tx.user_addresses.findFirst({
      where: {
        address_id: addressId,
        user_id: userId,
      },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    if (addressData.is_default === true) {
      await tx.user_addresses.updateMany({
        where: {
          user_id: userId,
          address_id: { not: addressId },
        },
        data: { is_default: false },
      });
    }

    return tx.user_addresses.update({
      where: { address_id: addressId },
      data: {
        ...addressData,
        updated_at: new Date(),
      },
      select: addressSelect,
    });
  });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.user_addresses.findFirst({
    where: {
      address_id: addressId,
      user_id: userId,
    },
  });

  if (!address) {
    throw new Error('Address not found');
  }

  await prisma.user_addresses.delete({
    where: { address_id: addressId },
  });

  return { message: 'Address deleted successfully' };
};
