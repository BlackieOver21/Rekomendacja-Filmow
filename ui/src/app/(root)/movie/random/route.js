import { fetchFromAPI } from '@/logic/utils';
import { redirect } from 'next/navigation';

export async function GET() {
    // fetch random number from server (cant go past min/max movie id)
    const { success, data } = await fetchFromAPI('/movies/random');

    if (success) {
        redirect('/movie/' + data.id);
    }
    else {
        redirect('/recommended');
    }
}