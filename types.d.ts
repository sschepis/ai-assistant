type DecentralizedEventHandler = (data: any, state: any, parent: any) => Promise<any>;

type Task = {
    data: any;
    id: string;
    load: number;
    address: string;
}

interface DecentralizedEvent {
    eventType: string;
    action: (data: any, state: any, emitter: DecentralizedEventEmitter) => Promise<any>;
    nextState?: string;
    delay?: number;
    schema?: any;
    emoji?: any;
}

interface ServiceDefinition {
    [key: string]: {
        [key: string]: (state: any, ...args: any[]) => Promise<any>;
    };
}

interface ServiceResponse {
    data: any;
    type: string;
    api: string;
}

interface Task {
    id: string;
    load: number;
    address: string;
}