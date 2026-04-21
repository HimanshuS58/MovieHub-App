import { Client, TablesDB, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

// to access the appwrite we have to write following setup
const client =new Client();

client.setEndpoint("https://fra.cloud.appwrite.io/v1");
client.setProject(PROJECT_ID);

// to access the database/tables functionality of appwrite
const tablesDB = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try{
    // 1. Use Appwrite SDK to check if the search term exists in the database   
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [Query.equal('searchTerm', searchTerm)]
        })
        console.log(result);

     // 2. If it does, update the count
     if(result.rows.length > 0) {

        const row = result.rows[0];
        console.log(row);

        await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: row.$id,
        data: {
          count: row.count + 1
        }       
      });

      console.log("Updated count");

     } 
    // 3. If it doesn't, create a new document with the search term and count as 1
     else {
        await tablesDB.createRow({
            databaseId: DATABASE_ID, 
            tableId: TABLE_ID, 
            rowId: ID.unique(), 
            data: {
            searchTerm,
            count: 1,
            poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            movie_id: movie.id,      
        }
        })
        console.log('added new search term to database');
     }
    }
    catch(error){
        console.log(error);
    }
}

export const getTrendingMovies = async () => {

    try {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [
                Query.limit(5),
                Query.orderDesc("count")
            ]
        })

        const movieRows = result.rows;

        return movieRows;
    }
    catch(error) {
        console.log(error);
    }
}