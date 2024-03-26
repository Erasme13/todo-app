import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectToTodosDatabase } from "./services/todos.db";
import {connectToUsersDatabase} from "./services/user.db";
import { todosRouter } from "./Routes/todo.router";
import { usersRouter } from "./Routes/user.router";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;   


Promise.all([connectToTodosDatabase(), connectToUsersDatabase()])
    .then(() => {
        app.use("/todos", todosRouter);
        app.use("/users", usersRouter);

        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });