const api_key = '3eb7ccd86dc5239c6eb11c595f703236';
const api_url = 'https://api.themoviedb.org/3';
const id_movie = '617126';

async function getMovie() {
    const response = await fetch(`${api_url}/movie/${id_movie}?api_key=${api_key}&language=pt-BR&append_to_response=videos,images,credits`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const movie = await response.json();

    return {
        posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        title: movie.title,
        genres: movie.genres.map(genre => genre.name).join(', '),
        overview: movie.overview,
        year: new Date(movie.release_date).getFullYear(),
        director: movie.credits.crew.find(crew => crew.job === 'Director')?.name || 'Unknown',
        story: movie.credits.crew
            .filter(crew =>
                crew.job === 'Writer' || crew.job === 'Story'
            )
            .map(crew => crew.name)
            .filter((name, index, self) => self.indexOf(name) === index) // remove nomes duplicados
            .join(', ') || 'Desconhecido',

        lenguage: movie.original_language,
        budget: movie.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        revenue: movie.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        releaseDate: movie.release_date,
        rating: movie.vote_average,
        videos: movie.videos.results.map(video => ({
            key: video.key,
            name: video.name,
            site: video.site
        })),
        images: movie.images.backdrops.map(image => ({
            url: `https://image.tmdb.org/t/p/w500${image.file_path}`,
            width: image.width,
            height: image.height
        })),
        posters: movie.images.posters.map(poster => ({
            url: `https://image.tmdb.org/t/p/w500${poster.file_path}`,
            width: poster.width,
            height: poster.height
        })),
        cast: movie.credits.cast.slice(0, 10).map(actor => ({
            name: actor.name,
            character: actor.character,
            profileUrl: `https://image.tmdb.org/t/p/w500${actor.profile_path}`
        })),
    };
}

async function getMovieDetails() {
    try {
        const movie = await getMovie();

        const elements = {
            poster: document.querySelector('.about-movie--cover'),
            title: document.querySelector('.about-movie--title'),
            genres: document.querySelector('.about-movie--genres'),
            overview: document.querySelector('.about-movie--overview'),
            director: document.querySelector('.about-movie--director'),
            writter: document.querySelector('.about-movie--writter'), // <- aqui
            lenguage: document.querySelector('.about-movie--lenguage'),
            releaseDate: document.querySelector('.about-movie--release-date'),
            budget: document.querySelector('.about-movie--budget'),
            revenue: document.querySelector('.about-movie--revenue')
        };
        if (elements.poster) {
            elements.poster.innerHTML = `<img src="${movie.posterUrl}" alt="${movie.title}" />`;
        }

        if (elements.title) {
            elements.title.innerHTML = `<h1>${movie.title} <span style="opacity: 0.5">(${movie.releaseDate.slice(0, 4)})</span></h1>`;
        }

        if (elements.genres) {
            elements.genres.innerHTML = `<h3>Gênero:</h3><p>${movie.genres}</p>`;
        }

        if (elements.overview) {
            elements.overview.innerHTML = `<h3>Sinopse:</h3><p>${movie.overview}</p>`;
        }

        if (elements.director) {
            elements.director.innerHTML = `<h3>Direção:</h3><p>${movie.director}</p>`;
        }

        if (elements.writter) {
            elements.writter.innerHTML = `<h3>Roteiro:</h3><p>${movie.story}</p>`;
        }

        if (elements.lenguage) {
            elements.lenguage.innerHTML = `<h3>Idioma:</h3><p>${movie.lenguage.toUpperCase()}</p>`;
        }

        if (elements.releaseDate) {
            elements.releaseDate.innerHTML = `<h3>Data de Lançamento:</h3><p>${new Date(movie.releaseDate).toLocaleDateString('pt-BR')}</p>`;
        }

        if (elements.budget) {
            elements.budget.innerHTML = `<h3>Orçamento:</h3><p>${movie.budget}</p>`;
        }

        if (elements.revenue) {
            elements.revenue.innerHTML = `<h3>Receita:</h3><p>${movie.revenue}</p>`;
        }

        return movie;

    } catch (error) {
        console.error('Erro ao obter detalhes do filme:', error);
    }
}

getMovieDetails().then(movie => {
    if (movie && movie.images && movie.images.length !== undefined) {
        // Already handled images elsewhere
    }
}).catch(console.error);
// Chamar a função para carregar os dados
getMovieDetails().catch(console.error);


async function loadCastCarousel() {
    try {
        const movie = await getMovie(); // chama a API

        const castCarousel = document.getElementById('cast-carousel');

        // Garante que temos o container
        if (!castCarousel) return;

        // Limpa o conteúdo anterior, se houver
        castCarousel.innerHTML = '';

        // Adiciona cada ator ao carousel
        movie.cast.forEach(actor => {
            const item = document.createElement('div');
            item.classList.add('item');
            item.innerHTML = `
                <div class="cast-card d-flex flex-column align-items-center text-center mb-5">
                  <img src="${actor.profileUrl}" alt="${actor.name}" />
                  <h4>${actor.name}</h4>
                  <p>${actor.character}</p>
                </div>
              `;
            castCarousel.appendChild(item);
        });

        // Inicializa o Owl Carousel depois dos elementos estarem no DOM
        $('#cast-carousel').owlCarousel({
            items: 5,
            loop: false,
            margin: 20,
            center: false,
            autowidth: true,
            touchDrag: true,
            mouseDrag: true,
            autoplay: false,
            dots: false,
            nav: false,
            onInitialized: function() {
                const carousel = document.getElementById('cast-carousel');
                if (carousel) {
                    const shadowDiv = document.createElement('div');
                    shadowDiv.className = 'carousel-shadow';
                    shadowDiv.innerHTML = `<img src="./assets/img/shadow.png" alt="">`;
                    carousel.appendChild(shadowDiv);
                }
            },
            responsive: {
                0: { items: 2 },
                768: { items: 4 },
                1024: { items: 6 }
            }
        });

    } catch (err) {
        console.error('Erro ao carregar elenco:', err);
    }
}

// Chama ao carregar a página
loadCastCarousel();

