import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createAddress as createAddressService,
  createProfile as createProfileService,
  deleteAddress as deleteAddressService,
  deleteProfile as deleteProfileService,
  getAddress as getAddressService,
  getAddresses as getAddressesService,
  getProfile as getProfileService,
  updateAddress as updateAddressService,
  updateProfile as updateProfileService,
} from "../services/profileService";

const handleProfileError = (res: Response, error: any) => {
  if (
    error.message === "No profile fields to update" ||
    error.message === "No address fields to update" ||
    error.message ===
      "Full name, phone, address line 1 and city are required" ||
    error.message === "Email, password and full name are required"
  ) {
    return res.status(400).json({ error: error.message });
  }

  if (error.message === "Email already exists") {
    return res.status(409).json({ error: error.message });
  }

  if (
    error.message === "Profile not found" ||
    error.message === "Address not found"
  ) {
    return res.status(404).json({ error: error.message });
  }

  return res.status(500).json({ error: "Internal server error" });
};

export const createProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createProfileService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Create profile error:", error);
    handleProfileError(res, error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getProfileService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error("Get profile error:", error);
    handleProfileError(res, error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await updateProfileService(req.userId!, req.body);
    res.json(result);
  } catch (error: any) {
    console.error("Update profile error:", error);
    handleProfileError(res, error);
  }
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteProfileService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error("Delete profile error:", error);
    handleProfileError(res, error);
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getAddressesService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error("Get addresses error:", error);
    handleProfileError(res, error);
  }
};

export const getAddress = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getAddressService(
      req.userId!,
      req.params.addressId as string,
    );
    res.json(result);
  } catch (error: any) {
    console.error("Get address error:", error);
    handleProfileError(res, error);
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createAddressService(req.userId!, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Create address error:", error);
    handleProfileError(res, error);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const result = await updateAddressService(
      req.userId!,
      req.params.addressId as string,
      req.body,
    );
    res.json(result);
  } catch (error: any) {
    console.error("Update address error:", error);
    handleProfileError(res, error);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteAddressService(
      req.userId!,
      req.params.addressId as string,
    );
    res.json(result);
  } catch (error: any) {
    console.error("Delete address error:", error);
    handleProfileError(res, error);
  }
};
