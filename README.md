# diDATA

diDATA is a web application that makes it easier for professors, course managers and lecturers to analyse the results of the students by providing detailed visualisations of these results. It has been developed for TU Delft under the PRIMECH project and builds upon the functionalities offered by the ANS platform. In comparison to ANS, diDATA offers a much more detailed view of the comparative overall performance of the students on individual questions and exercises. This is an early beta version of the app.

## Structure of the Application

The application uses a Django backend and a React frontend. The responsibilities of the backend and frontend are fully separated and both can run fully independently. The frontend and backend communicate through API calls and the responses are returned to the frontend as JSON messages.

To locally run the frontend, enter the following commands:
```
cd frontend
npm start
```

To locally run the backend, enter the following commands in a separate terminal window (this should be done inside the application's root directory):
```
python manage.py runserver
```

To locally set up the database:
1. Ensure that you have PostgreSQL installed on your system.
2. Create a new database in PostgreSQL by running the following command in the terminal:
```
sudo -u postgres psql
```
3. In the PostgreSQL shell, run the following commands to create a new database:
```
CREATE USER 'your_username' WITH PASSWORD 'your_password';
CREATE DATABASE 'db_name' OWNER 'your_username';
GRANT ALL PRIVILEGES ON DATABASE 'db_name' TO 'your_username';
```
4. Run the following command in the root directory of diDATA to apply the migrations and create the necessary tables in the database:
```
python manage.py makemigrations
python manage.py migrate
```

Before running those commands, ensure that you have installed all the necessary dependencies. These dependencies are descibed in the next section.

## An Overview of the Functionalities

Currently, the app includes a simple Login page, a Data page where the user can see detailed metrics about their chosen assignment, and a Settings page. The Login page looks as follows:

![image](./readme_images/login.png)

In the API key field, the user has to enter their ANS API key. For users who don't have an API key yet, but who are interested in how the app functions, there is a Demo page that includes all of the functionalities of the Data page, but presents demo data that doesn't correspond to any real assignment.

The Data page includes a side menu where the user can choose the Course and the Assignment for which they wish to view the data. Once the user has chosen a course, the 5 most recently updated and currently live assignments are shown for that course:

![image](./readme_images/assignments.png)

Once the user has also chosen an assignment, either from the dropdown menu on the side or from the list of most recently updated or live courses, the Charts page will be shown that displays detailed data about the assignment:

![image](./readme_images/metrics.png)

The Charts page has three views: Metrics, Exercises, and Questions. Metrics, as shown on the figure above, display the grade distribution and some summary statistics about the entire assignment. The Exercises page looks as follows:

![image](./readme_images/exercises_simple.png)

Exercises usually consist of multiple questions, and this page gives an overview of the students' submissions aggregated by exercise. There are two views: Stacked and Detailed. In the Stacked view, the user can get a rough overview of the students' performance: for each exercise, 5 bars are shown, corresponding to:
1. The number of students who answered all of the questions under the given exercise correctly
2. The number of students who answered all of the questions under the given exercise incorrectly
3. The number of students who got some of the questions under the given exercise correct and some incorrect
4. The total number of questions under the given exercise that were unattempted
5. The total number of questions under the given exercise that were unchecked

In the detailed view, the exact marks of the students who answered some of the questions correctly and other questions incorrectly are shown. The exact score and the number of students who attained that score can be seen by hovering over the bar of interest:

![image](./readme_images/exercises_detailed.png)

Finally, there is the Questions page, which presents the most detailed overview of the results. This page looks as follows:

![image](./readme_images/questions_simple.png)

For each question, the following data is shown:
1. The number of students who answered the question correctly
2. The number of students who answered the question incorrectly
3. The number of students who were given a partial mark for the question (again, there is also the Detailed mode that presents a detailed breakdown of the partial marks)
4. The number of students who left the question unattempted
5. The number of students for whom the question was unchecked

The Questions page also has a detailed view:

![image](./readme_images/questions_detailed.png)

Each view includes two buttons: the Download button and the Update button (not shown in the demo mode). The Download button enables the user to download the currently opened chart as a PNG file. The Update button enables the user to make an API call to ANS to refresh the data, since by default, the data will be served from diDATA's own database. For live assignments, the data stored in diDATA's database can be outdated and the Update button enables the retrieval of the latest results.

Finally, the application also includes a Settings page. This page gives the user the opportunity to view their API key, to remove it from the system, and to enable the dark mode.

![image](./readme_images/settings.png)

## Dependencies

To run diDATA locally, you need to install several dependencies for both the backend and frontend. Follow the steps below:

### Backend Dependencies

1. **Python and Pip:**
   Ensure that Python 3 and pip are installed on your system. You can download Python from the [official website](https://www.python.org/downloads/).

2. **Install Backend Dependencies:**
   Run the following command in the root directory to install all the required Python packages:

   ```bash
   pip install -r requirements.txt
    ```

### Frontend Dependencies

1. **Node.js and npm:**
   Ensure that Node.js and npm are installed on your system. You can download and install them from the [official Node.js website](https://nodejs.org/en/download/).

2. **Install Frontend Dependencies:**
   Navigate to the `frontend` directory and run the following command to install all the required Node.js packages:

   ```bash
   npm install
    ```

### Database Dependencies

You need to have PostgreSQL installed on your system. You can download and install it from the [official PostgreSQL website](https://www.postgresql.org/download/).
