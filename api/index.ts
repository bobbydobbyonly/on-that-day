import { Router } from "express";
import apodRouter from "./apod";
import holidaysRouter from "./holidays";

const apiRouter = Router();

apiRouter.use("/apod", apodRouter);
apiRouter.use("/planetary/apod", apodRouter);
apiRouter.use("/holidays", holidaysRouter);
apiRouter.use("/public-holidays", holidaysRouter);
apiRouter.use("/PublicHolidays", holidaysRouter);

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default apiRouter;
