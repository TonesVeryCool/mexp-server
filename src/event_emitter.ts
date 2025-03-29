// deno-lint-ignore-file no-explicit-any
type EventHandler = (...args: any[]) => void;

export enum EventType {
    SessionStarted,          // (MexpUser user, MexpSession session)
    SessionDisconnected,     // (MexpSession session)
    SpeakMessage,            // (MexpUser user, string message)
    TokenObtained,           // (MexpUser user, boolean legit, string token)
    ScreenToggled,           // (MexpUser user, boolean state)
    GhostMoved,              // (MexpUser user, MexpPosition coordinates)
    MapLoaded,               // (MexpUser user, string map, MexpPosition coordinates)
    ImageRequested,          // (MexpUser user, string filename)
    VideoRequested,          // (MexpUser user, string filename)
    UnknownCustomPacket,     // (MexpUser user, string packet, string variables)
    
}

export class EventEmitter {
    private events: Map<string, Map<EventType, EventHandler[]>> = new Map();
    
    on(scope: string, event: EventType, handler: EventHandler) {
        if (!this.events.has(scope)) {
            this.events.set(scope, new Map());
        }
        const scopeEvents = this.events.get(scope)!;
        if (!scopeEvents.has(event)) {
            scopeEvents.set(event, []);
        }
        scopeEvents.get(event)!.push(handler);
    }
    
    off(scope: string, event: EventType, handler: EventHandler) {
        if (!this.events.has(scope)) return;
        
        const scopeEvents = this.events.get(scope)!;
        if (!scopeEvents.has(event)) return;
        
        scopeEvents.set(event, scopeEvents.get(event)!.filter(h => h !== handler));
    }
    
    emit(event: EventType, ...args: any[]) {
        for (const [_, scopeEvents] of this.events) {
            if (scopeEvents.has(event)) {
                for (const handler of scopeEvents.get(event)!) {
                    handler(...args);
                }
            }
        }
    }

    unhook(scope:string) {
        this.events.delete(scope);
    }
}