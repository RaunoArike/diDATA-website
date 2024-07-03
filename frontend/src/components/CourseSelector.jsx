import React, { useEffect, useState } from 'react';
import { fetchCourses } from '../courses';
import styles from '../css/Selector.module.css';

// This method enables showing the courses managed by a user in a dropdown menu
const CourseSelector = ({ onSelectCourse }) => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const loadCourses = async () => {
            const data = await fetchCourses();
            setCourses(data);
        };
        loadCourses();
    }, []);

    return (
        <select className={styles.courseSelect} onChange={e => onSelectCourse(e.target.value)}>
            <option value="">Select a course</option>
            {courses.map(course => (
                <option key={course.name} value={course.id}>{course.name}</option>
            ))}
        </select>
    );
};

export default CourseSelector;
