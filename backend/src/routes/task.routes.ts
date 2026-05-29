import { Router } from "express";
import { authMiddleware, asyncHandler, AuthRequest } from "../middleware/auth";
import { createTaskSchema, updateTaskSchema, reorderTasksSchema } from "../validators/schemas";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from "../services/task.service";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const tasks = await listTasks(req.user!.userId);
    res.json({ tasks });
  })
);

router.post(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const input = createTaskSchema.parse(req.body);
    const task = await createTask(req.user!.userId, input);
    res.status(201).json({ task });
  })
);

router.put(
  "/reorder",
  asyncHandler(async (req: AuthRequest, res) => {
    const { orderedIds } = reorderTasksSchema.parse(req.body);
    const tasks = await reorderTasks(req.user!.userId, orderedIds);
    res.json({ tasks });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const input = updateTaskSchema.parse(req.body);
    const task = await updateTask(req.user!.userId, String(req.params.id), input);
    res.json({ task });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    await deleteTask(req.user!.userId, String(req.params.id));
    res.status(204).send();
  })
);

export default router;
