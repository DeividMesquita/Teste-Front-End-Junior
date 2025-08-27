const api_key = '3eb7ccd86dc5239c6eb11c595f703236';
const api_url = 'https://api.themoviedb.org/3';
const id_movie = '617126';

// Função para obter os detalhes do filme
async function getMovieDetails() {
    try {
        // Busca os dados do filme
        const url = `${api_url}/movie/${id_movie}?api_key=${api_key}&language=pt-BR&append_to_response=credits`;
        const res = await fetch(url);
        const data = await res.json();

        // Extrai os dados necessários
        const movie = {
            posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
            title: data.title,
            genres: data.genres.map(g => g.name).join(', '),
            overview: data.overview,
            director: data.credits.crew.find(c => c.job === 'Director')?.name || 'Não informado',
            story: data.credits.crew.find(c => c.job === 'Writer' || c.job === 'Screenplay')?.name || 'Não informado',
            lenguage: data.original_language,
            releaseDate: data.release_date,
            budget: data.budget ? `$${data.budget.toLocaleString()}` : 'N/A',
            revenue: data.revenue ? `$${data.revenue.toLocaleString()}` : 'N/A'
        };

        // Atualiza o DOM com os dados do filme
        const elements = {
            poster: document.querySelector('.about-movie--cover'),
            title: document.querySelector('.about-movie--title'),
            genres: document.querySelector('.about-movie--genres'),
            overview: document.querySelector('.about-movie--overview'),
            director: document.querySelector('.about-movie--director'),
            writter: document.querySelector('.about-movie--writter'),
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

// Chama a função
getMovieDetails();



async function loadCastCarousel() {
    try {
        const response = await fetch(`${api_url}/movie/${id_movie}/credits?api_key=${api_key}&language=pt-BR`);
        const data = await response.json();

        const castCarousel = document.getElementById('cast-carousel');
        if (!castCarousel) return;

        castCarousel.innerHTML = '';

        // pega os primeiros 15 atores pra não poluir demais
        const cast = data.cast.slice(0, 10);

        cast.forEach(actor => {
            const profileUrl = actor.profile_path
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                : './assets/img/no-profile.png';

            const item = document.createElement('div');
            item.classList.add('item');
            item.innerHTML = `
                <div class="cast-card d-flex flex-column align-items-center text-center mb-5">
                  <img src="${profileUrl}" alt="${actor.name}" />
                  <h4>${actor.name}</h4>
                  <p>${actor.character}</p>
                </div>
              `;
            castCarousel.appendChild(item);
        });

        // Inicializa o Owl Carousel
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
            onInitialized: function () {
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
                480: { items: 3 },
                768: { items: 4 },
                1024: { items: 6 }
            }
        });

    } catch (err) {
        console.error('Erro ao carregar elenco:', err);
    }
}

// Chama quando a página carregar
loadCastCarousel();


// Função para buscar e renderizar reviews
async function fetchReviews() {
    try {
        const response = await fetch(`${api_url}/movie/${id_movie}/reviews?api_key=${api_key}&language=pt-BR`);
        const data = await response.json();

        renderReviews(data.results);
    } catch (error) {
        console.error("Erro ao carregar reviews:", error);
    }
}

// Função para renderizar reviews no DOM
function renderReviews(reviews) {
    const container = document.querySelector('.reviews-container');

    if (!container) return;

    // Limpa o container antes de adicionar novas reviews
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="text-muted">Sem resenhas disponíveis.</p>';
        return;
    }

    container.innerHTML = '';

    // Mostra apenas as duas primeiras reviews
    reviews.slice(0, 2).forEach(review => {
        const author = review.author || "Anônimo";
        const content = review.content || "Sem conteúdo disponível.";
        const date = review.created_at
            ? new Date(review.created_at).toLocaleDateString("pt-BR")
            : "Data não informada";
        const rating = review.author_details?.rating;

        const reviewElement = document.createElement('div');
        reviewElement.classList.add('reviews__container--item', 'col-12', 'col-lg-6');
        reviewElement.innerHTML = `
            <p class="reviews__content">${content}</p>
            <div class="author col-12">
                <h4 class="author__name col-12">Por: <span>${author}</span></h4>
                <div class="author__info">
                    <p class="author__date">${date}</p>
                    <p class="author__rating">
                        Nota: ${rating !== undefined ? `<span>${rating}</span> / 10` : 'Sem nota'}
                    </p>
                </div>
            </div>
        `;
        container.appendChild(reviewElement);
    });
}

// chama assim quando quiser carregar as resenhas:
fetchReviews();


async function loadVideos() {
    try {
        const response = await fetch(`${api_url}/movie/${id_movie}/videos?api_key=${api_key}&language=pt-BR`);
        const data = await response.json();

        const videos = data.results || [];
        const videoContainer = document.getElementById('videos');

        if (!videoContainer) return;

        videoContainer.innerHTML = '';
        if (videos.length === 0) {
            videoContainer.innerHTML = '<p class="text-muted">Sem vídeos disponíveis.</p>';
            return;
        }

        videos.forEach(video => {
            const item = document.createElement('div');
            item.classList.add('item');

            const videoWrapper = document.createElement('div');
            videoWrapper.classList.add('video-wrapper');

            videoWrapper.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${video.key}"
                title="${video.name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `;

            item.appendChild(videoWrapper);
            videoContainer.appendChild(item);
        });

        $('#videos').owlCarousel({
            loop: false,
            margin: 20,
            center: false,
            autoWidth: true, // <-- Adicione esta linha
            autoplay: false,
            dots: false,
            nav: false,
            onInitialized: function () {
                const carousel = document.getElementById('videos');
                if (carousel) {
                    const shadowDiv = document.createElement('div');
                    shadowDiv.className = 'midia-shadow';
                    shadowDiv.innerHTML = `<img src="./assets/img/shadow.png" alt="">`;
                    carousel.appendChild(shadowDiv);
                }
            },
            responsive: {
                0: { items: 2, mouseDrag: true, touchDrag: true },
                1024: { items: 3, mouseDrag: false, touchDrag: false }
            }
        });

    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
    }
}

