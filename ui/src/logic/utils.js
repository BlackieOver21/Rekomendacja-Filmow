

export const FetchMethod = Object.freeze({
    GET: Symbol("GET"),
    POST: Symbol("POST"),
    PUT: Symbol("PUT"),
    DELETE: Symbol("DELETE"),
    PATCH: Symbol("PATCH"),
    OPTIONS: Symbol("OPTIONS"),
});

export async function fetchFromAPI(
    uri,
    fetchMethod = FetchMethod.GET,
    headers = {},
    body = undefined,
    dataModificationFunction = (data) => data
) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api${uri}`, 
            {
                method: fetchMethod.description,
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
                body: (body !== undefined) ? JSON.stringify(body) : undefined,
            }
        );

        if (response.ok) {
            const data = await response.json();
            const modifiedData = dataModificationFunction(data);
            // console.log(modifiedData)

            return { success: true, data: modifiedData };
        }
        else {
            const errorMessage = await response.text();
            return { success: false, error: errorMessage };
        }
    }
    catch (error) {
        return { success: false, error: error };
    }
}