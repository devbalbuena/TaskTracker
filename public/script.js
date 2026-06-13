class TodoApp {
  constructor() {
    this.todos               = [];
    this.currentFilter       = 'all';
    this.currentEditId       = null;
    this.currentEditSubtasks = [];
    this.currentDate         = new Date();
    this.draggedItemId       = null;
    this.searchQuery         = '';
    this.sortOrder           = 'custom';
    this.currentUser         = null;

    this.initTheme();
    this.initializeElements();
    this.bindEvents();
    this.init();
  }

  // ─── Theme ───────────────────────────────────────────────────────────────────
  initTheme() {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-theme');
    }
    this.syncThemeIcon();
  }

  syncThemeIcon() {
    if (!this.themeToggleBtn) return;
    const icon = this.themeToggleBtn.querySelector('i');
    const dark = document.body.classList.contains('dark-theme');
    icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
  }

  toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-theme'));
    this.syncThemeIcon();
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  async init() {
    await this.checkAuth();
    this.updateDateTime();
    await this.loadTodos();
    this.initNotifications();
  }

  async checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        window.location.replace('/');
        return;
      }
      const { user } = await res.json();
      this.currentUser = user;
      document.getElementById('usernameDisplay').textContent = user.username;
    } catch (_) {
      window.location.replace('/');
    }
  }

  async loadTodos() {
    this.showLoadingState(true);
    try {
      const res = await fetch('/api/todos');
      if (res.status === 401) { window.location.replace('/'); return; }
      const { todos } = await res.json();
      this.todos = todos || [];
    } catch (err) {
      this.showNotification('Failed to load tasks. Check your connection.', 'error');
      this.todos = [];
    } finally {
      this.showLoadingState(false);
      this.updateDisplay();
      this.renderCalendar();
    }
  }

  showLoadingState(loading) {
    const ls = document.getElementById('loadingState');
    if (ls) ls.style.display = loading ? 'block' : 'none';
  }

  // ─── Notifications ────────────────────────────────────────────────────────────
  initNotifications() {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setInterval(() => this.checkOverdueNotifications(), 30000);
  }

  checkOverdueNotifications() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    this.todos.forEach(todo => {
      if (!todo.completed && todo.dateTime && !todo.notified) {
        if (now >= new Date(todo.dateTime)) {
          new Notification('⏰ Task Overdue!', {
            body: todo.text,
            icon: '/favicon.ico'
          });
          // Update notified flag in DB
          fetch(`/api/todos/${todo.id}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ notified: true })
          }).then(() => { todo.notified = true; });
        }
      }
    });
  }

  // ─── Elements ─────────────────────────────────────────────────────────────────
  initializeElements() {
    this.themeToggleBtn    = document.getElementById('themeToggle');
    this.logoutBtn         = document.getElementById('logoutBtn');
    this.todoInput         = document.getElementById('todoInput');
    this.todoCategory      = document.getElementById('todoCategory');
    this.todoDateTime      = document.getElementById('todoDateTime');
    this.addBtn            = document.getElementById('addBtn');
    this.searchInput       = document.getElementById('searchInput');
    this.sortSelect        = document.getElementById('sortSelect');
    this.filterBtns        = document.querySelectorAll('.filter-btn');
    this.todoList          = document.getElementById('todoList');
    this.emptyState        = document.getElementById('emptyState');
    this.currentDateEl     = document.getElementById('currentDate');
    this.calendarView      = document.getElementById('calendarView');
    this.calendar          = document.getElementById('calendar');
    this.currentMonthEl    = document.getElementById('currentMonth');
    this.prevMonthBtn      = document.getElementById('prevMonth');
    this.nextMonthBtn      = document.getElementById('nextMonth');
    this.editModal         = document.getElementById('editModal');
    this.editInput         = document.getElementById('editInput');
    this.editCategory      = document.getElementById('editCategory');
    this.editDateTime      = document.getElementById('editDateTime');
    this.saveEditBtn       = document.getElementById('saveEdit');
    this.cancelEditBtn     = document.getElementById('cancelEdit');
    this.closeEditModalBtn = document.getElementById('closeEditModal');
    this.subtaskInput      = document.getElementById('subtaskInput');
    this.addSubtaskBtn     = document.getElementById('addSubtaskBtn');
    this.editSubtaskList   = document.getElementById('editSubtaskList');
    this.emailModal        = document.getElementById('emailModal');
    this.emailInput        = document.getElementById('emailInput');
    this.emailMessage      = document.getElementById('emailMessage');
    this.sendEmailBtn      = document.getElementById('sendEmail');
    this.cancelEmailBtn    = document.getElementById('cancelEmail');
    this.closeModalBtn     = document.getElementById('closeModal');
    this.emailBtn          = document.getElementById('emailBtn');
    this.clearCompletedBtn = document.getElementById('clearCompleted');
    this.totalTasksEl      = document.getElementById('totalTasks');
    this.activeTasksEl     = document.getElementById('activeTasks');
    this.completedTasksEl  = document.getElementById('completedTasks');
  }

  // ─── Events ───────────────────────────────────────────────────────────────────
  bindEvents() {
    this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());
    this.logoutBtn?.addEventListener('click',      () => this.logout());
    this.addBtn.addEventListener('click',          () => this.addTodo());
    this.todoInput.addEventListener('keypress', e => { if (e.key === 'Enter') this.addTodo(); });

    this.searchInput.addEventListener('input', e => {
      this.searchQuery = e.target.value.toLowerCase();
      this.updateDisplay();
    });
    this.sortSelect.addEventListener('change', e => {
      this.sortOrder = e.target.value;
      this.updateDisplay();
    });

    this.filterBtns.forEach(btn =>
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter))
    );

    this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

    this.saveEditBtn.addEventListener('click',       () => this.saveEdit());
    this.cancelEditBtn.addEventListener('click',     () => this.closeEditModal());
    this.closeEditModalBtn.addEventListener('click', () => this.closeEditModal());
    this.addSubtaskBtn.addEventListener('click',     () => this.addSubtaskToModal());
    this.subtaskInput.addEventListener('keypress', e => { if (e.key === 'Enter') this.addSubtaskToModal(); });

    this.emailBtn.addEventListener('click',      () => this.openEmailModal());
    this.sendEmailBtn.addEventListener('click',  () => this.sendEmail());
    this.cancelEmailBtn.addEventListener('click',() => this.closeEmailModal());
    this.closeModalBtn.addEventListener('click', () => this.closeEmailModal());

    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

    this.editModal.addEventListener('click', e => { if (e.target === this.editModal) this.closeEditModal(); });
    this.emailModal.addEventListener('click',e => { if (e.target === this.emailModal) this.closeEmailModal(); });
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.replace('/');
    }
  }

  // ─── Add Todo ─────────────────────────────────────────────────────────────────
  async addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    this.addBtn.disabled  = true;
    this.addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
      const res  = await fetch('/api/todos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          text,
          category: this.todoCategory.value,
          dateTime: this.todoDateTime.value || null
        })
      });
      if (!res.ok) throw new Error();
      const { todo } = await res.json();
      this.todos.push(todo);
      this.todoInput.value    = '';
      this.todoDateTime.value = '';
      this.updateDisplay();
      this.renderCalendar();
      this.showNotification('Task added!', 'success');
    } catch (_) {
      this.showNotification('Failed to add task.', 'error');
    } finally {
      this.addBtn.disabled  = false;
      this.addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    }
  }

  // ─── Delete Todo ──────────────────────────────────────────────────────────────
  async deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      this.todos = this.todos.filter(t => t.id !== id);
      this.updateDisplay();
      this.renderCalendar();
      this.showNotification('Task deleted.', 'info');
    } catch (_) {
      this.showNotification('Failed to delete task.', 'error');
    }
  }

  // ─── Toggle Todo ──────────────────────────────────────────────────────────────
  async toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;
    // Optimistic update
    todo.completed = newCompleted;
    this.updateDisplay();
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ completed: newCompleted })
      });
      if (!res.ok) throw new Error();
      this.showNotification(newCompleted ? 'Task completed! ✓' : 'Task marked active.', newCompleted ? 'success' : 'info');
      this.renderCalendar();
    } catch (_) {
      // Rollback
      todo.completed = !newCompleted;
      this.updateDisplay();
      this.showNotification('Failed to update task.', 'error');
    }
  }

  // ─── Edit Todo ────────────────────────────────────────────────────────────────
  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    this.currentEditId       = id;
    this.editInput.value     = todo.text;
    this.editCategory.value  = todo.category || 'General';
    this.editDateTime.value  = todo.dateTime  || '';
    this.currentEditSubtasks = (todo.subtasks || []).map(s => ({ ...s }));
    this.renderSubtasksInModal();
    this.editModal.classList.add('show');
    this.editInput.focus();
  }

  renderSubtasksInModal() {
    this.editSubtaskList.innerHTML = '';
    this.currentEditSubtasks.forEach((st, idx) => {
      const li = document.createElement('li');
      li.className = `subtask-item ${st.completed ? 'completed' : ''}`;

      const cb = document.createElement('div');
      cb.className = `todo-checkbox ${st.completed ? 'checked' : ''}`;
      cb.onclick   = () => {
        this.currentEditSubtasks[idx].completed = !this.currentEditSubtasks[idx].completed;
        this.renderSubtasksInModal();
      };

      const span = document.createElement('span');
      span.className   = 'subtask-text';
      span.textContent = st.text;

      const del = document.createElement('button');
      del.type      = 'button';
      del.className = 'close-btn';
      del.style.cssText = 'width:24px;height:24px;font-size:12px;';
      del.innerHTML = '<i class="fas fa-times"></i>';
      del.onclick   = () => {
        this.currentEditSubtasks.splice(idx, 1);
        this.renderSubtasksInModal();
      };

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(del);
      this.editSubtaskList.appendChild(li);
    });
  }

  addSubtaskToModal() {
    const text = this.subtaskInput.value.trim();
    if (!text) return;
    this.currentEditSubtasks.push({ text, completed: false });
    this.subtaskInput.value = '';
    this.renderSubtasksInModal();
  }

  closeEditModal() {
    this.editModal.classList.remove('show');
    this.currentEditId       = null;
    this.currentEditSubtasks = [];
    this.subtaskInput.value  = '';
  }

  // ─── Save Edit ────────────────────────────────────────────────────────────────
  async saveEdit() {
    const text = this.editInput.value.trim();
    if (!text) return;

    this.saveEditBtn.disabled  = true;
    this.saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
      const res = await fetch(`/api/todos/${this.currentEditId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          text,
          category: this.editCategory.value,
          dateTime: this.editDateTime.value || null,
          subtasks: this.currentEditSubtasks
        })
      });
      if (!res.ok) throw new Error();
      const { todo } = await res.json();
      const idx = this.todos.findIndex(t => t.id === this.currentEditId);
      if (idx !== -1) this.todos[idx] = todo;
      this.closeEditModal();
      this.updateDisplay();
      this.renderCalendar();
      this.showNotification('Task updated!', 'success');
    } catch (_) {
      this.showNotification('Failed to save changes.', 'error');
    } finally {
      this.saveEditBtn.disabled  = false;
      this.saveEditBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
  }

  // ─── Filters & Sorting ────────────────────────────────────────────────────────
  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach(btn =>
      btn.classList.toggle('active', btn.dataset.filter === filter)
    );
    if (filter === 'calendar') {
      this.todoList.parentElement.style.display = 'none';
      this.calendarView.classList.remove('hidden');
      this.renderCalendar();
    } else {
      this.todoList.parentElement.style.display = 'block';
      this.calendarView.classList.add('hidden');
    }
    this.updateDisplay();
  }

  getFilteredAndSortedTodos() {
    let result = [...this.todos];
    if (this.currentFilter === 'active')    result = result.filter(t => !t.completed);
    if (this.currentFilter === 'completed') result = result.filter(t =>  t.completed);
    if (this.searchQuery) {
      result = result.filter(t =>
        t.text.toLowerCase().includes(this.searchQuery) ||
        (t.category || '').toLowerCase().includes(this.searchQuery)
      );
    }
    if (this.sortOrder === 'dateAdded') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (this.sortOrder === 'dueDate')   result.sort((a, b) => {
      if (!a.dateTime) return 1; if (!b.dateTime) return -1;
      return new Date(a.dateTime) - new Date(b.dateTime);
    });
    if (this.sortOrder === 'az') result.sort((a, b) => a.text.localeCompare(b.text));
    return result;
  }

  // ─── Display ─────────────────────────────────────────────────────────────────
  updateDisplay() {
    const displayed = this.getFilteredAndSortedTodos();
    const loading   = document.getElementById('loadingState');
    if (loading) loading.style.display = 'none';

    if (displayed.length === 0 && this.currentFilter !== 'calendar') {
      this.todoList.style.display   = 'none';
      this.emptyState.style.display = 'block';
    } else {
      this.todoList.style.display   = 'block';
      this.emptyState.style.display = 'none';
    }
    this.todoList.innerHTML = '';
    displayed.forEach(todo => this.todoList.appendChild(this.createTodoElement(todo)));
    this.updateStats();
  }

  createTodoElement(todo) {
    const li         = document.createElement('li');
    li.className     = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.draggable     = this.sortOrder === 'custom' && !this.searchQuery;

    if (li.draggable) {
      li.addEventListener('dragstart', e => { this.draggedItemId = todo.id; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      li.addEventListener('dragover',  e => { e.preventDefault(); li.classList.add('drag-over'); });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('dragend',   () => { li.classList.remove('dragging'); document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('drag-over')); });
      li.addEventListener('drop',      e => { e.stopPropagation(); this.handleDrop(todo.id); li.classList.remove('drag-over'); });
    }

    const isOverdue = todo.dateTime && new Date(todo.dateTime) < new Date() && !todo.completed;
    const subtaskCount     = (todo.subtasks || []).length;
    const subtaskCompleted = (todo.subtasks || []).filter(s => s.completed).length;
    const subtasksHtml = subtaskCount > 0
      ? `<span class="subtask-progress"><i class="fas fa-list-ul"></i> ${subtaskCompleted}/${subtaskCount}</span>` : '';

    li.innerHTML = `
      <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="app.toggleTodo(${todo.id})"></div>
      <div class="todo-content">
        <div class="todo-header">
          <span class="category-badge ${todo.category || 'General'}">${this.escapeHtml(todo.category || 'General')}</span>
          <div class="todo-text">${this.escapeHtml(todo.text)}</div>
        </div>
        <div class="todo-details">
          ${todo.dateTime ? `
            <div class="todo-datetime ${isOverdue ? 'overdue' : ''}">
              <i class="fas fa-clock"></i> ${this.formatDateTime(todo.dateTime)}
              ${isOverdue ? '<i class="fas fa-exclamation-triangle"></i>' : ''}
            </div>` : ''}
          ${subtasksHtml}
        </div>
      </div>
      <div class="todo-actions">
        <button class="action-btn edit-btn"   onclick="app.editTodo(${todo.id})"   title="Edit">  <i class="fas fa-edit"></i>  </button>
        <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`;
    return li;
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  async handleDrop(targetId) {
    if (this.draggedItemId === targetId) return;
    const from = this.todos.findIndex(t => t.id === this.draggedItemId);
    const to   = this.todos.findIndex(t => t.id === targetId);
    const [item] = this.todos.splice(from, 1);
    this.todos.splice(to, 0, item);
    this.updateDisplay();
    try {
      await fetch('/api/todos/reorder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderedIds: this.todos.map(t => t.id) })
      });
    } catch (_) {
      this.showNotification('Failed to save order.', 'error');
    }
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────
  updateStats() {
    const total     = this.todos.length;
    const active    = this.todos.filter(t => !t.completed).length;
    const completed = this.todos.filter(t =>  t.completed).length;
    this.totalTasksEl.textContent    = `${total} ${total === 1 ? 'task' : 'tasks'}`;
    this.activeTasksEl.textContent   = `${active} active`;
    this.completedTasksEl.textContent= `${completed} completed`;
  }

  // ─── Clear Completed ─────────────────────────────────────────────────────────
  async clearCompleted() {
    const completed = this.todos.filter(t => t.completed);
    if (completed.length === 0) { this.showNotification('No completed tasks to clear!', 'info'); return; }
    if (!confirm(`Delete ${completed.length} completed task(s)?`)) return;

    let failed = 0;
    for (const todo of completed) {
      try {
        await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
        this.todos = this.todos.filter(t => t.id !== todo.id);
      } catch (_) { failed++; }
    }
    this.updateDisplay();
    this.renderCalendar();
    this.showNotification(
      failed ? `Done, but ${failed} task(s) failed to delete.` : `${completed.length - failed} task(s) cleared!`,
      failed ? 'error' : 'success'
    );
  }

  // ─── Calendar ────────────────────────────────────────────────────────────────
  renderCalendar() {
    const year  = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.currentMonthEl.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.calendar.innerHTML = '';

    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
      const h = document.createElement('div');
      h.className   = 'calendar-day-header';
      h.textContent = d;
      this.calendar.appendChild(h);
    });

    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'calendar-day empty';
      this.calendar.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const el  = document.createElement('div');
      el.className = 'calendar-day';
      const num = document.createElement('div');
      num.className   = 'calendar-day-number';
      num.textContent = day;
      el.appendChild(num);

      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      this.todos
        .filter(t => t.dateTime && t.dateTime.slice(0, 10) === dateStr)
        .forEach(t => {
          const te = document.createElement('div');
          te.className   = `calendar-task ${t.completed ? 'completed' : ''}`;
          te.textContent = t.text;
          te.title       = `${t.text}${t.dateTime ? ' — ' + this.formatDateTime(t.dateTime) : ''}`;
          el.appendChild(te);
        });
      this.calendar.appendChild(el);
    }
  }

  changeMonth(dir) {
    this.currentDate.setMonth(this.currentDate.getMonth() + dir);
    this.renderCalendar();
  }

  // ─── Email ───────────────────────────────────────────────────────────────────
  openEmailModal()  { this.emailModal.classList.add('show');    this.emailInput.focus(); }
  closeEmailModal() { this.emailModal.classList.remove('show'); this.emailInput.value = ''; this.emailMessage.value = ''; }

  sendEmail() {
    const email = this.emailInput.value.trim();
    if (!email)                    { this.showNotification('Please enter an email address!', 'error'); return; }
    if (!this.isValidEmail(email)) { this.showNotification('Please enter a valid email address!', 'error'); return; }

    let body  = this.emailMessage.value.trim();
    body     += body ? '\n\n' : '';
    body     += '📋 MY TODO LIST\n=================\n\n';

    const active    = this.todos.filter(t => !t.completed);
    const completed = this.todos.filter(t =>  t.completed);
    if (active.length)    body += '🔄 ACTIVE:\n' + active.map((t,i)    => `${i+1}. [${t.category}] ${t.text}${t.dateTime ? ' (Due: '+this.formatDateTime(t.dateTime)+')' : ''}${t.subtasks?.length ? ' ['+t.subtasks.filter(s=>s.completed).length+'/'+t.subtasks.length+' subtasks]' : ''}`).join('\n') + '\n\n';
    if (completed.length) body += '✅ DONE:\n'   + completed.map((t,i) => `${i+1}. ${t.text}`).join('\n') + '\n';
    body += `\n---\nGenerated on ${new Date().toLocaleString()}`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent('My Todo List')}&body=${encodeURIComponent(body)}`;
    this.closeEmailModal();
    this.showNotification('Email client opened!', 'success');
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  updateDateTime() {
    this.currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  formatDateTime(dtStr) {
    return new Date(dtStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  }

  isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  showNotification(message, type = 'info') {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:10px;color:white;font-weight:600;z-index:10000;opacity:0;transform:translateX(100%);transition:all .3s ease;max-width:300px;box-shadow:0 4px 15px rgba(0,0,0,.2);`;
    el.style.background = { success: '#28a745', error: '#dc3545', info: '#17a2b8' }[type] || '#17a2b8';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; }, 50);
    setTimeout(() => {
      el.style.opacity = '0'; el.style.transform = 'translateX(100%)';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => { app = new TodoApp(); });
