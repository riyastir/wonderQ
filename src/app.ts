import dotenv from "dotenv";
import express, { Application, json, urlencoded } from "express";
import { RoutesConfig } from "./common/routes.config";
import { QueueRoutes } from "./queue/queue.routes.config";

// initialize configuration
dotenv.config();

export const app: Application = express();
export const port: string = process.env.SERVER_PORT;

// Parsing request body
app.use(json())
app.use(urlencoded({ extended: true }))

const routes: RoutesConfig[] = [];
routes.push(new QueueRoutes(app));