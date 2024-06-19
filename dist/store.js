"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var zustand_1 = require("zustand");
var useStore = (0, zustand_1.create)(function (set, get) { return ({
    thoughts: '',
    finalOutput: '',
    completedTasks: [],
    remainingTasks: [],
    history: [],
    currentTask: null,
    percentComplete: 0,
    setRemainingTasks: function (tasks) {
        set(function (state) { return ({
            remainingTasks: tasks,
            currentTask: tasks.length > 0 ? { name: tasks[0], workProducts: [] } : null,
        }); });
    },
    setCurrentTaskResponse: function (response) {
        set(function (state) { return ({
            currentTask: state.currentTask ? __assign(__assign({}, state.currentTask), { lastResponse: response }) : null,
        }); });
    },
    addWorkProductToCurrentTask: function (workProduct) {
        set(function (state) { return ({
            currentTask: state.currentTask
                ? __assign(__assign({}, state.currentTask), { workProducts: __spreadArray(__spreadArray([], state.currentTask.workProducts, true), [workProduct], false) }) : null,
        }); });
    },
    addHistory: function (entry) {
        set(function (state) { return ({ history: __spreadArray(__spreadArray([], state.history, true), [entry], false) }); });
    },
    setPercentComplete: function (percent) {
        set({ percentComplete: percent });
    },
    completeCurrentTask: function () {
        set(function (state) {
            if (!state.currentTask)
                return {};
            var completedTask = { name: state.currentTask.name, workProducts: state.currentTask.workProducts };
            var remainingTasks = state.remainingTasks.slice(1);
            var currentTask = remainingTasks.length > 0 ? { name: remainingTasks[0], workProducts: [] } : null;
            var percentComplete = remainingTasks.length === 0 ? 100 : state.percentComplete;
            return {
                completedTasks: __spreadArray(__spreadArray([], state.completedTasks, true), [completedTask], false),
                remainingTasks: remainingTasks,
                currentTask: currentTask,
                percentComplete: percentComplete,
            };
        });
    },
    completeCurrentSession: function () {
        set(function (state) { return ({
            completedTasks: [],
            remainingTasks: [],
            history: __spreadArray(__spreadArray([], state.history, true), [state.generateFormattedRepresentation()], false),
            currentTask: null,
            percentComplete: 0,
        }); });
    },
    generateFormattedRepresentation: function (showHistory) {
        if (showHistory === void 0) { showHistory = false; }
        var state = get();
        var thoughts = state.thoughts ? "Thoughts: ".concat(state.thoughts, "\n") : '';
        var completedTasks = state.completedTasks.length > 0
            ? "Completed Tasks:\n".concat(state.completedTasks.map(function (task) { return "  - ".concat(task.name, " (").concat(task.workProducts.join(', '), ")"); }).join('\n'), "\n")
            : '';
        var currentTask = state.currentTask ? "Current Task: ".concat(state.currentTask.name, " (").concat(state.currentTask.workProducts.join(', '), ")\n") : '';
        var remainingTasks = state.remainingTasks.length > 0 ? "Remaining Tasks: ".concat(state.remainingTasks.join(', '), "\n") : '';
        var percentComplete = "Percent Complete: ".concat(state.percentComplete, "%");
        var out = "".concat(thoughts).concat(completedTasks).concat(currentTask).concat(remainingTasks).concat(percentComplete);
        if (showHistory) {
            return "".concat(out, "\nHistory:\n").concat(state.history.join('\n'));
        }
        return out;
    }
}); });
exports.default = useStore;
