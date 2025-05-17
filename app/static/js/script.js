// app/static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    const addGoalModal = new bootstrap.Modal(document.getElementById('addGoalModal'));
    const progressModal = new bootstrap.Modal(document.getElementById('progressModal'));
    
    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();
    
    // Initialize profile dropdown
const profileDropdown = new bootstrap.Dropdown(document.querySelector('.cyber-dropdown .profile-btn'));
    // Month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Track current view
    let viewMonth = currentMonth;
    let viewYear = currentYear;
    
    // Mark today
    markToday();
    
    // Load progress dots for the current month
    loadMonthProgress();
    
    // Open add goal modal
    document.getElementById('add-goal-btn').addEventListener('click', function() {
        addGoalModal.show();
    });

    function addCyberGlow(element) {
    element.style.boxShadow = `0 0 15px ${getStatusColor(element.dataset.status)}`;
    setTimeout(() => {
        element.style.boxShadow = '';
    }, 300);
}

function getStatusColor(status) {
    const statusColors = {
        'complete': '#00ff66',
        'partial': '#ffbb00',
        'incomplete': '#ff3366'
    };
    return statusColors[status] || '#00f2ff';
}
    
    // Add goal form submission
    document.getElementById('add-goal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        fetch(this.action, {
            method: 'POST',
            body: new FormData(this)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to add goal');
                });
            }
            return response.text();
        })
        .then(() => {
            addGoalModal.hide();
            window.location.reload(); // Reload to show the new goal
        })
        .catch(error => {
            alert(error.message);
        });
    });
    
    // Delete goal buttons
    document.querySelectorAll('.delete-goal').forEach(button => {
        button.addEventListener('click', function() {
            const goalId = this.dataset.goalId;
            
            if (confirm('Are you sure you want to delete this goal? All progress data will be hidden.')) {
                fetch(`/goal/${goalId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the goal from DOM
                        const goalElement = document.querySelector(`.goal-item[data-goal-id="${goalId}"]`);
                        if (goalElement) {
                            goalElement.remove();
                        }
                        
                        // Reload progress dots
                        loadMonthProgress();
                        
                        // If no goals left, show empty state
                        if (document.querySelectorAll('.goal-item').length === 0) {
                            document.getElementById('goals-list').innerHTML = `
                                <div class="text-center text-muted p-4">
                                    <i class="bi bi-journal-check fs-1"></i>
                                    <p class="mt-2">No goals yet. Add up to 5 goals to track!</p>
                                </div>`;
                        }
                    }
                });
            }
        });
    });
    
    // Calendar day click
    document.querySelectorAll('.day-cell:not(.empty)').forEach(cell => {
        cell.addEventListener('click', function() {
            const dateStr = this.dataset.date;
            openProgressModal(dateStr);
        });
    });
    
    // Month navigation
    document.getElementById('prev-month').addEventListener('click', function() {
        navigateMonth(-1);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        navigateMonth(1);
    });
    
    // Save progress button
    document.getElementById('save-progress').addEventListener('click', function() {
        saveAllProgress();
    });
    
    // Mark today's date
    function markToday() {
        const todayCell = document.querySelector(`.day-cell[data-date="${formatDate(today)}"]`);
        if (todayCell) {
            todayCell.classList.add('today');
        }
    }
    
    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Format date for display
    function formatDateDisplay(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const monthName = date.toLocaleString('default', { month: 'long' });
        return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
    }
    
    // Load progress for all goals in the current month view
    function loadMonthProgress() {
        // Get all active goals
        const goals = Array.from(document.querySelectorAll('.goal-item')).map(item => {
            return {
                id: item.dataset.goalId,
                title: item.querySelector('h3').textContent
            };
        });
        
        // Return if no goals
        if (goals.length === 0) return;
        
        // Get all days in the current view
        const days = document.querySelectorAll('.day-cell:not(.empty)');
        
        // For each day, get progress for all goals
        days.forEach(day => {
            const dateStr = day.dataset.date;
            const dotsContainer = day.querySelector('.goal-dots');
            
            // Clear existing dots
            dotsContainer.innerHTML = '';
            // Add scanline effect container
    const scanline = document.createElement('div');
    scanline.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(0deg, 
            rgba(0, 242, 255, 0) 0%, 
            rgba(0, 242, 255, 0.1) 50%, 
            rgba(0, 242, 255, 0) 100%);
        pointer-events: none;
        opacity: 0.3;
    `;
    dotsContainer.appendChild(scanline);
            
            // For each goal, get progress and add a dot
          goals.forEach(goal => {
        fetch(`/progress/${goal.id}/${dateStr}`)
            .then(response => response.json())
            .then(data => {
                const dot = document.createElement('div');
                dot.classList.add('goal-dot', data.status);
                dot.dataset.goalId = goal.id;
                dot.dataset.status = data.status;
                dot.title = `${goal.title}: ${capitalizeFirstLetter(data.status)}`;

                // Add hover effects
                dot.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.3)';
                    this.style.filter = 'brightness(1.5)';
                    addCyberGlow(this);
                });
                
                dot.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                    this.style.filter = 'brightness(1)';
                });

                dotsContainer.appendChild(dot);
            });
});
    });
}
    
    // Navigate to previous or next month
    function navigateMonth(direction) {
        // Update month and year
        viewMonth += direction;
        
        // Handle year change
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
        } else if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
        }
        
        // Update UI and fetch new calendar data
        updateCalendar();
    }
    
    // Update the calendar with new month data
    function updateCalendar() {
        // Update month display
        document.getElementById('month-display').textContent = `${monthNames[viewMonth]} ${viewYear}`;
        
        // Fetch new calendar data from the server
        fetch(`/calendar?month=${viewMonth + 1}&year=${viewYear}`)
            .then(response => response.json())
            .then(data => {
                // Update the calendar grid
                const calendarDays = document.getElementById('calendar-days');
                calendarDays.innerHTML = '';
                
                // Add day cells
                data.calendar.forEach(week => {
                    week.forEach(day => {
                        const dayCell = document.createElement('div');
                        
                        if (day === 0) {
                            dayCell.className = 'day-cell empty';
                        } else {
                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            dayCell.className = 'day-cell';
                            dayCell.dataset.date = dateStr;
                            
                            // Check if this is today
                            if (viewYear === currentYear && viewMonth === currentMonth && day === currentDate) {
                                dayCell.classList.add('today');
                            }
                            
                            // Add content
                            dayCell.innerHTML = `
                                <div class="day-number">${day}</div>
                                <div class="goal-dots"></div>
                            `;
                            
                            // Add click event
                            dayCell.addEventListener('click', function() {
                                openProgressModal(dateStr);
                            });
                        }
                        
                        calendarDays.appendChild(dayCell);
                    });
                });
                
                // Load progress dots for the new month
                loadMonthProgress();
            });
    }
    
    // Open progress modal for a specific date
    function openProgressModal(dateStr) {
        // Set date in modal title
        document.getElementById('progress-date').textContent = formatDateDisplay(dateStr);
        
        // Get all active goals
        const goals = Array.from(document.querySelectorAll('.goal-item')).map(item => {
            return {
                id: item.dataset.goalId,
                title: item.querySelector('h3').textContent,
                description: item.querySelector('p') ? item.querySelector('p').textContent : ''
            };
        });
        
        // Clear previous content
        const progressList = document.getElementById('progress-goals-list');
        progressList.innerHTML = '';
        
        // Add each goal to the form
        goals.forEach(goal => {
            // Create progress item element
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-goal-item';
            progressItem.dataset.goalId = goal.id;
            progressItem.dataset.date = dateStr;
            
            // Fetch current progress for this goal and date
            fetch(`/progress/${goal.id}/${dateStr}`)
                .then(response => response.json())
                .then(data => {
                    progressItem.innerHTML = `
                        <h4>${goal.title}</h4>
                        ${goal.description ? `<p class="text-muted small">${goal.description}</p>` : ''}
                        <div class="progress-status-options">
                            <div class="status-option complete ${data.status === 'complete' ? 'selected' : ''}" 
                                 data-status="complete">Complete</div>
                            <div class="status-option partial ${data.status === 'partial' ? 'selected' : ''}" 
                                 data-status="partial">Partial</div>
                            <div class="status-option incomplete ${data.status === 'incomplete' ? 'selected' : ''}" 
                                 data-status="incomplete">Incomplete</div>
                        </div>
                        <div class="mt-2">
                            <label for="notes-${goal.id}" class="form-label">Notes (Optional)</label>
                            <textarea class="form-control notes-input" id="notes-${goal.id}" rows="2">${data.notes || ''}</textarea>
                        </div>
                    `;
                    
                    // Add click handlers for status options
                progressItem.querySelectorAll('.status-option').forEach(option => {
    option.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.status-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        this.classList.add('selected');
        addCyberGlow(this);
        
        // Add sound effect
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.play().catch(() => {});
    });
});
                    
                    // Add to form
                    progressList.appendChild(progressItem);
                });
        });
        
        // Show the modal
        progressModal.show();
    }
    
    // Save progress for all goals
