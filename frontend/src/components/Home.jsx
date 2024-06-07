import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import CourseSelector from '../components/CourseSelector';
import AssignmentSelector from '../components/AssignmentSelector';
import ChartComponent from '../components/ChartComponent';
import AssignmentList from '../components/AssignmentList';
import { fetchAssignments } from '../assignments';
import styles from '../css/Home.module.css';

const Home = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [liveAssignments, setLiveAssignments] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    console.log('apiKey:', apiKey);
    if (!apiKey) {
      console.log('Navigating to /login');
      navigate('/login');
    }
  }, [navigate]);

  const handleSelectCourse = async (courseCode) => {
    console.log('Selected course:', courseCode);
    setSelectedCourse(courseCode);
    setSelectedAssignment('');

    // Fetch assignments for the selected course
    const data = await fetchAssignments(courseCode);
    const live = data.filter(a => new Date(a.end_at) > new Date());
    const recent = data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5);

    setLiveAssignments(live.slice(0, 5));
    setRecentAssignments(recent);
  };

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignment(assignmentId);
  };

  const handleClickRecentAssignment = (assignmentId) => {
    setSelectedAssignment(assignmentId);
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.content}>
        <div id="side-menu" className={styles.sideMenu}>
          <h1>Welcome, <i>user</i>!</h1>
          <h3>Select a course</h3>
          <CourseSelector onSelectCourse={handleSelectCourse} />
          {selectedCourse && (
            <>
              <h3>Select an assignment</h3>
              <AssignmentSelector courseCode={selectedCourse} onSelectAssignment={handleSelectAssignment} />
            </>
          )}
        </div>
        {selectedAssignment ? (
          <div className={styles.chartContainer}>
            <ChartComponent courseCode={selectedCourse} assignmentId={selectedAssignment} />
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <div className={styles.assignmentsContainer}>
              <AssignmentList title="Live assignments" assignments={liveAssignments} />
              <AssignmentList title="Recently updated assignments" assignments={recentAssignments} onClickAssignment={handleClickRecentAssignment} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
