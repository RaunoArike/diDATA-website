import React, { useState } from 'react';
import CourseSelector from './components/CourseSelector';
import AssignmentSelector from './components/AssignmentSelector';
import ChartComponent from './components/ChartComponent';
import { downloadChart } from './downloadChart';

const App = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');

  const handleSelectCourse = (courseCode) => {
    console.log('Selected course:', courseCode);
    setSelectedCourse(courseCode);
    setSelectedAssignment(''); // Reset assignment when a new course is selected
  };

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignment(assignmentId);
  };

  return (
    <div className="container">
      <div id="side-menu" className="container">
        <h1>Select a Course:</h1>
        <CourseSelector onSelectCourse={handleSelectCourse} />
        {selectedCourse && (
          <>
            <h1>Select an Assignment:</h1>
            <AssignmentSelector courseCode={selectedCourse} onSelectAssignment={handleSelectAssignment} />
          </>
        )}
      </div>
      <div id="charts-container" className="container">
        {selectedAssignment && <ChartComponent courseCode={selectedCourse} assignmentId={selectedAssignment} />}
      </div>
    </div>
  );
};

export default App;