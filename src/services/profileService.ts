import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import {
  UpdateClientInput,
  UpdateFreelancerInput,
} from "../validations/profile.validation.js";

export const updateFreelancerProfile = async (
  user_id: string,
  data: UpdateFreelancerInput,
) => {
  const user = await User.findById(user_id);
  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "freelancer") throw new AppError("Access Denied", 403);

  const { name, bio, skills, avatar, hourlyRate, portfolio, availability } =
    data;
  Object.assign(user, {
    name,
    bio,
    avatar,
    skills,
    hourlyRate,
    portfolio,
    availability,
  });

  await user.save({ validateBeforeSave: true });
  return {
    id: user._id,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    role: user.role,
    skills: user.skills,
    hourlyRate: user.hourlyRate,
    portfolio: user.portfolio,
    availability: user.availability,
  };
};

export const updateClientProfile = async (
  userId: string,
  data: UpdateClientInput,
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 400);
  if (user.role !== "client") throw new AppError("Access Denied", 403);
  const { name, avatar, companyName, website } = data;
  Object.assign(user, { name, avatar, companyName, website });
  await user.save({ validateBeforeSave: true });
  return {
    id: user._id,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    companyName: user.companyName,
    website: user.website,
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError("User not found", 404);
  return user;
};
