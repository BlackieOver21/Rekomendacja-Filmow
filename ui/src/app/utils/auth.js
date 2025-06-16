import { fetchFromAPI, FetchMethod } from "@/logic/utils";

class UserAuth {
    constructor(storageKey = 'user', tokenKey = 'token') {
        this.storageKey = storageKey;
        this.tokenKey = tokenKey;

        this.loginURL = "/login";
        this.registerURL = "/register" ;
        this.authenticateURL = "/auth/check";
    }

    async register(username, password) {
        const { success, data } = await fetchFromAPI(
            this.registerURL,
            FetchMethod.POST,
            {}, 
            { username, password }
        );
  
        if (success) {
            console.log(data);
            this.setToken(data.access_token);  // <-- access_token ??
            this.setUser(data.user); 
            return data.user;
        } else {
            throw new Error(data.message);
        }
    }
  
    async login(username, password) {
        const { success, data } = await fetchFromAPI(
            this.loginURL,
            FetchMethod.POST,
            {}, 
            { username, password }
        );
        
        if (success) {
            this.setToken(data.access_token);   // Assuming the response contains an access_token
            this.setUser(data.user);            // Assuming the response contains user data as JSON
            return data.user;
        } else {
            this.logout();
            throw new Error(data.message);
        }
    }
  
    async isLoggedIn() {
        const token = this.getToken();
        if (!token) return false; // no token means not logged in

        try {
            const { success, data } = await fetchFromAPI(
                this.authenticateURL,
                FetchMethod.GET,
                { "Authorization": `Bearer ${token}` }
            );
            
            return success;
        } catch (error) {
            console.error("Auth check failed:", error);
            return false;
        }
    }

    getUser() {
        if (typeof window !== "undefined") {
            const user = localStorage.getItem(this.storageKey);
            return user ? JSON.parse(user) : null;
        }
        return null;
    }

    setUser(userData) {
        if (typeof window !== "undefined") {
            localStorage.setItem(this.storageKey, JSON.stringify(userData));
        }
    }

    setToken(token) {
        if (typeof window !== "undefined") {
            localStorage.setItem(this.tokenKey, token);
        }
    }

    getToken() {
        if (typeof window !== "undefined") {
            return localStorage.getItem(this.tokenKey);
        }
        return null;
    }

    getUserId() {
        const user = this.getUser();
        return user ? user.id : null;
    }

    getUsername() {
        const user = this.getUser();
        return user ? user.username : null;
    }

    logout() {
        if (typeof window !== "undefined") {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.tokenKey);
        }
    }
  }
  
export default UserAuth;