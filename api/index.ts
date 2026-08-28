import { Router } from "express";
import apodRouter from "./apod";
import holidaysRouter from "./holidays";
import singlishRouter from "./singlish";
import healthRouter from "./health";

const apiRouter = Router();

apiRouter.use("/apod", apodRouter);
apiRouter.use("/planetary/apod", apodRouter);
apiRouter.use("/holidays", holidaysRouter);
apiRouter.use("/public-holidays", holidaysRouter);
apiRouter.use("/PublicHolidays", holidaysRouter);
apiRouter.use("/singlish", singlishRouter);
apiRouter.use("/health", healthRouter);

export default apiRouter;
