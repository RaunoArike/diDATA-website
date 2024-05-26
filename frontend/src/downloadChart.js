import html2canvas from 'html2canvas';

export const downloadChart = async (chartRef, assignmentName, isShowingExerciseData) => {
    const canvas = await html2canvas(chartRef.current);
    const pngURL = canvas.toDataURL('image/png');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngURL;
    downloadLink.download = isShowingExerciseData ? `${assignmentName}_by_exercise.png` : `${assignmentName}_by_question.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};
