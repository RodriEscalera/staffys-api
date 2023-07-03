import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { UserController } from "../controllers";

const router = Router();

router.get(
  "/all/delivery-people",
  AuthMiddleware.validateUser,
  AuthMiddleware.checkAdmin,
  UserController.getDeliveryPeople
);
router.put(
  "/update",
  AuthMiddleware.validateUser,
  UserController.updateUserById
);
router.delete(
  "/:_id",
  AuthMiddleware.validateUser,
  UserController.deleteUserById
);
router.post(
  "/take-package",
  AuthMiddleware.validateUser,
  UserController.takePackage
);
router.post(
  "/start-delivery",
  AuthMiddleware.validateUser,
  UserController.startDelivery
);

export { router as userRoutes };
