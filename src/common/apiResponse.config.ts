import { JSONResponse } from "../interface/jsonResponse";

export class ApiResponse {
    version: string;
    success: boolean;
    status: number;
    message: string;
    data: any[];
    constructor(status: number, message: string, data: any[]) {
        this.version = "v1.0";
        this.success = (status === 200) ? true : false;
        this.status = status;
        this.message = message;
        this.data = data;
    }

    getResponse() {
        const JSONObject: JSONResponse = { version: this.version, success: this.success, status: this.status, message: this.message, data: this.data };
        return JSONObject;
    }
}