loadVideos().catch(console.error);


async function loadPosters() {
    try {
        const response = await fetch(`${api_url}/movie/${id_movie}/images?api_key=${api_key}`);
        if (!response.ok) throw new Error('Erro ao buscar posters');
        const data = await response.json();

        const posters = data.posters.slice(0, 15);
        const postersContainer = document.getElementById('posters');
        if (!postersContainer) return;

        postersContainer.innerHTML = ''; // limpa antes

        if (posters.length === 0) {
            postersContainer.innerHTML = '<p class="text-muted">Sem pôsteres disponíveis.</p>';
            return;
        }

        posters.forEach((img, i) => {
            const posterElement = document.createElement('div');
            posterElement.classList.add('poster-item', 'item');
            posterElement.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${img.file_path}" alt="Pôster ${i + 1}" />`;
            postersContainer.appendChild(posterElement);
        });

        // Inicializa Owl Carousel
        $('#posters').owlCarousel({
            loop: false,
            margin: 20,
            center: false,
            autowidth: true,
            autoplay: false,
            dots: false,
            nav: false,
            onInitialized: function () {
                const carousel = document.getElementById('posters');
                if (carousel) {
                    const shadowDiv = document.createElement('div');
                    shadowDiv.className = 'midia-shadow';
                    shadowDiv.innerHTML = `<img src="./assets/img/shadow.png" alt="">`;
                    carousel.appendChild(shadowDiv);
                }
            },
            responsive: {
                0: { items: 2, mouseDrag: true, touchDrag: true },
                768: { items: 2, mouseDrag: true, touchDrag: true },
                1024: { items: 3, mouseDrag: false, touchDrag: false }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar pôsteres:', error);
    }
}


loadPosters().catch(console.error);

async function loadBackdrops() {
    try {
        const response = await fetch(`${api_url}/movie/${id_movie}/images?api_key=${api_key}`);
        if (!response.ok) throw new Error('Erro ao buscar backdrops');
        const data = await response.json();

        const backdrops = data.backdrops.slice(0, 10); // pode aumentar se quiser
        const backdropsContainer = document.getElementById('backdrops');
        if (!backdropsContainer) return;

        backdropsContainer.innerHTML = ''; // limpa antes

        if (backdrops.length === 0) {
            backdropsContainer.innerHTML = '<p class="text-muted">Sem imagens disponíveis.</p>';
            return;
        }

        backdrops.forEach((img, i) => {
            const backdropElement = document.createElement('div');
            backdropElement.classList.add('backdrop-item', 'item');
            backdropElement.innerHTML = `<img src="https://image.tmdb.org/t/p/w780${img.file_path}" alt="Backdrop ${i + 1}" />`;
            backdropsContainer.appendChild(backdropElement);
        });

        // Inicializa Owl Carousel
        $('#backdrops').owlCarousel({
            loop: false,
            margin: 20,
            center: false,
            autowidth: true,
            autoplay: false,
            dots: false,
            nav: false,
            onInitialized: function () {
                const carousel = document.getElementById('backdrops');
                if (carousel) {
                    const shadowDiv = document.createElement('div');
                    shadowDiv.className = 'midia-shadow';
                    shadowDiv.innerHTML = `<img src="./assets/img/shadow.png" alt="">`;
                    carousel.appendChild(shadowDiv);
                }
            },
            responsive: {
                0: { items: 1, mouseDrag: true, touchDrag: true, center: true },
                768: { items: 2, mouseDrag: true, touchDrag: true },
                1024: { items: 3, mouseDrag: false, touchDrag: false }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
    }
}



loadBackdrops().catch(console.error);


async function loadSimilarMovies() {
    try {
        const response = await fetch(`${api_url}/movie/${id_movie}/similar?api_key=${api_key}&language=pt-BR&page=1`);
        if (!response.ok) throw new Error('Erro ao buscar filmes similares');
        const data = await response.json();
        const similarMovies = data.results.slice(0, 10); // Limita a 10 filmes
        const similarMoviesContainer = document.getElementById('similar-movies');

        if (!similarMoviesContainer) return;
        similarMoviesContainer.innerHTML = ''; // Limpa o conteúdo anterior

        if (similarMovies.length === 0) {
            similarMoviesContainer.innerHTML = '<p class="text-muted">Sem filmes similares disponíveis.</p>';
            return;
        }
        similarMovies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('item');
            movieElement.innerHTML = `
                <div class="movie-card">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
                    <div class="movie-card--info text-center text-white">
                        <h3>${movie.title}</h3>
                        <p>${Math.round(movie.vote_average * 10)} %</p>
                    </div>
                </div>
            `;
            similarMoviesContainer.appendChild(movieElement);
        }
        );
        // Inicializa o Owl Carousel
        $('#similar-movies').owlCarousel({
            items: 1,
            loop: false,
            margin: 20,
            center: false,
            autowidth: true,
            autoplay: false,
            dots: false,
            nav: false,
            responsive: {
                0: { items: 2, mouseDrag: true, touchDrag: true },
                768: { items: 4, mouseDrag: true, touchDrag: true },
                1024: { items: 6, mouseDrag: false, touchDrag: false }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar filmes similares:', error);
    }
}

loadSimilarMovies().catch(console.error);
