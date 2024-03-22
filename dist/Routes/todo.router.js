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
        // Fetch todos from the database
        const todosFromDb = await todos_db_js_1.collections.todos?.find({}).toArray() ?? [];
        // Map database documents to Todo objects
        const todos = todosFromDb.map((todoDoc) => {
            return new todo_js_1.default(todoDoc.name, todoDoc.category, todoDoc.description, todoDoc.DateAdded, todoDoc._id.toString());
        });
        // Send todos as response
        res.status(200).send(todos);
    }
    catch (error) {
        // Handle errors
        res.status(500).send(error.message);
    }
});
exports.todosRouter.post("/", async (req, res) => {
    try {
        // Check if todos collection exists
        if (!todos_db_js_1.collections.todos) {
            throw new Error("todos collection is not available");
        }
        // Extract new todo from request body
        const newTodo = req.body;
        // Insert new todo into the database
        const result = await todos_db_js_1.collections.todos.insertOne(newTodo);
        if (result.insertedId) {
            // Fetch the inserted todo
            const insertedTodo = await todos_db_js_1.collections.todos.findOne({ _id: result.insertedId });
            if (insertedTodo) {
                // Send success response
                res.status(201).send({ message: `Successfully created a new todo with id ${result.insertedId}`, todo: insertedTodo });
            }
            else {
                // Handle error if inserted todo cannot be fetched
                console.error('Failed to fetch newly created todo:', result.insertedId);
                res.status(500).send("Failed to fetch newly created todo.");
            }
        }
        else {
            // Handle error if no insertedId is returned
            console.error('Failed to create todo:', newTodo);
            res.status(500).send("Failed to create a new todo.");
        }
    }
    catch (error) {
        // Handle other errors
        console.error('Error creating todo:', error);
        res.status(400).send(error.message);
    }
});
exports.todosRouter.put("/:id", async (req, res) => {
    const id = req?.params?.id;
    try {
        // Check if ID parameter is missing
        if (!id) {
            throw new Error("ID parameter is missing");
        }
        const updatedTodo = req.body;
        const query = { _id: new mongodb_1.ObjectId(id) };
        if (todos_db_js_1.collections.todos) {
            // Update the todo in the database
            const result = await todos_db_js_1.collections.todos.updateOne(query, { $set: updatedTodo });
            result
                ? res.status(200).send(`Successfully updated todo with id ${id}`)
                : res.status(304).send(`Todo with id: ${id} not updated`);
        }
        else {
            // Handle error if todos collection is not available
            console.error('todos collection is not available');
        }
    }
    catch (error) {
        // Handle other errors
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
exports.todosRouter.delete("/:id", async (req, res) => {
    const id = req?.params?.id;
    try {
        // Check if ID parameter is missing
        if (!id) {
            throw new Error("ID parameter is missing");
        }
        const query = { _id: new mongodb_1.ObjectId(id) };
        const result = await todos_db_js_1.collections.todos?.deleteOne(query); // Add null check for collections.todos
        if (result && result.deletedCount) {
            // Send success response if todo is successfully removed
            res.status(202).send(`Successfully removed todo with id ${id}`);
        }
        else if (!result) {
            // Handle error if result is falsy
            res.status(400).send(`Failed to remove todo with id ${id}`);
        }
        else if (!result.deletedCount) {
            // Handle error if todo with given ID does not exist
            res.status(404).send(`Todo with id ${id} does not exist`);
        }
    }
    catch (error) {
        // Handle other errors
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
