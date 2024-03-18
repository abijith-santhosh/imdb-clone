// Function to fetch movies and display them on the main page
displayMovies('movie'); // Initially display movies with 'movie' search term
async function displayMovies(searchTerm) {
    try {
        let currentPage = 1;
        const totalPages = 5;
        const cardContainer = document.getElementById('cardContainer');

        // Clear existing cards
        cardContainer.innerHTML = '';

        while (currentPage <= totalPages) {
            const response = await fetch(`http://www.omdbapi.com/?apikey=b3ebef55&s=${searchTerm}&type=movie&page=${currentPage}`);

            if (!response.ok) {
                throw new Error("Could not fetch data");
            }

            const data = await response.json();

            for (let i = 0; i < data.Search.length; i++) {
                const movie = data.Search[i];
                const card = document.createElement('div');
                card.classList.add('card');

                const image = document.createElement("img");
                image.src = movie.Poster;
                image.classList.add('posterImage');

                const movieDetails = document.createElement('div');
                movieDetails.classList.add('movieDetails');

                const title = document.createElement("h3");
                title.textContent = movie.Title;

                movieDetails.appendChild(title);

                const addToFavoritesBtn = document.createElement('button');
                addToFavoritesBtn.textContent = 'Add to Favorites';
                addToFavoritesBtn.classList.add('addToFavorites');
                addToFavoritesBtn.addEventListener('click', function(event) {
                    event.stopPropagation(); // Prevent click event on card from triggering
                    const imdbID = movie.imdbID;
                    addToFavorites(imdbID);
                });

                card.appendChild(image);
                card.appendChild(movieDetails);
                card.appendChild(addToFavoritesBtn);

                card.addEventListener('click', function() {
                    // Open a new page with movie details
                    window.open(`moviedetails.html?imdbID=${movie.imdbID}`, '_blank');
                });

                cardContainer.appendChild(card);
            }
            currentPage++;
        }
    } catch (error) {
        console.error(error);
    }
}

// Listen for changes in the search input
document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('input', function() {
        const searchTerm = searchBar.value.trim();
        if (searchTerm === '') {
            displayMovies('movie');
        } else {
            displayMovies(searchTerm);
        }
    });
});

// Function to add movie to favorites
function addToFavorites(imdbID) {
    const existingFavorites = JSON.parse(localStorage.getItem('favoriteMovies')) || []; //used local storage to save the data even when refreshed
    if (existingFavorites.includes(imdbID)) {
        alert('This movie is already in your favorites.');
        return;
    }
    existingFavorites.push(imdbID);
    localStorage.setItem('favoriteMovies', JSON.stringify(existingFavorites));
    alert('Movie added to favorites');
}

// Function to display favorite movies on favorites.html
async function displayFavoriteMovies() {
    const favoriteMovieIDs = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

    // Check if there are favorite movies to display
    if (favoriteMovieIDs.length === 0) {
        console.log("No favorite movies to display.");
        return;
    }

    const favoritesContainer = document.getElementById('favoritesContainer');

    if (favoritesContainer != null) {
        for (const imdbID of favoriteMovieIDs) {
            const movieDetails = await fetchMovieDetails(imdbID);
            if (movieDetails) {
                // Create card element for each favorite movie
                const card = document.createElement('div');
                card.classList.add('card');

                const image = document.createElement("img");
                image.src = movieDetails.Poster;
                image.classList.add('posterImage');

                const movieTitle = document.createElement("h3");
                movieTitle.textContent = movieDetails.Title;


                const movieYear = document.createElement("p");
                movieYear.textContent = "Year: " + movieDetails.Year;
                movieYear.style.marginTop = 0;

                const movieGenre = document.createElement("p");
                movieGenre.textContent = "Genre: " + movieDetails.Genre;
                movieGenre.style.marginTop = 0;

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove from Favorites';
                removeBtn.classList.add('removeFromFavorites');
                removeBtn.addEventListener('click', function() {
                    removeFromFavorites(imdbID);
                    // Remove the card from the DOM
                    card.remove();
                });

                card.appendChild(image);
                card.appendChild(movieTitle);
                card.appendChild(movieYear);
                card.appendChild(movieGenre);
                card.appendChild(removeBtn);

                favoritesContainer.appendChild(card);
            }
        }
    }
}


// Function to remove movie from favorites
function removeFromFavorites(imdbID) {
    const existingFavorites = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    const index = existingFavorites.indexOf(imdbID);
    if (index !== -1) {
        existingFavorites.splice(index, 1);
        localStorage.setItem('favoriteMovies', JSON.stringify(existingFavorites));
        alert('Movie removed from favorites');
    }
}


// Function to fetch movie details from OMDB API
async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`http://www.omdbapi.com/?apikey=b3ebef55&i=${imdbID}`);
        if (!response.ok) {
            throw new Error('Error fetching movie details');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
    }
}

// Function to display movie details on the movie details html page
async function displayMovieDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const imdbID = urlParams.get('imdbID');
        if (!imdbID) {
            return;
        }
        const movieDetailsContainer = document.getElementById('movieDetailsContainer');
        const movieDetails = await fetchMovieDetails(imdbID);

        // Update HTML elements with fetched details
        movieDetailsContainer.innerHTML = `
            <img id="poster" src="${movieDetails.Poster}" alt="Movie Poster">
            <h2 id="title">Name : ${movieDetails.Title}</h2>
            <p id="year">Year : ${movieDetails.Year}</p>
            <p id="genre">Genre : ${movieDetails.Genre}</p>
            <p id="plot">Plot : ${movieDetails.Plot}</p>
            <button id="addToFavoritesBtn">Add to Favorites</button>
        `;
        const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');
        addToFavoritesBtn.addEventListener('click', function() {
            addToFavorites(imdbID);
            alert('Movie added to favorites');
        });
    } catch (error) {
        console.error(error);
    }
}

// Call the displayMovieDetails function
displayMovieDetails();

// Display favorite movies if available
document.addEventListener('DOMContentLoaded', function() {
    displayFavoriteMovies();
});


