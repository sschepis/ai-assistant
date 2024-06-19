export interface Tool {
    schema: any,
    action: (params: any, api: any) => any
}

export interface Action {
    type: string,
    payload: any
}

export enum WorkerStates {
    RESET = 'RESET',
    SET_STATE = 'SET_STATE',
    SET_PERCENT_COMPLETE = 'SET_PERCENT_COMPLETE',
    COMPLETE_TASK = 'COMPLETE_TASK',
    COMPLETE_SESSION = 'COMPLETE_SESSION'
}

export interface Task {
    name: string;
    workProducts: string[];
    lastResponse?: string;
}

export interface State {
    thoughts: string;
    finalOutput: string;
    completedTasks: Task[];
    remainingTasks: string[];
    history: any[];
    currentTask: Task | null;
    percentComplete: number;
    setRemainingTasks: (tasks: string[]) => void;
    setCurrentTaskResponse: (response: string) => void;
    addWorkProductToCurrentTask: (workProduct: string) => void;
    completeCurrentTask: () => void;
    completeCurrentSession: () => void;
    generateFormattedRepresentation: () => string;
    setPercentComplete: (percent: number) => void;
}
