const apiUrl = 'https://restcountries.com/v3.1/';
let countriesData = [];
const MAX_FAVORITES = 5;


async function searchCountries(query, languageFilter = '', regionFilter = '') {
    let url = '';

    if (query) {
        url = `${apiUrl}name/${query}`;
    } else if (regionFilter) {
        url = `${apiUrl}region/${regionFilter}`;
    } else if (languageFilter) {
        url = `${apiUrl}lang/${languageFilter}`;
    } else {
        url = `${apiUrl}all`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error fetching countries');
        }
        const countries = await response.json();
        countriesData = countries; 
        
        displayCountries(countries);
    } catch (error) {
        console.error('Failed to fetch countries:', error.message);
    }
}


function displayCountries(countries) {
    const countryList = document.getElementById('country-list');
    countryList.innerHTML = ''; 

    countries.forEach(country => {
        const card = document.createElement('div');
        card.classList.add('country-card');

        const countryFlag = document.createElement('img');
        countryFlag.src = country.flags.png;
        countryFlag.alt = `${country.name.common} Flag`;

        const countryName = document.createElement('p');
        countryName.textContent = country.name.common;

        card.appendChild(countryFlag);
        card.appendChild(countryName);

        card.addEventListener('click', () => showCountryDetails(country));

        countryList.appendChild(card);
    });
}

//  information about a country
function showCountryDetails(country) {
    const detailsPage = document.getElementById('details-page');
    const searchPage = document.getElementById('search-page');
    const countryDetails = document.getElementById('country-details');
    const favoriteBtn = document.getElementById('favorite-btn');

    searchPage.style.display = 'none';
    detailsPage.style.display = 'block';

    countryDetails.innerHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.png}" alt="${country.name.common} Flag">
        <p><strong>Top Level Domain:</strong> ${country.tld.join(', ')}</p>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Area:</strong> ${country.area.toLocaleString()} km²</p>
        <p><strong>Languages:</strong> ${Object.values(country.languages).join(', ')}</p>
    `;

    
    favoriteBtn.onclick = () => toggleFavorite(country);
}

//  toggle  favorite
function toggleFavorite(country) {
    const favorites = getFavorites();
    
    if (favorites.length >= MAX_FAVORITES && !favorites.some(fav => fav.cca3 === country.cca3)) {
        alert('You can only have up to 5 favorites.');
        return;
    }

    const isFavorite = favorites.some(fav => fav.cca3 === country.cca3);
    
    if (isFavorite) {
        
        const updatedFavorites = favorites.filter(fav => fav.cca3 !== country.cca3);
        saveFavorites(updatedFavorites);
    } else {
        
        favorites.push(country);
        saveFavorites(favorites);
    }

    renderFavorites();
}

// get favorites from localStorage
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

//  save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

//  render the favorite 
function renderFavorites() {
    const favorites = getFavorites();
    const favoritesSection = document.getElementById('favorites-section');
    const favoritesList = document.getElementById('favorites-list');

    if (favorites.length > 0) {
        favoritesSection.style.display = 'block';
        favoritesList.innerHTML = '';

        favorites.forEach(favorite => {
            const favoriteItem = document.createElement('div');
            favoriteItem.classList.add('favorite-item');

            const favoriteFlag = document.createElement('img');
            favoriteFlag.src = favorite.flags.png;
            favoriteFlag.alt = `${favorite.name.common} Flag`;

            const favoriteName = document.createElement('p');
            favoriteName.textContent = favorite.name.common;

            favoriteItem.appendChild(favoriteFlag);
            favoriteItem.appendChild(favoriteName);
            favoritesList.appendChild(favoriteItem);
        });
    } else {
        favoritesSection.style.display = 'none';
    }
}

//  "Back" button 
document.getElementById('back-btn').addEventListener('click', () => {
    const detailsPage = document.getElementById('details-page');
    const searchPage = document.getElementById('search-page');

    detailsPage.style.display = 'none';
    searchPage.style.display = 'block';
});

// Event listeners for filters and search
document.getElementById('search-input').addEventListener('input', (e) => searchCountries(e.target.value));
document.getElementById('language-filter').addEventListener('change', (e) => searchCountries('', e.target.value));
document.getElementById('region-filter').addEventListener('change', (e) => searchCountries('', '', e.target.value));

// Initial fetch for all countries and render favorites
searchCountries();
renderFavorites();