const express = require("express");

const app = express();

const path = require("path");

const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server is Running https://localhost:3003/");
    });
  } catch (e) {
    console.log(`Error Message = ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET Movie Name

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT movie_name
    FROM movie;`;
  const movieArray = await db.all(getMovieQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//create a new movie

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES ('${directorId}', '${movieName}', '${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//get by ID

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie
    WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieToResponseObject(movie));
});

//update movie details

app.put("/movies/:movieId", async (request, response) => {
  const { director_id, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updatedQuery = `
    UPDATE movie
    SET director_id = '${director_id}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;

  await db.run(updatedQuery);
  response.send("Movie Details Updated");
});

//delete movie name

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET ALL DIRECTORS

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM directors;
    `;
  const directorArray = await db.all(getDirectorsQuery);
  response.json(directorArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT movie_name 
    FROM movie
    WHERE director_id = '${directorId}';`;
  const moviesArray = await db.all(getDirectorMovieQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
