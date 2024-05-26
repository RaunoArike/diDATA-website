import React, { useEffect, useState } from 'react';
import { fetchAssignments } from '../assignments';

const AssignmentSelector = ({ courseCode, onSelectAssignment }) => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        if (courseCode) {
            const loadAssignments = async () => {
                const data = await fetchAssignments(courseCode);
                setAssignments(data);
            };
            loadAssignments();
        }
    }, [courseCode]);

    return (
        <select onChange={e => onSelectAssignment(e.target.value)}>
            <option value="">Select an assignment</option>
            {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>{assignment.name}</option>
            ))}
        </select>
    );
};

export default AssignmentSelector;
