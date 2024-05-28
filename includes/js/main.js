document.getElementById('searchButton').addEventListener('click', function() {
    searchMovie();
});

const API_KEY = 'e71eb0da848dd27fc8f30d39aed49386';
const BASE_URL = 'https://api.themoviedb.org/3';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const query = 'Creed II'; // Query para o filme "Creed II"
        const response = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) {
            throw new Error('Error fetching movie details');
        }
        const searchData = await response.json();
        if (searchData.results && searchData.results.length > 0) {
            const firstMovie = searchData.results[0];
            const movieResponse = await fetch(`${BASE_URL}/movie/${firstMovie.id}?api_key=${API_KEY}&language=pt-BR`);
            if (!movieResponse.ok) {
                throw new Error('Error fetching movie details');
            }
            const movieData = await movieResponse.json();
            const providers = await getProviders(firstMovie.id);
            createCard(movieData, providers);
            fetchCast(movieData.id);
        } else {
            console.error('No movie found with the given query');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


async function searchMovie() {
    try {
        const query = document.getElementById('searchInput').value;
        const response = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}&language=pt-BR`);
        console.log('response ', response);
        if (!response.ok) {
            throw new Error('Error fetching movies');
        }
        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayResults(movies) {
    const resultsContainer = document.querySelector('.horizontal-card-information');
    resultsContainer.innerHTML = '';

    if (movies.length === 0) {
        resultsContainer.innerHTML = '<p>No movies found.</p>';
        return;
    }

    const firstMovie = movies[0];
    const providers = await getProviders(firstMovie.id);
    createCard(firstMovie, providers);
    fetchCast(firstMovie.id);
}

async function getProviders(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Error getting provider information');
        }
        const data = await response.json();
        const providers = data.results.BR;
        if (providers) {
            return {
                name: providers.flatrate[0].provider_name,
                logo: providers.flatrate[0].logo_path
            };
        }
        return {};
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
}

function createCard(movie, providers) {
    const resultsContainer = document.querySelector('.horizontal-card-information');

    const title = movie.title || movie.name;
    const description = movie.overview;
    const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    let providerContent = '';  

    if (providers.name) {
        const providerName = providers.name;
        const providerLogo = providers.logo ? `https://image.tmdb.org/t/p/w500${providers.logo}` : ''; 
        providerContent = `
            <button type="button" class="btn btn-light providers-btn mt-4">
                ${providerName}
                ${providerLogo ? `<img src="${providerLogo}" alt="Provider Logo" class="ml-4" />` : ''} <!-- Renderiza o logotipo do provedor somente se estiver disponível -->
            </button>
        `;
    } else { 
        providerContent = '<p class="mt-4">Informações não disponíveis</p>';
    }

    const cardHTML = `
        <div class="hero-slide-item-content" style="background-image: url('${imageUrl}');">
            <div class="item-content-wraper">
                <div class="item-content-title top-down ">${title}</div>
                <div class="item-content-description top-down delay-4 mt-4">${description}</div>
                <div class="item-action top-down delay-6">
                    ${providerContent}
                </div>
            </div>
        </div>
    `;
    resultsContainer.insertAdjacentHTML('beforeend', cardHTML);
}

async function fetchCast(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=pt-BR`);
        if (!response.ok) {
            throw new Error('Error fetching cast information');
        }
        const data = await response.json();
        displayCast(data.cast);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayCast(cast) {
    const castContainer = document.querySelector('.cast-information');
    castContainer.innerHTML = '';

    if (cast.length === 0) {
        castContainer.innerHTML = '<p>No cast information available.</p>';
        return;
    }

    const castHTML = cast.slice(0, 10).map(member => `
        <div class="cast-member">
            <img src="https://image.tmdb.org/t/p/w92${member.profile_path}" alt="${member.name}">
            <p>${member.name} as ${member.character}</p>
        </div>
    `).join('');

    castContainer.innerHTML = `<h2>Elenco</h2><div class="cast-grid">${castHTML}</div>`;
}

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const suggestionsList = document.querySelector(".suggestions");

    searchInput.addEventListener("input", function() {
        const query = this.value.trim();
        if (query.length === 0) {
            suggestionsList.innerHTML = "";  
            suggestionsList.classList.remove("show"); 
            return;
        }
 
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`)
        .then(response => response.json())
        .then(data => {
            suggestionsList.innerHTML = "";  
            data.results.forEach(movie => { 
                const suggestion = document.createElement("div");
                suggestion.classList.add("suggestion");
                suggestion.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w92${movie.poster_path}" alt="${movie.title}">
                    <span>${movie.title}</span>
                `;
                suggestion.addEventListener('click', function() {
                    searchInput.value = movie.title; 
                    suggestionsList.innerHTML = "";  
                    suggestionsList.classList.remove("show"); 
                });
                suggestionsList.appendChild(suggestion); 
            });

            suggestionsList.classList.add("show"); 
        })
        .catch(error => console.error("Erro ao obter sugestões:", error));
    });

     
    document.addEventListener("click", function(event) {
        if (!event.target.matches("#searchInput")) {
            suggestionsList.classList.remove("show");
        }
    });
});