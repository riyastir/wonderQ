import { RoutesConfig } from '../common/routes.config';
import { Application, Request, Response } from 'express';
import { CreateId } from '../common/createId';
import { DataStoreInterface } from "../interface/dataStore";
import { ApiResponse } from '../common/apiResponse.config';

export class QueueRoutes extends RoutesConfig {
    dataStore: DataStoreInterface[];
    constructor(app: Application) {
        super(app, "wonderq");
        this.dataStore = [];
    }

    moduleRoutes() {
        this.app.route('/api/wonderq/all').get((req: Request, res: Response) => {
            try {
                return res.status(200).json(new ApiResponse(200, "Successfully retrieved.", this.dataStore).getResponse())
            } catch (error) {
                return res.status(500).json(new ApiResponse(500, "Something went wrong.", []).getResponse())
            }
        });
        this.app.route('/api/wonderq/processed/:id').delete((req: Request, res: Response) => {
            try {
                const messageQueueIndex: number = this.dataStore.map((message) => { return message._id }).indexOf(req.params.id);
                if (messageQueueIndex !== -1) {
                    if (this.dataStore[messageQueueIndex].timeout !== null && this.dataStore[messageQueueIndex].timeout > new Date()) {
                        this.dataStore.splice(messageQueueIndex, 1);
                        return res.status(200).json(new ApiResponse(200, "Succesfully deleted the message from the Queue.", []).getResponse());
                    } else {
                        if (this.dataStore[messageQueueIndex].timeout === null) {
                            return res.status(400).json(new ApiResponse(400, "This message is available to consume.", [this.dataStore[messageQueueIndex]]).getResponse());
                        }
                        return res.status(400).json(new ApiResponse(400, "This message was timed out and available to consume.", [this.dataStore[messageQueueIndex]]).getResponse());
                    }
                } else {

                    return res.status(404).json(new ApiResponse(404, "Invalid message ID.", []).getResponse());
                }

            } catch (error) {

                return res.status(500).json(new ApiResponse(500, "Something went wrong.", []).getResponse());
            }

        });
        this.app.route('/api/wonderq').get((req: Request, res: Response) => {
            try {
                const tempDataStore: DataStoreInterface[] = this.dataStore.filter((message) => {
                    if (message.timeout === null || message.timeout < new Date()) {
                        return message;
                    }
                });
                const retrievedMessage: DataStoreInterface = tempDataStore[0];
                if (retrievedMessage) {
                    const queue_timeout: string = (process.env.QUEUE_TIMEOUT ? process.env.QUEUE_TIMEOUT : "1");
                    retrievedMessage.timeout = new Date(new Date().getTime() + parseInt(queue_timeout) * 60000);
                    retrievedMessage.is_received = true;

                    return res.status(200).json(new ApiResponse(200, "Successfully retrieved.", [retrievedMessage]).getResponse());
                } else {
                    return res.status(404).json(new ApiResponse(404, "No messages found.", []).getResponse())
                }
            } catch (error) {
                return res.status(500).json(new ApiResponse(500, "Something went wrong.", []).getResponse())
            }
        }).post((req: Request, res: Response) => {
            try {
                if ("message" in req.body) {
                    if (req.body.message.trim() !== "") {
                        const data: DataStoreInterface = { _id: new CreateId(10).generateId(), message: req.body.message, is_received: false, timeout: null };
                        this.dataStore.push(data);
                        return res.status(200).json(new ApiResponse(200, "Successfully created the message.", [data]).getResponse());
                    } else {
                        return res.status(400).json(new ApiResponse(400, "message is mandatory.", []).getResponse())
                    }
                } else {
                    return res.status(400).json(new ApiResponse(400, "message is mandatory.", []).getResponse())
                }

            } catch (error) {
                return res.status(500).json(new ApiResponse(500, "Something went wrong.", []).getResponse())
            }
        });

        return this.app;
    }
}