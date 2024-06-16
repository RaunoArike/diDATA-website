import React, { useState, useEffect } from 'react';
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
  const [isDemoMode, setIsDemoMode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    if (demoMode) {
      setIsDemoMode(true);
    } else {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        navigate('/login');
      }
      setIsDemoMode(false);
    }
  }, [navigate]);

  const handleSelectCourse = async (courseCode) => {
    setSelectedCourse(courseCode);
    setSelectedAssignment('');

    const data = await fetchAssignments(courseCode);
    const live = data.filter(a => new Date(a.end_at) > new Date());
    const recent = data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5);

    setLiveAssignments(live.slice(0, 5));
    setRecentAssignments(recent);
  };

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignment(assignmentId);
  };

  if (isDemoMode === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.appContainer}>
      <div className={styles.content}>
        <div id="side-menu" className={styles.sideMenu}>
          <h1>Welcome, <i>user</i>!</h1>
          {!isDemoMode && (
            <>
              <h3>Select a course</h3>
              <CourseSelector onSelectCourse={handleSelectCourse} />
              {selectedCourse && (
                <>
                  <h3>Select an assignment</h3>
                  <AssignmentSelector courseCode={selectedCourse} onSelectAssignment={handleSelectAssignment} />
                </>
              )}
            </>
          )}
        </div>
        {isDemoMode ? (
          <div className={styles.chartContainer}>
            <ChartComponent courseCode="demoCourse" assignmentId="demoAssignment" isDemoMode={true} />
          </div>
        ) : (
          selectedAssignment ? (
            <div className={styles.chartContainer}>
              <ChartComponent courseCode={selectedCourse} assignmentId={selectedAssignment} />
            </div>
          ) : (
            <div className={styles.chartContainer}>
              <div className={styles.assignmentsContainer}>
                <AssignmentList title="Live assignments" assignments={liveAssignments} />
                <AssignmentList title="Recently updated assignments" assignments={recentAssignments} onClickAssignment={handleSelectAssignment} />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
