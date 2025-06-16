import { fetchFromAPI, FetchMethod } from "@/utils/utils";

export default class UserReview {
    constructor() {}
    
    async fetchMovieReviews(movieId, token) {
        // ten endpoint nie jest do tego, prawidlowy nie istnieje na razie
        const { success, data } = await fetchFromAPI(
            `/ratings/${movieId}`, 
            FetchMethod.GET,
            { "Authorization": `Bearer ${token}` },
        );
        
        if (!success) throw new Error('Failed to fetch movie reviews');
        return data;
    }

    async fetchUserReviews(movieId, token) {
        const { success, data } = await fetchFromAPI(
            `/ratings/${movieId}`, 
            FetchMethod.GET,
            { "Authorization": `Bearer ${token}` },
        );
        
        if (!success) throw new Error('Failed to fetch movie reviews');
        return data;
    }

    async postReview({ movieId, rating, text, token }) {
        const { success, data } = await fetchFromAPI(
            `/ratings`, 
            FetchMethod.POST,
            { "Authorization": `Bearer ${token}` },
            { 
                movie_id: movieId,
                value: rating,
                comment: text
            }
        );

        if (!success) throw new Error('Failed to post review');

        return data;
    }

    async updateReview({ movieId, rating, text, token }) {
        const { success, data } = await fetchFromAPI(
            `/ratings/${movieId}`, 
            FetchMethod.PUT,
            { "Authorization": `Bearer ${token}` },
            {
                value: rating,
                comment: text
            }
        );

        if (!success) throw new Error('Failed to update review');

        return data;
    }
}
