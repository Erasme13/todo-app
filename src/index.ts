import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectToTodosDatabase } from "./services/todos.db";
import { todosRouter } from "./Routes/todo.router";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;   


connectToTodosDatabase()
    .then(() => {
        app.use("/todos", todosRouter);

        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });