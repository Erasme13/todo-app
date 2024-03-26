"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.todosRouter = void 0;
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const todos_db_js_1 = require("../services/todos.db.js");
const todo_js_1 = __importDefault(require("../models/todo.js"));
exports.todosRouter = express_1.default.Router();
exports.todosRouter.use(express_1.default.json());
exports.todosRouter.get("/", async (_req, res) => {
    try {
        const todosFromDb = await todos_db_js_1.collections.todos?.find({}).toArray() ?? [];
        const todos = todosFromDb.map((todoDoc) => {
            return new todo_js_1.default(todoDoc.name, todoDoc.category, todoDoc.description, todoDoc.DateAdded, todoDoc._id.toString());
        });
        res.status(200).send(todos);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.todosRouter.get("/:id", async (req, res) => {
    try {
        const todoId = req.params.id;
        const todoFromDb = await todos_db_js_1.collections.todos?.findOne({ _id: new mongodb_1.ObjectId(todoId) });
        if (!todoFromDb) {
            res.status(404).send("Todo not found");
            return;
        }
        const todo = new todo_js_1.default(todoFromDb.name, todoFromDb.category, todoFromDb.description, todoFromDb.DateAdded, todoFromDb._id.toString());
        res.status(200).send(todo);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.todosRouter.post("/", async (req, res) => {
    try {
        // Check if todos collection exists
        if (!todos_db_js_1.collections.todos) {
            throw new Error("todos collection is not available");
        }
        // const { name, description, category }: { name: string, description: string, category: string } = req.body;
        // if (!name || !description || !category) {
        //     return res.status(400).send("All fields are required");
        // }
        const newTodo = req.body;
        const result = await todos_db_js_1.collections.todos.insertOne(newTodo);
        if (result.insertedId) {
            const insertedTodo = await todos_db_js_1.collections.todos.findOne({ _id: result.insertedId });
            if (insertedTodo) {
                res.status(201).send({ message: `Successfully created a new todo with id ${result.insertedId}`, todo: insertedTodo });
            }
            else {
                console.error('Failed to fetch newly created todo:', result.insertedId);
                res.status(500).send("Failed to fetch newly created todo.");
            }
        }
        else {
            console.error('Failed to create todo:', newTodo);
            res.status(500).send("Failed to create a new todo.");
        }
    }
    catch (error) {
        console.error('Error creating todo:', error);
        res.status(400).send(error.message);
    }
});
exports.todosRouter.put("/:id", async (req, res) => {
    const id = req?.params?.id;
    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }
        const updatedTodo = req.body;
        const query = { _id: new mongodb_1.ObjectId(id) };
        if (todos_db_js_1.collections.todos) {
            const result = await todos_db_js_1.collections.todos.updateOne(query, { $set: updatedTodo });
            result
                ? res.status(200).send(`Successfully updated todo with id ${id}`)
                : res.status(304).send(`Todo with id: ${id} not updated`);
        }
        else {
            console.error('todos collection is not available');
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
exports.todosRouter.delete("/:id", async (req, res) => {
    const id = req?.params?.id;
    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }
        const query = { _id: new mongodb_1.ObjectId(id) };
        const result = await todos_db_js_1.collections.todos?.deleteOne(query); // Add null check for collections.todos
        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed todo with id ${id}`);
        }
        else if (!result) {
            res.status(400).send(`Failed to remove todo with id ${id}`);
        }
        else if (!result.deletedCount) {
            res.status(404).send(`Todo with id ${id} does not exist`);
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
