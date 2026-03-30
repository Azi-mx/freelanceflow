import { NextFunction, Request, Response } from "express";
import * as ContractService from "../services/contractService.js";
export const getContract = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contractId = req.params.contractId;

    const result = await ContractService.getContract(contractId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const getClientContracts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientId = req.user!.id;
    const result = await ContractService.getClientContracts(clientId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const getFreelancerContracts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const freelancerId = req.user!.id;
    if (!freelancerId) {
      return res.status(400).json({ message: "Freelancer ID is required" });
    }
    const result = await ContractService.getFreelancerContracts(
      freelancerId as string,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const terminateContract = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contractId = req.params.contractId;
    const userId = req.user?.id;

    const result = await ContractService.terminateContract(
      contractId as string,
      userId as string,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const completeContract = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contractId = req.params.contractId;
    const userId = req.user?.id;
    const result = await ContractService.completeContract(
      contractId as string,
      userId as string,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
