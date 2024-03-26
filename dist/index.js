"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const todos_db_1 = require("./services/todos.db");
const user_db_1 = require("./services/user.db");
const todo_router_1 = require("./Routes/todo.router");
const user_router_1 = require("./Routes/user.router");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
Promise.all([(0, todos_db_1.connectToTodosDatabase)(), (0, user_db_1.connectToUsersDatabase)()])
    .then(() => {
    app.use("/todos", todo_router_1.todosRouter);
    app.use("/users", user_router_1.usersRouter);
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error("Database connection failed", error);
    process.exit();
});
