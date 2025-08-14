const api_key = '3eb7ccd86dc5239c6eb11c595f703236';
const api_url = 'https://api.themoviedb.org/3';
const id_movie = '617126';

async function getMovie() {
    const response = await fetch(`${api_url}/movie/${id_movie}?api_key=${api_key}&language=pt-BR&append_to_response=videos,images,credits,reviews`);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const movie = await response.json();

    return {
        posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        title: movie.title,
        genres: movie.genres?.map(genre => genre.name).join(', ') || 'Não informado',
        overview: movie.overview,
        year: new Date(movie.release_date).getFullYear(),
        releaseDate: movie.release_date,
        director: movie.credits?.crew?.find(crew => crew.job === 'Director')?.name || 'Desconhecido',
        story: movie.credits?.crew
            ?.filter(crew => ['Writer', 'Screenplay', 'Story'].includes(crew.job))
            .map(crew => crew.name)
            .filter((name, index, self) => self.indexOf(name) === index)
            .join(', ') || 'Desconhecido',
        lenguage: movie.original_language,
        budget: movie.budget?.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }) || 'Não informado',
        revenue: movie.revenue?.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }) || 'Não informado',
        rating: movie.vote_average,
        reviews: movie.reviews?.results?.map(review => ({
            author: review.author,
            content: review.content,
            rating: review.author_details?.rating ?? 'Sem nota',
            date: new Date(review.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
        })) || [],
        videos: movie.videos?.results?.slice(0, 5).map(video => ({
            key: video.key,
            name: video.name,
            site: video.site
        })) || [],
        cast: movie.credits?.cast?.slice(0, 10).map(actor => ({
            name: actor.name,
            character: actor.character,
            profileUrl: actor.profile_path
                ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                : 'https://via.placeholder.com/150x225?text=Sem+Foto'
        })) || []
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

        renderReviews(movie.reviews); // <- muito melhor separado

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


function renderReviews(reviews) {
    const container = document.querySelector('.reviews-container');

    if (!container || reviews.length === 0) {
        container.innerHTML = '<p class="text-muted">Sem resenhas disponíveis.</p>';
        return;
    }

    container.innerHTML = ''; // limpa o conteúdo anterior

    reviews.slice(1, 3).forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('reviews__container--item', 'col-12', 'col-md-6');
        reviewElement.innerHTML = `
      <p class="reviews__content">${review.content}</p>
      <div class="author col-12">
        <h4 class="author__name col-12">Por: <span>${review.author}</span></h4>
        <div class="author__info">
          <p class="author__date">${review.date}</p>
          <p class="author__rating">
            Nota: ${review.rating ? `<span>${review.rating}</span> / 10` : 'Sem nota'}
          </p>
        </div>
      </div>
    `;
        container.appendChild(reviewElement);
    });
}

async function loadVideos() {
    try {
        const movie = await getMovie();
        const videoContainer = document.getElementById('videos');

        if (!videoContainer) return;

        videoContainer.innerHTML = ''; // Limpa o conteúdo anterior
        if (movie.videos.length === 0) {
            videoContainer.innerHTML = '<p class="text-muted">Sem vídeos disponíveis.</p>';
            return;
        }

        movie.videos.forEach(video => {
            const videoElement = document.createElement('div');
            const item = document.createElement('div');
            item.classList.add('item');
            videoElement.classList.add('video-item');
            videoElement.innerHTML = `
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/${video.key}"
                title="${video.name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `;
            item.appendChild(videoElement);
            videoContainer.appendChild(item);
        });

        // Inicializa o Owl Carousel
        $('#videos').owlCarousel({
            items: 1,
            loop: false,
            margin: 20,
            center: false,
            autowidth: true,
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
            items: 1,
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
            items: 1,
            loop: false,
            margin: 20,
            center: true,
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
                0: { items: 2, mouseDrag: true, touchDrag: true },
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
                        <p>${movie.vote_average.toFixed(1)} / 10</p>
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
            onInitialized: function () {
                const carousel = document.getElementById('similar-movies');
                if (carousel) {
                    const shadowDiv = document.createElement('div');
                    shadowDiv.className = 'similar-shadow';
                    shadowDiv.innerHTML = `<img src="./assets/img/shadow.png" alt="">`;
                    carousel.appendChild(shadowDiv);
                }
            },
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
