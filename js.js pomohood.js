let endTime = null;
let isRunning = false;
let currentSession = 'work';
let intervalId = null;

const timerDisplay = document.getElementById('timer-text');
const sessionType = document.getElementById('session-type');
const historyList = document.getElementById('history-list');

if (!timerDisplay || !sessionType || !historyList) {
    console.error("Error: Timer, session type, or history list element not found in the DOM.");
} else {
    function formatDateTime(date) {
        const hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        return `${hours}:${minutes} ${ampm} WIB`;
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
        historyList.innerHTML = '';
        history.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `[${entry.time}] - ${entry.session} Selesai`;
            historyList.appendChild(li);
        });
    }

    function saveHistory(sessionType, time) {
        const history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
        history.push({ session: sessionType, time: time });
        localStorage.setItem('pomodoroHistory', JSON.stringify(history));
        loadHistory();
    }

    function updateDisplay(remainingTime) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function setWorkSession() {
        if (isRunning) pauseTimer();
        currentSession = 'work';
        sessionType.textContent = 'Work Session';
        updateDisplay(25 * 60);
    }

    function setShortBreak() {
        if (isRunning) pauseTimer();
        currentSession = 'shortBreak';
        sessionType.textContent = 'Short Break';
        updateDisplay(5 * 60);
    }

    function setLongBreak() {
        if (isRunning) pauseTimer();
        currentSession = 'longBreak';
        sessionType.textContent = 'Long Break';
        updateDisplay(15 * 60);
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            const remainingTime = parseInt(timerDisplay.textContent.split(':')[0]) * 60 + parseInt(timerDisplay.textContent.split(':')[1]);
            endTime = Date.now() + remainingTime * 1000;

            function tick() {
                if (!isRunning) return;

                const remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
                updateDisplay(remainingTime);

                if (remainingTime <= 0) {
                    isRunning = false;
                    endTime = null;
                    const sessionName = currentSession === 'work' ? 'Work Session' : currentSession === 'shortBreak' ? 'Short Break' : 'Long Break';
                    const completionTime = formatDateTime(new Date());
                    saveHistory(sessionName, completionTime);

                    currentSession = 'work';
                    sessionType.textContent = 'Work Session';
                    updateDisplay(25 * 60);
                    alert(currentSession === 'work' ? 'Start Mining Block!' : 'Take a Break - HODL!');
                } else {
                    intervalId = requestAnimationFrame(tick);
                }
            }

            tick();
        }
    }

    function pauseTimer() {
        if (isRunning) {
            isRunning = false;
            cancelAnimationFrame(intervalId);
            const remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            updateDisplay(remainingTime);
        }
    }

    function resetTimer() {
        isRunning = false;
        cancelAnimationFrame(intervalId);
        endTime = null;
        if (currentSession === 'work') {
            sessionType.textContent = 'Work Session';
            updateDisplay(25 * 60);
        } else if (currentSession === 'shortBreak') {
            sessionType.textContent = 'Short Break';
            updateDisplay(5 * 60);
        } else {
            sessionType.textContent = 'Long Break';
            updateDisplay(15 * 60);
        }
    }

    loadHistory();
    updateDisplay(25 * 60);
}