import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import CourseSelector from '../components/CourseSelector';
import AssignmentSelector from '../components/AssignmentSelector';
import ChartComponent from '../components/ChartComponent';
import styles from '../css/Home.module.css';

const Home = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    console.log('apiKey:', apiKey);
    if (!apiKey) {
      console.log('Navigating to /login');
      navigate('/login');
    }
  }, [navigate]);

  const handleSelectCourse = (courseCode) => {
    console.log('Selected course:', courseCode);
    setSelectedCourse(courseCode);
    setSelectedAssignment('');
  };

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignment(assignmentId);
  };

  return (
    <div className={styles.content}>
      <div id="side-menu" className={styles.sideMenu}>
        <h1>Welcome, <i>user</i>!</h1>
        <h3>Select a course:</h3>
        <CourseSelector onSelectCourse={handleSelectCourse} />
        {selectedCourse && (
          <>
            <h3>Select an assignment:</h3>
            <AssignmentSelector courseCode={selectedCourse} onSelectAssignment={handleSelectAssignment} />
          </>
        )}
      </div>
      <div className={styles.chartContainer}>
        {selectedAssignment && <ChartComponent courseCode={selectedCourse} assignmentId={selectedAssignment} />}
      </div>
    </div>
  );
};

export default Home;
