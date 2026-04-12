document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const taskCountSpan = document.getElementById('taskCount');

    // Load tasks from LocalStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize
    renderTasks();

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    clearAllBtn.addEventListener('click', clearAllTasks);

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();

        taskInput.value = '';
        taskInput.focus();
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();

            // Surprise: Confetti if a task is completed!
            if (task.completed && typeof confetti === 'function') {
                triggerConfetti();
            }
        }
    }

    function deleteTask(id, liElement) {
        // Add fade-out animation before actual removal
        liElement.classList.add('fade-out');

        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }, 300); // Matches CSS animation duration
    }

    function clearAllTasks() {
        if(tasks.length === 0) return;

        if(confirm("Êtes-vous sûr de vouloir effacer toutes les tâches ?")) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateStats() {
        const activeTasks = tasks.filter(t => !t.completed).length;
        taskCountSpan.textContent = `${activeTasks} tâche(s) restante(s)`;
    }

    function renderTasks() {
        taskList.innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            li.innerHTML = `
                <div class="task-content">
                    <div class="checkbox"></div>
                    <span>${escapeHTML(task.text)}</span>
                </div>
                <button class="delete-btn" aria-label="Supprimer la tâche">✖</button>
            `;

            // Setup toggle listener
            const taskContent = li.querySelector('.task-content');
            taskContent.addEventListener('click', () => toggleTask(task.id));

            // Setup delete button listener
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent toggling when clicking delete
                deleteTask(task.id, li);
            });

            taskList.appendChild(li);
        });

        updateStats();
    }

    // Helper: Prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Surprise Function
    function triggerConfetti() {
        const duration = 2000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#6c5ce7', '#00b894', '#ff7675']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#6c5ce7', '#00b894', '#ff7675']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
});
