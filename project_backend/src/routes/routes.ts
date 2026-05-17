import { app } from "../index";
import { Express } from "express";
import { router as userRouter } from "../routes/user.route";
import { router as courseRouter } from "../routes/courses.route";
import { router as mainRouter } from "../routes/main.route";
import { router as questionRouter } from "../routes/questions.route";
import { router as authorityRouter } from "../routes/authority.route";
import { router as logRouter } from "../routes/log.route";
import examsRouter from "../routes/exams.route";
import { router as apiTestRouter } from "../routes/api_test.route";
import { router as latexRouter } from "../routes/latex.route";
import { router as imageRouter } from "../routes/image.route";
import { router as Question2Router } from "../routes/question2.route";
import { router as unitRouter } from "../routes/unit.route";

export default function route(app: Express) {
  app.use("/courses", courseRouter);
  app.use("/main", mainRouter);
  app.use("/question", questionRouter);
  app.use("/exam", examsRouter);
  app.use("/authority", authorityRouter);
  app.use("/log", logRouter);
  app.use("/api-test", apiTestRouter);
  app.use("/latex", latexRouter);
  app.use("/image", imageRouter);
  app.use("/question2", Question2Router);
  app.use("/", userRouter);
  app.use("/units", unitRouter);
}
