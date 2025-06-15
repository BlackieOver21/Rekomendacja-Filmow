import { fetchFromAPI, FetchMethod } from '@/logic/utils';
import { redirect } from 'next/navigation';

export async function GET() {
    // fetch random number from server (cant go past min/max movie id)
    const id = await fetchFromAPI(
        '/movie/random',
        undefined,
        FetchMethod.GET,
        (data) => { return data.id; }
    );

    // console.log(id)

    redirect('/movie/' + id);
}