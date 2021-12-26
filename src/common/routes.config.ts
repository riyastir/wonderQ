import { Application } from 'express';

export abstract class RoutesConfig {
    app: Application;
    module: string;
    constructor(app: Application, module: string) {
        this.app = app;
        this.module = module;
        this.moduleRoutes();
    }

    getModule() {
        return this.module;
    }
    abstract moduleRoutes(): Application;
}