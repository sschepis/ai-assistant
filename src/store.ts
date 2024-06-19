
import { create } from 'zustand';
import { State } from './constants';

const useStore = create<State>((set, get) => ({
    thoughts: '',
    finalOutput: '',
    completedTasks: [],
    remainingTasks: [],
    history: [],
    currentTask: null,
    percentComplete: 0,

    setRemainingTasks: (tasks: string[]) => {
        set((state) => ({
            remainingTasks: tasks,
            currentTask: tasks.length > 0 ? { name: tasks[0], workProducts: [] } : null,
        }));
    },

    setCurrentTaskResponse: (response: string) => {
        set((state) => ({
            currentTask: state.currentTask ? { ...state.currentTask, lastResponse: response } : null,
        }));
    },

    addWorkProductToCurrentTask: (workProduct: string) => {
        set((state) => ({
            currentTask: state.currentTask
                ? { ...state.currentTask, workProducts: [...state.currentTask.workProducts, workProduct] }
                : null,
        }));
    },

    addHistory: (entry: string) => {
        set((state) => ({ history: [...state.history, entry] }));
    },

    setPercentComplete: (percent: number) => {
        set({ percentComplete: percent });
    },

    completeCurrentTask: () => {
        set((state) => {
            if (!state.currentTask) return {};

            const completedTask = { name: state.currentTask.name, workProducts: state.currentTask.workProducts };
            const remainingTasks = state.remainingTasks.slice(1);
            const currentTask = remainingTasks.length > 0 ? { name: remainingTasks[0], workProducts: [] } : null;
            const percentComplete = remainingTasks.length === 0 ? 100 : state.percentComplete;

            return {
                completedTasks: [...state.completedTasks, completedTask],
                remainingTasks,
                currentTask,
                percentComplete,
            };
        });
    },

    completeCurrentSession: () => {
        set((state) => ({
            completedTasks: [],
            remainingTasks: [],
            history: [ ...state.history, state.generateFormattedRepresentation() ],
            currentTask: null,
            percentComplete: 0,
        }));
    },

    generateFormattedRepresentation: (showHistory = false) => {
        const state = get();
        const thoughts = state.thoughts ? `Thoughts: ${state.thoughts}\n` : '';
        const completedTasks = state.completedTasks.length > 0
            ? `Completed Tasks:\n${state.completedTasks.map((task) => `  - ${task.name} (${task.workProducts.join(', ')})`).join('\n')}\n`
            : '';
        const currentTask = state.currentTask ? `Current Task: ${state.currentTask.name} (${state.currentTask.workProducts.join(', ')})\n` : '';
        const remainingTasks = state.remainingTasks.length > 0 ? `Remaining Tasks: ${state.remainingTasks.join(', ')}\n` : '';
        const percentComplete = `Percent Complete: ${state.percentComplete}%`;

        const out =  `${thoughts}${completedTasks}${currentTask}${remainingTasks}${percentComplete}`;
        if (showHistory) {
            return `${out}\nHistory:\n${state.history.join('\n')}`;
        }
        return out;
    }
}));

export default useStore;