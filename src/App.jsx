import { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';


const MOVIE_API_BASE_URL = 'https://api.themoviedb.org/3';   

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const GET_API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {

  const [debounceSearch, setDebounceSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);


  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500 ms
  useDebounce(() => setDebounceSearch(searchTerm), 700, [searchTerm])


// function to fetch movies from the API based on the search term, and update the state with the results.
  const fetchMovies = async (query = '') => {   // async (query) => {}

    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${MOVIE_API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
        : `${MOVIE_API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`; 

      const response = await fetch(endpoint, GET_API_OPTIONS);

      const data = await response.json();

      if (data.results) { 
       
        console.log(data.results);
        
        setMovieList(data.results)
      }

      if (query && data.results.length > 0) {
        updateSearchCount(query, data.results[0]);
      }

    }
    catch (error) {
      console.log('Error occured', error);
      setErrorMessage('Error fetching movies. Please try again later.')
    }
    finally {
      setIsLoading(false);
    }
  }


// loading trending movies from appwrite database and setting it to state  
  const loadTrendingMovies = async () => {

    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    }
    catch (error) {
      console.log(`Error fetching trending movies: ${error}`);
    }
  }
  

  useEffect(() => {
    fetchMovies(debounceSearch);
  }, [debounceSearch])


  useEffect(() => {
    loadTrendingMovies();
  }, [])

  return (
    <main>
      <div className="pattern" />

      <div className='wrapper'>

        <header>
          <img src="./hero.png" alt="hero" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {
          trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>

              <ul>
                {
                  trendingMovies.map((movie, index) => (
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img src={movie.poster_url} alt="Movie poster" />
                    </li>
                  ))
                }
              </ul>
            </section>
          )
        }

        <section className="all-movies">
          <h2 >All Movies</h2>

          {
            isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {
                  movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))
                }
              </ul>
            )
          }
        </section>

      </div>

    </main >
  )
}

export default App
