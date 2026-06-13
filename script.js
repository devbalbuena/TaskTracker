class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    this.currentFilter = "all";
    this.currentEditId = null;
    this.currentDate = new Date();
    this.draggedItemId = null;
    this.searchQuery = "";
    this.sortOrder = "custom";

    this.initTheme();
    this.initializeElements();
    this.bindEvents();
    this.initNotifications();
    
    this.updateDisplay();
    this.updateDateTime();
    this.renderCalendar();
  }

  initTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      document.body.classList.add("dark-theme");
    }
  }

  toggleTheme() {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("darkMode", isDark);
    
    const icon = this.themeToggleBtn.querySelector("i");
    if (isDark) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  }

  initNotifications() {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    setInterval(() => this.checkOverdueNotifications(), 30000);
  }

  checkOverdueNotifications() {
    if ("Notification" in window && Notification.permission === "granted") {
      const now = new Date();
      this.todos.forEach(todo => {
        if (!todo.completed && todo.dateTime && !todo.notified) {
          const due = new Date(todo.dateTime);
          if (now >= due) {
            new Notification("Task Overdue!", {
              body: todo.text,
              icon: "favicon.ico"
            });
            todo.notified = true;
            this.saveTodos();
          }
        }
      });
    }
  }

  initializeElements() {
    this.themeToggleBtn = document.getElementById("themeToggle");
    
    // Theme Icon Init
    const icon = this.themeToggleBtn.querySelector("i");
    if (document.body.classList.contains("dark-theme")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }

    this.todoInput = document.getElementById("todoInput");
    this.todoCategory = document.getElementById("todoCategory");
    this.todoDateTime = document.getElementById("todoDateTime");
    this.addBtn = document.getElementById("addBtn");

    this.searchInput = document.getElementById("searchInput");
    this.sortSelect = document.getElementById("sortSelect");

    this.filterBtns = document.querySelectorAll(".filter-btn");

    this.todoList = document.getElementById("todoList");
    this.emptyState = document.getElementById("emptyState");
    this.currentDateEl = document.getElementById("currentDate");

    this.calendarView = document.getElementById("calendarView");
    this.calendar = document.getElementById("calendar");
    this.currentMonthEl = document.getElementById("currentMonth");
    this.prevMonthBtn = document.getElementById("prevMonth");
    this.nextMonthBtn = document.getElementById("nextMonth");

    this.editModal = document.getElementById("editModal");
    this.editInput = document.getElementById("editInput");
    this.editCategory = document.getElementById("editCategory");
    this.editDateTime = document.getElementById("editDateTime");
    this.saveEditBtn = document.getElementById("saveEdit");
    this.cancelEditBtn = document.getElementById("cancelEdit");
    this.closeEditModalBtn = document.getElementById("closeEditModal");

    // Subtasks
    this.subtaskInput = document.getElementById("subtaskInput");
    this.addSubtaskBtn = document.getElementById("addSubtaskBtn");
    this.editSubtaskList = document.getElementById("editSubtaskList");

    this.emailModal = document.getElementById("emailModal");
    this.emailInput = document.getElementById("emailInput");
    this.emailMessage = document.getElementById("emailMessage");
    this.sendEmailBtn = document.getElementById("sendEmail");
    this.cancelEmailBtn = document.getElementById("cancelEmail");
    this.closeModalBtn = document.getElementById("closeModal");
    this.emailBtn = document.getElementById("emailBtn");

    this.clearCompletedBtn = document.getElementById("clearCompleted");

    this.totalTasksEl = document.getElementById("totalTasks");
    this.activeTasksEl = document.getElementById("activeTasks");
    this.completedTasksEl = document.getElementById("completedTasks");
  }

  bindEvents() {
    this.themeToggleBtn.addEventListener("click", () => this.toggleTheme());

    this.addBtn.addEventListener("click", () => this.addTodo());
    this.todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTodo();
    });

    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.updateDisplay();
    });

    this.sortSelect.addEventListener("change", (e) => {
      this.sortOrder = e.target.value;
      this.updateDisplay();
    });

    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.setFilter(e.target.dataset.filter)
      );
    });

    this.prevMonthBtn.addEventListener("click", () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener("click", () => this.changeMonth(1));

    this.saveEditBtn.addEventListener("click", () => this.saveEdit());
    this.cancelEditBtn.addEventListener("click", () => this.closeEditModal());
    this.closeEditModalBtn.addEventListener("click", () => this.closeEditModal());

    this.addSubtaskBtn.addEventListener("click", () => this.addSubtaskToModal());
    this.subtaskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addSubtaskToModal();
    });

    this.emailBtn.addEventListener("click", () => this.openEmailModal());
    this.sendEmailBtn.addEventListener("click", () => this.sendEmail());
    this.cancelEmailBtn.addEventListener("click", () => this.closeEmailModal());
    this.closeModalBtn.addEventListener("click", () => this.closeEmailModal());

    this.clearCompletedBtn.addEventListener("click", () => this.clearCompleted());

    this.editModal.addEventListener("click", (e) => {
      if (e.target === this.editModal) this.closeEditModal();
    });
    this.emailModal.addEventListener("click", (e) => {
      if (e.target === this.emailModal) this.closeEmailModal();
    });
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    const todo = {
      id: Date.now(),
      text: text,
      category: this.todoCategory.value,
      completed: false,
      dateTime: this.todoDateTime.value || null,
      createdAt: new Date().toISOString(),
      notified: false,
      subtasks: []
    };

    this.todos.push(todo);
    this.saveTodos();
    this.updateDisplay();
    this.renderCalendar();

    this.todoInput.value = "";
    this.todoDateTime.value = "";

    this.showNotification("Task added successfully!", "success");
  }

  deleteTodo(id) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.todos = this.todos.filter((todo) => todo.id !== id);
      this.saveTodos();
      this.updateDisplay();
      this.renderCalendar();
      this.showNotification("Task deleted!", "info");
    }
  }

  toggleTodo(id) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.updateDisplay();
      this.renderCalendar();

      const message = todo.completed ? "Task completed!" : "Task marked as active!";
      this.showNotification(message, todo.completed ? "success" : "info");
    }
  }

  editTodo(id) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      this.currentEditId = id;
      this.editInput.value = todo.text;
      this.editCategory.value = todo.category || "General";
      this.editDateTime.value = todo.dateTime || "";
      
      this.renderSubtasksInModal(todo.subtasks || []);
      
      this.editModal.classList.add("show");
      this.editInput.focus();
    }
  }

  renderSubtasksInModal(subtasks) {
    this.editSubtaskList.innerHTML = "";
    subtasks.forEach((st, idx) => {
      const li = document.createElement("li");
      li.className = `subtask-item ${st.completed ? "completed" : ""}`;
      
      const checkbox = document.createElement("div");
      checkbox.className = `todo-checkbox ${st.completed ? "checked" : ""}`;
      checkbox.onclick = () => {
        st.completed = !st.completed;
        this.renderSubtasksInModal(subtasks);
      };

      const text = document.createElement("span");
      text.className = "subtask-text";
      text.textContent = st.text;

      const delBtn = document.createElement("button");
      delBtn.className = "close-btn";
      delBtn.innerHTML = '<i class="fas fa-times"></i>';
      delBtn.style.width = "24px";
      delBtn.style.height = "24px";
      delBtn.style.fontSize = "14px";
      delBtn.onclick = () => {
        subtasks.splice(idx, 1);
        this.renderSubtasksInModal(subtasks);
      };

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(delBtn);
      this.editSubtaskList.appendChild(li);
    });

    this.currentEditSubtasks = [...subtasks];
  }

  addSubtaskToModal() {
    const text = this.subtaskInput.value.trim();
    if (!text) return;

    this.currentEditSubtasks.push({
      id: Date.now() + Math.random(),
      text: text,
      completed: false
    });

    this.subtaskInput.value = "";
    this.renderSubtasksInModal(this.currentEditSubtasks);
  }

  saveEdit() {
    const text = this.editInput.value.trim();
    if (!text) return;

    const todo = this.todos.find((todo) => todo.id === this.currentEditId);
    if (todo) {
      todo.text = text;
      todo.category = this.editCategory.value;
      todo.dateTime = this.editDateTime.value || null;
      todo.subtasks = this.currentEditSubtasks;
      if(todo.dateTime && new Date(todo.dateTime) > new Date()) {
        todo.notified = false; // Reset notification flag if date changed to future
      }

      this.saveTodos();
      this.updateDisplay();
      this.renderCalendar();
      this.closeEditModal();
      this.showNotification("Task updated!", "success");
    }
  }

  closeEditModal() {
    this.editModal.classList.remove("show");
    this.currentEditId = null;
    this.currentEditSubtasks = [];
    this.subtaskInput.value = "";
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    if (filter === "calendar") {
      this.todoList.parentElement.style.display = "none";
      this.calendarView.classList.remove("hidden");
      this.renderCalendar();
    } else {
      this.todoList.parentElement.style.display = "block";
      this.calendarView.classList.add("hidden");
    }

    this.updateDisplay();
  }

  getFilteredAndSortedTodos() {
    let result = [...this.todos];

    // Filter by status
    if (this.currentFilter === "active") {
      result = result.filter(t => !t.completed);
    } else if (this.currentFilter === "completed") {
      result = result.filter(t => t.completed);
    }

    // Filter by search query
    if (this.searchQuery) {
      result = result.filter(t => 
        t.text.toLowerCase().includes(this.searchQuery) ||
        (t.category && t.category.toLowerCase().includes(this.searchQuery))
      );
    }

    // Sort
    if (this.sortOrder === "dateAdded") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.sortOrder === "dueDate") {
      result.sort((a, b) => {
        if (!a.dateTime) return 1;
        if (!b.dateTime) return -1;
        return new Date(a.dateTime) - new Date(b.dateTime);
      });
    } else if (this.sortOrder === "az") {
      result.sort((a, b) => a.text.localeCompare(b.text));
    }

    return result;
  }

  updateDisplay() {
    const displayedTodos = this.getFilteredAndSortedTodos();

    if (displayedTodos.length === 0 && this.currentFilter !== "calendar") {
      this.todoList.style.display = "none";
      this.emptyState.style.display = "block";
    } else {
      this.todoList.style.display = "block";
      this.emptyState.style.display = "none";
    }

    this.todoList.innerHTML = "";
    displayedTodos.forEach((todo) => {
      const li = this.createTodoElement(todo);
      this.todoList.appendChild(li);
    });

    this.updateStats();
  }

  createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    
    // Drag and Drop
    li.draggable = this.sortOrder === "custom" && !this.searchQuery; 
    if(li.draggable) {
      li.addEventListener('dragstart', (e) => this.handleDragStart(e, todo.id));
      li.addEventListener('dragover', (e) => this.handleDragOver(e));
      li.addEventListener('drop', (e) => this.handleDrop(e, todo.id));
      li.addEventListener('dragenter', (e) => e.preventDefault());
      li.addEventListener('dragleave', (e) => {
         e.currentTarget.classList.remove('drag-over');
      });
      li.addEventListener('dragend', (e) => {
         e.currentTarget.classList.remove('dragging');
         document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('drag-over'));
      });
    }

    const isOverdue = todo.dateTime && new Date(todo.dateTime) < new Date() && !todo.completed;
    
    let subtasksHtml = "";
    if (todo.subtasks && todo.subtasks.length > 0) {
      const completedCount = todo.subtasks.filter(st => st.completed).length;
      subtasksHtml = `<span class="subtask-progress"><i class="fas fa-list-ul"></i> ${completedCount}/${todo.subtasks.length}</span>`;
    }

    li.innerHTML = `
      <div class="todo-checkbox ${todo.completed ? "checked" : ""}" onclick="app.toggleTodo(${todo.id})"></div>
      <div class="todo-content">
          <div class="todo-header">
              <span class="category-badge ${todo.category || 'General'}">${this.escapeHtml(todo.category || 'General')}</span>
              <div class="todo-text">${this.escapeHtml(todo.text)}</div>
          </div>
          <div class="todo-details">
            ${
              todo.dateTime
                ? `
                <div class="todo-datetime ${isOverdue ? "overdue" : ""}">
                    <i class="fas fa-clock"></i>
                    ${this.formatDateTime(todo.dateTime)}
                    ${isOverdue ? '<i class="fas fa-exclamation-triangle"></i>' : ""}
                </div>
            `
                : ""
            }
            ${subtasksHtml}
          </div>
      </div>
      <div class="todo-actions">
          <button class="action-btn edit-btn" onclick="app.editTodo(${todo.id})" title="Edit">
              <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete">
              <i class="fas fa-trash"></i>
          </button>
      </div>
    `;

    return li;
  }

  handleDragStart(e, id) {
    this.draggedItemId = id;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = 'move';
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.currentTarget;
    item.classList.add('drag-over');
  }

  handleDrop(e, targetId) {
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    if (this.draggedItemId === targetId) return;

    const draggedIndex = this.todos.findIndex(t => t.id === this.draggedItemId);
    const targetIndex = this.todos.findIndex(t => t.id === targetId);
    
    const [draggedItem] = this.todos.splice(draggedIndex, 1);
    this.todos.splice(targetIndex, 0, draggedItem);
    
    this.saveTodos();
    this.updateDisplay();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.currentMonthEl.textContent = new Date(year, month).toLocaleDateString(
      "en-US", { month: "long", year: "numeric" }
    );

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendar.innerHTML = "";

    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayHeaders.forEach((day) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "calendar-day-header";
      dayHeader.textContent = day;
      this.calendar.appendChild(dayHeader);
    });

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day empty";
      this.calendar.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";

      const dayNumber = document.createElement("div");
      dayNumber.className = "calendar-day-number";
      dayNumber.textContent = day;
      dayEl.appendChild(dayNumber);

      const currentDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTodos = this.todos.filter((todo) => {
        if (!todo.dateTime) return false;
        const todoDate = new Date(todo.dateTime).toISOString().split("T")[0];
        return todoDate === currentDateStr;
      });

      dayTodos.forEach((todo) => {
        const taskEl = document.createElement("div");
        taskEl.className = `calendar-task ${todo.completed ? "completed" : ""}`;
        taskEl.textContent = todo.text;
        taskEl.title = `${todo.text}${todo.dateTime ? " - " + this.formatDateTime(todo.dateTime) : ""}`;
        dayEl.appendChild(taskEl);
      });

      this.calendar.appendChild(dayEl);
    }
  }

  changeMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.renderCalendar();
  }

  updateStats() {
    const total = this.todos.length;
    const active = this.todos.filter((todo) => !todo.completed).length;
    const completed = this.todos.filter((todo) => todo.completed).length;

    this.totalTasksEl.textContent = `${total} ${total === 1 ? "task" : "tasks"}`;
    this.activeTasksEl.textContent = `${active} active`;
    this.completedTasksEl.textContent = `${completed} completed`;
  }

  clearCompleted() {
    const completedCount = this.todos.filter((todo) => todo.completed).length;
    if (completedCount === 0) {
      this.showNotification("No completed tasks to clear!", "info");
      return;
    }

    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
      this.todos = this.todos.filter((todo) => !todo.completed);
      this.saveTodos();
      this.updateDisplay();
      this.renderCalendar();
      this.showNotification(`${completedCount} completed task(s) deleted!`, "success");
    }
  }

  openEmailModal() {
    this.emailModal.classList.add("show");
    this.emailInput.focus();
  }

  closeEmailModal() {
    this.emailModal.classList.remove("show");
    this.emailInput.value = "";
    this.emailMessage.value = "";
  }

  sendEmail() {
    const email = this.emailInput.value.trim();
    if (!email) {
      this.showNotification("Please enter an email address!", "error");
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showNotification("Please enter a valid email address!", "error");
      return;
    }

    const emailBody = this.generateEmailBody();
    const subject = encodeURIComponent("My Todo List");
    const body = encodeURIComponent(emailBody);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    this.closeEmailModal();
    this.showNotification("Email client opened! Please send the email.", "success");
  }

  generateEmailBody() {
    const message = this.emailMessage.value.trim();
    let emailBody = message ? message + "\n\n" : "";

    emailBody += "📋 MY TODO LIST\n";
    emailBody += "=================\n\n";

    if (this.todos.length === 0) {
      emailBody += "No tasks yet!\n";
    } else {
      const activeTodos = this.todos.filter((todo) => !todo.completed);
      const completedTodos = this.todos.filter((todo) => todo.completed);

      if (activeTodos.length > 0) {
        emailBody += "🔄 ACTIVE TASKS:\n";
        activeTodos.forEach((todo, index) => {
          emailBody += `${index + 1}. [${todo.category || 'General'}] ${todo.text}`;
          if (todo.dateTime) {
            emailBody += ` (Due: ${this.formatDateTime(todo.dateTime)})`;
          }
          if (todo.subtasks && todo.subtasks.length > 0) {
              const comp = todo.subtasks.filter(s => s.completed).length;
              emailBody += ` [${comp}/${todo.subtasks.length} subtasks]`;
          }
          emailBody += "\n";
        });
        emailBody += "\n";
      }

      if (completedTodos.length > 0) {
        emailBody += "✅ COMPLETED TASKS:\n";
        completedTodos.forEach((todo, index) => {
          emailBody += `${index + 1}. ${todo.text}`;
          if (todo.dateTime) {
            emailBody += ` (Was due: ${this.formatDateTime(todo.dateTime)})`;
          }
          emailBody += "\n";
        });
      }
    }

    emailBody += "\n---\n";
    emailBody += `Generated on ${new Date().toLocaleString()}`;

    return emailBody;
  }

  updateDateTime() {
    const now = new Date();
    this.currentDateEl.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 300px;
    `;

    const colors = {
      success: "var(--success-color)",
      error: "var(--danger-color)",
      info: "var(--info-color)",
    };
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new TodoApp();
});
