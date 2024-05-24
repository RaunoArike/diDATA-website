import { fetchCourses } from './courses.js';
import { fetchAssignments } from './assignments.js';
import { renderCharts, downloadChart } from './charts.js';


document.addEventListener('DOMContentLoaded', function () {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
        window.location.href = '/login';
        return;
    }

    const courseSelect = document.getElementById('course-select');
    const assignmentSelect = document.getElementById('assignment-select');

    assignmentSelect.addEventListener('change', function() {
        this.removeChild(this.options[0]);
        const courseCode = courseSelect.value;
        const assignmentId = this.value;
        renderCharts(courseCode, assignmentId);
    });

    courseSelect.addEventListener('change', function () {
        this.removeChild(this.options[0]);
        fetchAssignments(this.value);
    });
    
    fetchCourses(); // Initial fetch of courses
});


document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById('download-button');
    downloadButton.addEventListener('click', function() {
        const assignmentName = document.getElementById('assignment-title').textContent;
        downloadChart(assignmentName);
    });
});
