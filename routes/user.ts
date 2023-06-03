import express      from "express";
import { protect }  from "../controller/auth";
import { updateMe } from "../controller/user";

const router = express.Router ();

router.post ( "/update-me", protect, updateMe );
export default router;