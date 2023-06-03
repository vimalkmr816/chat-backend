import express   from "express";
import authRoute from "./auth";
import userRoute from "./user";

const router = express.Router ();

router.use ( "/user", userRoute );
router.use ( "/auth", authRoute );

export default router;