function saveAllProgress() {
    const cyberSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
    let saveCounter = 0;
    const totalItems = document.querySelectorAll('.progress-goal-item').length;

    document.querySelectorAll('.progress-goal-item').forEach(item => {
        const goalId = item.dataset.goalId;
        const date = item.dataset.date;
        const selectedStatus = item.querySelector('.status-option.selected').dataset.status;
        const notes = item.querySelector('.notes-input').value;

        const formData = new FormData();
        formData.append('goal_id', goalId);
        formData.append('date', date);
        formData.append('status', selectedStatus);
        formData.append('notes', notes);

        fetch('/progress', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // Visual feedback
                item.style.transform = 'scale(1.02)';
                item.style.boxShadow = `0 0 15px ${getStatusColor(selectedStatus)}`;
                
                // Cyberpunk animation
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                    item.style.boxShadow = '';
                }, 300);

                // Sound feedback (only play once for simultaneous saves)
                if (saveCounter === 0) {
                    cyberSound.play().catch(() => {});
                }

                // Update progress counter
                saveCounter++;
                
                // Final completion check
                if (saveCounter === totalItems) {
                    progressModal.hide();
                    loadMonthProgress();
                    
                    // System-style completion message
                    const techBar = document.querySelector('.tech-details');
                    techBar.insertAdjacentHTML('beforeend', 
                        '<span class="text-success ms-3"><i class="bi bi-check2-circle"></i> SAVE COMPLETE</span>'
                    );
                    setTimeout(() => techBar.lastElementChild.remove(), 2000);
                }
            }
        })
        .catch(error => {
            console.error('Save failed:', error);
            item.style.boxShadow = '0 0 15px var(--incomplete-color)';
            setTimeout(() => item.style.boxShadow = '', 500);
        });
    });
}
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    
    // Add this at the end of DOMContentLoaded
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    
    setTimeout(() => {
        container.style.transition = 'opacity 0.5s ease-out';
        container.style.opacity = '1';
        
        const scanlines = document.createElement('div');
        scanlines.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 242, 255, 0) 0px,
                rgba(0, 242, 255, 0) 1px,
                rgba(0, 242, 255, 0.1) 2px,
                rgba(0, 242, 255, 0.1) 3px
            );
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: overlay;
        `;
        document.body.appendChild(scanlines);
    }, 500);
    
    // Add an endpoint for getting calendar data
    // This is normally defined in your Flask routes, we'll use AJAX to fetch it
});