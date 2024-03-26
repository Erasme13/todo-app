import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { todos?: mongoDB.Collection } = {}

export async function connectToTodosDatabase () {
    dotenv.config();
 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING ?? '');
            
    await client.connect();
        
    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const todosCollection: mongoDB.Collection = db.collection(process.env.TODOS_COLLECTION_NAME ?? '');
 
  collections.todos = todosCollection;
       
         console.log(`Successfully connected to database: ${db.databaseName} and collection: ${todosCollection.collectionName}`);
 }