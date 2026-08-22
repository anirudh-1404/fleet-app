import express from "express";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getContacts);
router.get("/:id", protect, getContactById);
router.post("/", protect, createContact);
router.patch("/:id", protect, updateContact);
router.delete("/:id", protect, deleteContact);

export default router;
