// =========================
// GET HTML ELEMENTS
// =========================

const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const deadline = document.getElementById("deadline");
const priority = document.getElementById("priority");

const taskList = document.getElementById("taskList");
const searchTask = document.getElementById("searchTask");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const overdueTasks = document.getElementById("overdueTasks");

const allCount = document.getElementById("allCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const overdueCount = document.getElementById("overdueCount");

const filterButtons = document.querySelectorAll(".filter-button");

// =========================
// LOAD SAVED TASKS
// =========================

// Uses the same storage key as your previous project.
let tasks = JSON.parse(
    localStorage.getItem("taskTimeProTasks")
) || [];

let currentFilter = "all";
let editingTaskId = null;
let countdownInterval;

// Give existing tasks stable IDs and default priorities.
tasks = tasks.map(task => ({
    ...task,
    id: task.id || (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    ),
    priority: task.priority || "Medium",
    completed: Boolean(task.completed)
}));

// =========================
// SAVE TASKS
// =========================

function saveTasks() {
    localStorage.setItem(
        "taskTimeProTasks",
        JSON.stringify(tasks)
    );
}

// =========================
// COUNTDOWN FORMAT
// =========================

function getCountdown(task) {
    if (task.completed) {
        return {
            text: "✓ Task completed",
            className: "finished"
        };
    }

    const remaining =
        new Date(task.deadline).getTime() - Date.now();

    if (remaining <= 0) {
        return {
            text: "⚠ Deadline reached",
            className: "overdue"
        };
    }

    const days = Math.floor(
        remaining / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (remaining / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (remaining / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (remaining / 1000) % 60
    );

    return {
        text: `${days}d ${hours}h ${minutes}m ${seconds}s remaining`,
        className: ""
    };
}

// =========================
// CHECK OVERDUE TASKS
// =========================

function isOverdue(task) {
    return (
        !task.completed &&
        new Date(task.deadline).getTime() <= Date.now()
    );
}

// =========================
// UPDATE STATISTICS
// =========================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = tasks.filter(
        task => !task.completed
    ).length;

    const overdue = tasks.filter(
        task => isOverdue(task)
    ).length;

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
    overdueTasks.textContent = overdue;

    allCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    overdueCount.textContent = overdue;
}

// =========================
// RENDER TASKS
// =========================

function renderTasks() {
    clearInterval(countdownInterval);

    taskList.innerHTML = "";

    const searchText = searchTask.value
        .trim()
        .toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.name
            .toLowerCase()
            .includes(searchText);

        let matchesFilter = true;

        if (currentFilter === "pending") {
            matchesFilter = !task.completed;
        } else if (currentFilter === "completed") {
            matchesFilter = task.completed;
        } else if (currentFilter === "overdue") {
            matchesFilter = isOverdue(task);
        }

        return matchesSearch && matchesFilter;
    });

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {
        const taskCard = document.createElement("article");

        taskCard.className =
            `task-card priority-border-${task.priority.toLowerCase()}`;

        if (task.completed) {
            taskCard.classList.add("task-completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.name} as completed`
        );

        checkbox.addEventListener("change", () => {
            toggleComplete(task.id);
        });

        // Task information
        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const title = document.createElement("h3");
        title.textContent = task.name;

        if (task.completed) {
            title.classList.add("completed-title");
        }

        const priorityLabel = document.createElement("span");

        priorityLabel.className =
            `priority-label priority-${task.priority.toLowerCase()}`;

        priorityLabel.textContent =
            `${task.priority} Priority`;

        const deadlineText = document.createElement("p");
        deadlineText.className = "task-deadline";

        const deadlineDate = new Date(task.deadline);

        deadlineText.textContent =
            "📅 " + (
                Number.isNaN(deadlineDate.getTime())
                    ? task.deadline
                    : deadlineDate.toLocaleString()
            );

        const meta = document.createElement("div");
        meta.className = "task-meta";

        meta.appendChild(priorityLabel);
        meta.appendChild(deadlineText);

        taskInfo.appendChild(title);
        taskInfo.appendChild(meta);

        // Countdown
        const countdown = document.createElement("div");
        countdown.className = "task-countdown";

        const countdownData = getCountdown(task);

        countdown.textContent = countdownData.text;

        if (countdownData.className) {
            countdown.classList.add(
                countdownData.className
            );
        }

        // Buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className =
            "action-button edit-button";
        editButton.textContent = "✎ Edit";

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        const completeButton =
            document.createElement("button");

        completeButton.className =
            "action-button complete-button";

        completeButton.textContent = task.completed
            ? "✓ Completed"
            : "✓ Complete";

        completeButton.disabled = task.completed;

        completeButton.addEventListener("click", () => {
            toggleComplete(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className =
            "action-button delete-button";

        deleteButton.textContent = "✕ Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(completeButton);
        actions.appendChild(deleteButton);

        taskCard.appendChild(checkbox);
        taskCard.appendChild(taskInfo);
        taskCard.appendChild(countdown);
        taskCard.appendChild(actions);

        taskList.appendChild(taskCard);
    });

    updateStatistics();

    // Refresh countdowns every second.
    countdownInterval = setInterval(() => {
        const countdowns =
            taskList.querySelectorAll(".task-countdown");

        const visibleTasks = tasks.filter(task => {
            const matchesSearch = task.name
                .toLowerCase()
                .includes(searchTask.value.trim().toLowerCase());

            let matchesFilter = true;

            if (currentFilter === "pending") {
                matchesFilter = !task.completed;
            } else if (currentFilter === "completed") {
                matchesFilter = task.completed;
            } else if (currentFilter === "overdue") {
                matchesFilter = isOverdue(task);
            }

            return matchesSearch && matchesFilter;
        });

        visibleTasks.forEach((task, index) => {
            const countdown = countdowns[index];

            if (!countdown) {
                return;
            }

            const data = getCountdown(task);

            countdown.textContent = data.text;
            countdown.className = "task-countdown";

            if (data.className) {
                countdown.classList.add(data.className);
            }
        });

        updateStatistics();
    }, 1000);
}

// =========================
// ADD OR UPDATE TASK
// =========================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = taskName.value.trim();
    const date = deadline.value;
    const taskPriority = priority.value;

    if (!name || !date) {
        alert("Please enter a task name and deadline.");
        return;
    }

    const deadlineTime = new Date(date).getTime();

    if (
        Number.isNaN(deadlineTime) ||
        deadlineTime <= Date.now()
    ) {
        alert("Please choose a valid future deadline.");
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(
            item => item.id === editingTaskId
        );

        if (task) {
            task.name = name;
            task.deadline = date;
            task.priority = taskPriority;
        }

        editingTaskId = null;

        document.querySelector(".add-button").textContent =
            "+ Add Task";
    } else {
        tasks.push({
            id: Date.now().toString(36) +
                Math.random().toString(36).slice(2),
            name: name,
            deadline: date,
            priority: taskPriority,
            completed: false
        });
    }

    saveTasks();

    taskForm.reset();
    priority.value = "Medium";

    renderTasks();
});

// =========================
// EDIT TASK
// =========================

function editTask(id) {
    const task = tasks.find(
        item => item.id === id
    );

    if (!task) {
        return;
    }

    if (task.completed) {
        alert("Completed tasks cannot be edited.");
        return;
    }

    taskName.value = task.name;
    deadline.value = task.deadline;
    priority.value = task.priority || "Medium";

    editingTaskId = task.id;

    document.querySelector(".add-button").textContent =
        "Save Changes";

    document.querySelector(".task-form").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    taskName.focus();
}

// =========================
// COMPLETE TASK
// =========================

function toggleComplete(id) {
    const task = tasks.find(
        item => item.id === id
    );

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
}

// =========================
// DELETE TASK
// =========================

function deleteTask(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(
        task => task.id !== id
    );

    if (editingTaskId === id) {
        editingTaskId = null;
        taskForm.reset();

        document.querySelector(".add-button").textContent =
            "+ Add Task";
    }

    saveTasks();
    renderTasks();
}

// =========================
// FILTER TASKS
// =========================

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});

// =========================
// SEARCH TASKS
// =========================

searchTask.addEventListener("input", () => {
    renderTasks();
});

// =========================
// START THE APPLICATION
// =========================

saveTasks();
renderTasks();