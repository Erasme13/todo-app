"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const user_db_js_1 = require("../services/user.db.js");
const user_js_1 = __importDefault(require("../models/user.js"));
exports.usersRouter = express_1.default.Router();
exports.usersRouter.use(express_1.default.json());
exports.usersRouter.get("/", async (_req, res) => {
    try {
        const usersFromDb = await user_db_js_1.collections.users?.find({}).toArray() ?? [];
        const users = usersFromDb.map((userDoc) => {
            return new user_js_1.default(userDoc.username, userDoc.email, userDoc.password, userDoc._id.toString());
        });
        res.status(200).send(users);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.usersRouter.get("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const userFromDb = await user_db_js_1.collections.users?.findOne({ _id: new mongodb_1.ObjectId(userId) });
        if (!userFromDb) {
            res.status(404).send("User not found");
            return;
        }
        const user = new user_js_1.default(userFromDb.username, userFromDb.email, userFromDb.password, userFromDb.createdAt);
        res.status(200).send(user);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.usersRouter.post("/", async (req, res) => {
    try {
        const newUser = req.body;
        const result = await user_db_js_1.collections.users?.insertOne(newUser);
        if (result && result.insertedId) {
            const insertedUser = await user_db_js_1.collections.users?.findOne({ _id: result.insertedId });
            if (insertedUser) {
                res.status(201).send({ message: `Successfully created a new user with id ${result.insertedId}`, user: insertedUser });
            }
            else {
                console.error('Failed to fetch newly created user:', result.insertedId);
                res.status(500).send("Failed to fetch newly created user.");
            }
        }
        else {
            console.error('Failed to create user:', newUser);
            res.status(500).send("Failed to create a new user.");
        }
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send(error.message);
    }
});
exports.usersRouter.put("/:id", async (req, res) => {
    const id = req?.params?.id;
    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }
        const updatedUser = req.body;
        const query = { _id: new mongodb_1.ObjectId(id) };
        if (user_db_js_1.collections.users) {
            const result = await user_db_js_1.collections.users.updateOne(query, { $set: updatedUser });
            if (result) {
                if (result.modifiedCount > 0) {
                    res.status(200).send(`Successfully updated user with id ${id}`);
                }
                else {
                    res.status(304).send(`User with id: ${id} not updated`);
                }
            }
            else {
                console.error('Failed to update user');
                res.status(500).send("Failed to update user");
            }
        }
        else {
            console.error('users collection is not available');
            res.status(500).send("Failed to update user: users collection is not available");
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
exports.usersRouter.delete("/:id", async (req, res) => {
    const id = req?.params?.id;
    try {
        if (!id) {
            throw new Error("ID parameter is missing");
        }
        const query = { _id: new mongodb_1.ObjectId(id) };
        const result = await user_db_js_1.collections.users?.deleteOne(query);
        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed user with id ${id}`);
        }
        else if (!result) {
            res.status(400).send(`Failed to remove user with id ${id}`);
        }
        else if (!result.deletedCount) {
            res.status(404).send(`User with id ${id} does not exist`);
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
