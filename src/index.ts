import { app, port } from "./app";
// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.warn(`server started at http://localhost:${port}`);
});