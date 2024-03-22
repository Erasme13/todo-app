"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const todos_db_1 = require("./services/todos.db");
const todo_router_1 = require("./Routes/todo.router");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
(0, todos_db_1.connectToTodosDatabase)()
    .then(() => {
    app.use("/todos", todo_router_1.todosRouter);
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error("Database connection failed", error);
    process.exit();
});
