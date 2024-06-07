import React from 'react';
import styles from '../css/AssignmentList.module.css';

const AssignmentList = ({ title, assignments, onClickAssignment }) => {
  return (
    <div className={styles.assignmentList}>
      <h3>{title}</h3>
      {assignments.length > 0 ? (
        <ul>
          {assignments.map(assignment => (
            <li
              key={assignment.id}
              onClick={() => onClickAssignment(assignment.id)}
            >
              {assignment.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No assignments to display.</p>
      )}
    </div>
  );
};

export default AssignmentList;
