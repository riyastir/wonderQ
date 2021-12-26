import { app } from "../app";
import request from "supertest";

describe("POST /api/wonderq - Create messages to the queue", () => {
    it("Create message", async () => {
        const result = await request(app).post("/api/wonderq").send({
            message: "test"
        });
        expect(result.body.message).toEqual("Successfully created the message.");
        expect(result.statusCode).toEqual(200);
    });

    it("Create message without payload", async () => {
        const result = await request(app).post("/api/wonderq");
        expect(result.body.message).toEqual("message is mandatory.");
        expect(result.statusCode).toEqual(400);
    });

    it("Create message with blank message", async () => {
        const result = await request(app).post("/api/wonderq").send({ message: "" });
        expect(result.body.message).toEqual("message is mandatory.");
        expect(result.statusCode).toEqual(400);
    });

    it("Create message with space as message", async () => {
        const result = await request(app).post("/api/wonderq").send({ message: " " });
        expect(result.body.message).toEqual("message is mandatory.");
        expect(result.statusCode).toEqual(400);
    });
});

describe("GET /api/wonderq - Consume messages from the queue", () => {
    it("Consume message", async () => {
        const result = await request(app).get("/api/wonderq");
        expect(result.body.message).toEqual("Successfully retrieved.");
        expect(result.statusCode).toEqual(200);
    });

    it("Consume message - No messages to consume", async () => {
        const result = await request(app).get("/api/wonderq");
        expect(result.body.message).toEqual("No messages found.");
        expect(result.statusCode).toEqual(404);
    });

    it("Consume message - Consume again after 1 min", async () => {
        jest.useFakeTimers();
        jest.advanceTimersByTime(60000)
        const result = await request(app).get("/api/wonderq");
        expect(result.body.message).toEqual("Successfully retrieved.");
        expect(result.statusCode).toEqual(200);
        jest.runAllTimers();
    });
});

describe("DEL /api/wonderq/processed/:id - Delete processed message from queue", () => {
    it("Delete message from the queue - Within the timeout period", async () => {
        const allMessages = await request(app).get("/api/wonderq/all");
        const queueMessageID = allMessages.body.data[0]._id;
        const result = await request(app).delete(`/api/wonderq/processed/${queueMessageID}`);
        expect(result.body.message).toEqual("Succesfully deleted the message from the Queue.");
        expect(result.statusCode).toEqual(200);
    });

    it("Delete message from the queue failed - With invalid message ID", async () => {
        const result = await request(app).delete(`/api/wonderq/processed/abcdefg1345`);
        expect(result.body.message).toEqual("Invalid message ID.");
        expect(result.statusCode).toEqual(404);
    });

    it("Delete message from the queue failed - The message not yet picked by any consumer", async () => {
        const createNewMessage = await request(app).post("/api/wonderq").send({
            message: "test"
        });
        const queueMessageID = createNewMessage.body.data[0]._id;
        const result = await request(app).delete(`/api/wonderq/processed/${queueMessageID}`);
        expect(result.body.message).toEqual("This message is available to consume.");
        expect(result.statusCode).toEqual(400);
    });

    it("Delete message from the queue failed - Timeout happened and available to consume by others", async () => {
        const pickMessagetoProcess = await request(app).get("/api/wonderq");
        const queueMessageID = pickMessagetoProcess.body.data[0]._id;
        jest.useFakeTimers();
        jest.advanceTimersByTime(80000)
        const result = await request(app).delete(`/api/wonderq/processed/${queueMessageID}`);
        expect(result.body.message).toEqual("This message was timed out and available to consume.");
        expect(result.statusCode).toEqual(400);
        jest.runAllTimers();
    });
});