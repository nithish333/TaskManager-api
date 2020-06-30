const express = require("express");

require("./db/mongoose");

const port = process.env.PORT;
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");
const app = express();
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.listen(port, () => console.log("Server listening on " + port));
