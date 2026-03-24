import { app } from "../index";
import { Express } from "express";
import { router as userRouter } from "../routes/user.route";
import { router as courseRouter } from "../routes/courses.route";
import { router as mainRouter } from "../routes/main.route";
import { router as questionRouter } from "../routes/questions.route";
import examsRouter from "../routes/exams.route";

export default function route(app: Express) {
  app.use("/", userRouter);
  app.use("/courses", courseRouter);
  app.use("/main", mainRouter);
  app.use("/question", questionRouter);
  app.use("/exam", examsRouter);
}
