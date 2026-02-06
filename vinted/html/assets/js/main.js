/**
 * Vinted Tracker Pro - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {

    // FAQ Toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const answer = item.querySelector('.faq-answer');
            const isOpen = answer.style.display === 'block';

            // Close all
            document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');

            // Toggle current
            answer.style.display = isOpen ? 'none' : 'block';
        });
    });

    // Initialize FAQ - hide all answers
    document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');

    // Countdown Timer
    const COUNTDOWN_DURATION = 9720; // 2h 42m in seconds
    let timeLeft = COUNTDOWN_DURATION;
    let timerInterval = null;

    function updateTimer() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        const timerEl = document.getElementById('countdown');
        if (timerEl) {
            timerEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        if (timeLeft > 0) {
            timeLeft--;
        } else {
            clearInterval(timerInterval);
        }
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
});
