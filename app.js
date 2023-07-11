const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const DBPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: DBPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Returns a list of all movie names in the movie table API1
app.get("/movies/", async (request, response) => {
  const getMovieNames = `SELECT movie_name AS movieName FROM movie;`;
  const MovieArray = await db.all(getMovieNames);
  response.send(MovieArray);
});

//Creates a new movie in the movie table. movie_id is auto-incremented API2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const insertNewMovie = `INSERT INTO movie(director_id, movie_name,lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}');`;
  const QueryResult = await db.run(insertNewMovie);
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName,lead_actor AS leadActor FROM movie WHERE movie_id = ${movieId};`;
  const QueryResult = await db.get(getMovie);
  response.send(QueryResult);
});

//Updates the details of a movie in the movie table based on the movie ID API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//Deletes a movie from the movie table based on the movie ID API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const DeleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(DeleteQuery);
  response.send("Movie Removed");
});

//Returns a list of all directors in the director table API6
app.get("/directors/", async (request, response) => {
  const getDirectors = `SELECT director_id AS directorId, director_name AS directorName FROM director;`;
  const queryResult = await db.all(getDirectors);
  response.send(queryResult);
});

//Returns a list of all movie names directed by a specific director API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllMovieNamesByDirector = `
  SELECT movie.movie_name AS movieName 
  FROM movie INNER JOIN director
  ON director.director_id = movie.director_id
   WHERE director.director_id = ${directorId};`;
  const queryResult = await db.all(getAllMovieNamesByDirector);
  response.send(queryResult);
});

module.exports = app;
