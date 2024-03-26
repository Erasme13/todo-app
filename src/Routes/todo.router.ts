import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/todos.db.js";
import Todo from "../models/todo.js";

export const todosRouter = express.Router();
todosRouter.use(express.json());

todosRouter.get("/", async (_req: Request, res: Response) => {
    try {
        const todosFromDb = await collections.todos?.find({}).toArray() ?? [];

        const todos: Todo[] = todosFromDb.map((todoDoc: any) => {
            return new Todo(todoDoc.name, todoDoc.category, todoDoc.description, todoDoc.DateAdded, todoDoc._id.toString());
        });
        res.status(200).send(todos);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

todosRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const todoId = req.params.id;
        
        const todoFromDb = await collections.todos?.findOne({ _id: new ObjectId(todoId) });
        
        if (!todoFromDb) {
            res.status(404).send("Todo not found");
            return;
        }
        
        const todo: Todo = new Todo(
            todoFromDb.name,
            todoFromDb.category,
            todoFromDb.description,
            todoFromDb.DateAdded,
            todoFromDb._id.toString()
        );
        res.status(200).send(todo);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});


todosRouter.post("/", async (req: Request, res: Response) => {
    try {
        // Check if todos collection exists
        if (!collections.todos) {
            throw new Error("todos collection is not available");
        }

        // const { name, description, category }: { name: string, description: string, category: string } = req.body;

        // if (!name || !description || !category) {
        //     return res.status(400).send("All fields are required");
        // }

        
        const newTodo = req.body as Todo;
        const result = await collections.todos.insertOne(newTodo);

        if (result.insertedId) {
            const insertedTodo = await collections.todos.findOne({ _id: result.insertedId });

            if (insertedTodo) {
                res.status(201).send({ message: `Successfully created a new todo with id ${result.insertedId}`, todo: insertedTodo });
            } else {
                console.error('Failed to fetch newly created todo:', result.insertedId);
                res.status(500).send("Failed to fetch newly created todo.");
            }
        } else {
            console.error('Failed to create todo:', newTodo);
            res.status(500).send("Failed to create a new todo.");
        }
    } catch (error: any) {
        console.error('Error creating todo:', error);
        res.status(400).send(error.message);
    }
});

todosRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }

        const updatedTodo: Todo = req.body as Todo;
        const query = { _id: new ObjectId(id) };

        if (collections.todos) {
            const result = await collections.todos.updateOne(query, { $set: updatedTodo });
            result
                ? res.status(200).send(`Successfully updated todo with id ${id}`)
                : res.status(304).send(`Todo with id: ${id} not updated`);
        } else {
            console.error('todos collection is not available');
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

todosRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }

        const query = { _id: new ObjectId(id) };
        const result = await collections.todos?.deleteOne(query); // Add null check for collections.todos

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed todo with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove todo with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Todo with id ${id} does not exist`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
