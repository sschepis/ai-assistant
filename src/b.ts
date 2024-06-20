import * as blessed from 'blessed';
import contrib from 'blessed-contrib';

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

const header = grid.set(0, 0, 1, 12, blessed.box, {
    content: 'AI Agent v1.0',
    style: {
        fg: 'white',
        bg: 'blue',
    },
});

const sidebar = grid.set(1, 0, 11, 3, blessed.box, {
    style: {
        fg: 'white',
        bg: 'gray',
    },
});

const mainContent = grid.set(1, 3, 11, 9, blessed.box, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});

const navigationMenu = grid.set(1, 0, 11, 3, contrib.tree, {
    style: {
        fg: 'white',
        bg: 'gray',
    },
    template: {
        lines: true,
    },
});

navigationMenu.setData({
    extended: true,
    children: [
        {
            name: 'New Task',
            children: [],
        },
        {
            name: 'Task History',
            children: [],
        },
        {
            name: 'Settings',
            children: [],
        },
        {
            name: 'Help',
            children: [],
        },
    ],
} as any);

navigationMenu.on('select', (node) => {
    switch (node.name) {
        case 'New Task':
            // Display new task input in main content area
            break;
        case 'Task History':
            // Display task history in main content area
            break;
        case 'Settings':
            // Display settings in main content area
            break;
        case 'Help':
            // Display help documentation in main content area
            //helpSection.display();
            break;
    }
});

const inputBox = blessed.textbox({
    parent: mainContent,
    bottom: 0,
    left: 0,
    width: '100%',
    height: 3,
    inputOnFocus: true,
    style: {
        fg: 'white',
        bg: 'black',
    },
});

const conversationHistory = contrib.log({
    parent: mainContent,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%-3',
    style: {
        fg: 'white',
        bg: 'black',
    },
    scrollable: true,
    scrollbar: {
        bg: 'blue',
    },
} as any);

inputBox.on('submit', async (value) => {
    // Display loading indicator
    loadingIndicator.load();

    try {
        // Process the task asynchronously
        const result = await processTask(value);

        // Update conversation history
        if (detailedOutput) {
            conversationHistory.log(`Task ID: ${result.taskId}`);
            conversationHistory.log(`Chat Message: ${result.chatMessage}`);
            conversationHistory.log(`Script: ${result.script}`);
        }
        conversationHistory.log(`Result: ${result.output}`);

        // Display task details
        taskDetails.setMarkdown(`
### Task Details
- Task ID: ${result.taskId}
- Chat Message: ${result.chatMessage}
- Script: ${result.script}
- Output: ${result.output}
`);

        // Clear input box
        inputBox.clearValue();
        screen.render
    } catch (error: any) {
        // Display error message
        //errorMessage.display(error.message);
        errorSection.setContent(error.stack);
    } finally {
        // Hide loading indicator
        loadingIndicator.stop();
    }
});

const loadingIndicator = grid.set(5, 5, 3, 3, contrib.gauge, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});

const taskDetails: any = grid.set(1, 3, 11, 9, contrib.markdown, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});

const progressBar = grid.set(6, 4, 1, 4, contrib.gauge, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});

let detailedOutput = true;

const toggleDetailedOutput = () => {
    detailedOutput = !detailedOutput;
    // Update conversation history display based on detailed output setting
    screen.render();

};

const errorMessage = grid.set(4, 4, 3, 4, contrib.markdown, {
    style: {
        fg: 'white',
        bg: 'red',
    },
});

const errorSection = grid.set(7, 4, 4, 4, blessed.box, {
    style: {
        fg: 'white',
        bg: 'red',
    },
});

screen.key(['C-x'], () => {
    // Handle task execution shortcut
    inputBox.focus();
    screen.render();
});

screen.key(['C-d'], toggleDetailedOutput);

screen.key(['up', 'down'], (ch, key) => {
    // Handle navigation within input textbox
    if (key.name === 'up' || key.name === 'down') {
        conversationHistory.scroll(key.name === 'up' ? -1 : 1);
        screen.render();
    }
});

screen.key(['pageup', 'pagedown'], (ch, key) => {
    // Handle scrolling through conversation history
    if (key.name === 'pageup' || key.name === 'pagedown') {
        conversationHistory.scroll(key.name === 'pageup' ? -5 : 5);
        screen.render();
    }
});

const helpSection = grid.set(1, 3, 11, 9, contrib.markdown, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});

// Load help documentation into the helpSection widget
// helpSection.setMarkdown(`
// # AI Agent Help

// This is the help documentation for the AI Agent application.
// `);


const processTask = async (task: string): Promise<TaskResult> => {
    // Simulated asynchronous task processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update progress bar during task execution
    progressBar.setPercent(50);
    screen.render();

    // Simulated task result
    const result: TaskResult = {
        taskId: 'task-123',
        chatMessage: 'User: ' + task,
        script: 'console.log("Hello, World!");',
        output: 'Hello, World!',
    };

    // Update progress bar to indicate completion
    progressBar.setPercent(100);
    screen.render();

    return result;
};

interface TaskResult {
    taskId: string;
    chatMessage: string;
    script: string;
    output: string;
}

screen.render();