export class CreateId {
    result: string;
    characters: string;
    charactersLength: number;
    lengthOfId: number;
    constructor(lengthOfId: number) {
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        this.charactersLength = this.characters.length;
        this.result = '';
        this.lengthOfId = lengthOfId;
    }

    generateId() {
        for (let i: number = 0; i < this.lengthOfId; i++) {
            this.result += this.characters.charAt(Math.floor(Math.random() *
                this.charactersLength));
        }
        return this.result;
    }
}