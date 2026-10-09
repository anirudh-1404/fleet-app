import express from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id/pdf", downloadInvoicePdf);
router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);
router.post("/", protect, createInvoice);
router.patch("/:id", protect, updateInvoice);
router.delete("/:id", protect, deleteInvoice);

export default router;
