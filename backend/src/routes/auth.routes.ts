import { Router } from "express";
import { authMiddleware, asyncHandler, AuthRequest } from "../middleware/auth";
import { registerSchema, loginSchema } from "../validators/schemas";
import { registerUser, loginUser, getUserById } from "../services/auth.service";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json(result);
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.json(result);
  })
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await getUserById(req.user!.userId);
    res.json({ user });
  })
);

export default router;
