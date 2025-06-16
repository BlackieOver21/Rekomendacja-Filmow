import { fetchFromAPI, FetchMethod } from '@/logic/utils';
import { redirect } from 'next/navigation';

export async function GET() {
    // fetch random number from server (cant go past min/max movie id)
    const data = await fetchFromAPI(
        '/movies/random',
        undefined,
        FetchMethod.GET,
        (data) => { return data; }
    );

    redirect('/movie/' + data.data.id);
}