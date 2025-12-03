import express from "express";
import cors from "cors";
import roomsRouter from "./rooms";
import messagesRouter from "./messages";
import usersRouter from "./users";

const app = express();
app.use(cors({ origin: "http://localhost:1420" }));
app.use(express.json());

// mount routers
app.use("/rooms", roomsRouter);
app.use("/messages", messagesRouter);
app.use("/users", usersRouter);

app.listen(1300, () => console.log("server running localhost:1300"));

