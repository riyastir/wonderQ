export interface DataStoreInterface {
    _id: string;
    message: string;
    is_received: boolean;
    timeout: Date | null;
}