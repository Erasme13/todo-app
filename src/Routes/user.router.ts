import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/user.db.js";
import User from "../models/user.js";

export const usersRouter = express.Router();
usersRouter.use(express.json());

usersRouter.get("/", async (_req: Request, res: Response) => {
    try {
        const usersFromDb = await collections.users?.find({}).toArray() ?? [];
        const users: User[] = usersFromDb.map((userDoc: any) => {
            return new User(userDoc.username, userDoc.email, userDoc.password, userDoc._id.toString());
        });
        res.status(200).send(users);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

usersRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const userFromDb = await collections.users?.findOne({ _id: new ObjectId(userId) });
        
        if (!userFromDb) {
            res.status(404).send("User not found");
            return;
        }
        
        const user: User = new User(
            userFromDb.username,
            userFromDb.email,
            userFromDb.password,
            userFromDb.createdAt
        );

        res.status(200).send(user);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});


usersRouter.post("/", async (req: Request, res: Response) => {
    try {
        const newUser = req.body as User;
        const result = await collections.users?.insertOne(newUser);

        if (result && result.insertedId) {
            const insertedUser = await collections.users?.findOne({ _id: result.insertedId });

            if (insertedUser) {
                res.status(201).send({ message: `Successfully created a new user with id ${result.insertedId}`, user: insertedUser });
            } else {
                console.error('Failed to fetch newly created user:', result.insertedId);
                res.status(500).send("Failed to fetch newly created user.");
            }
        } else {
            console.error('Failed to create user:', newUser);
            res.status(500).send("Failed to create a new user.");
        }
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(400).send(error.message);
    }
});

usersRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }

        const updatedUser: User = req.body as User;
        const query = { _id: new ObjectId(id) };

        if (collections.users) {
            const result = await collections.users.updateOne(query, { $set: updatedUser });

            if (result) {
                if (result.modifiedCount > 0) {
                    res.status(200).send(`Successfully updated user with id ${id}`);
                } else {
                    res.status(304).send(`User with id: ${id} not updated`);
                }
            } else {
                console.error('Failed to update user');
                res.status(500).send("Failed to update user");
            }
        } else {
            console.error('users collection is not available');
            res.status(500).send("Failed to update user: users collection is not available");
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

usersRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }

        const query = { _id: new ObjectId(id) };
        const result = await collections.users?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed user with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove user with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`User with id ${id} does not exist`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
