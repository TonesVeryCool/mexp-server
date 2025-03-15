export interface Plugin {
    unique: string;
    name: string;
    version: string;
    enabled: boolean;
    onLoad(): void;
    onUnload(): void;
    registerHooks?(): void;
}