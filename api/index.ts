import { Router } from "express";
import apodRouter from "./apod";

const apiRouter = Router();

apiRouter.use("/apod", apodRouter);
apiRouter.use("/planetary/apod", apodRouter);

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default apiRouter;
