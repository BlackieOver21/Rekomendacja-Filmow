class UserAuth {
    constructor(storageKey = 'user', tokenKey = 'token') {
        this.storageKey = storageKey;
        this.tokenKey = tokenKey;

        this.loginURL = "http://127.0.0.1:5000/api/login";
        this.registerURL = "http://127.0.0.1:5000/api/register" ;
        this.authenticateURL = "http://127.0.0.1:5000/api/auth/check";
    }

    async register(username, password) {
        const res = await fetch(this.registerURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
  
        if (res.ok) {
            const data = await res.json();
            console.log(data);
            this.setToken(data.access_token);  // <-- access_token ??
            this.setUser(data.user); 
            return data.user;
        } else {
            const data = await res.json();
            throw new Error(data.message);
        }
    }
  
    async login(username, password) {
        const res = await fetch(this.loginURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
  
        if (res.ok) {
            const data = await res.json();
            this.setToken(data.access_token);   // Assuming the response contains an access_token
            this.setUser(data.user);            // Assuming the response contains user data as JSON
            return data.user;
        } else {
            this.logout();
            const data = await res.json();
            throw new Error(data.message);
        }
    }
  
    async isLoggedIn() {
        const token = this.getToken();
        if (!token) return false; // no token means not logged in

        try {
            const res = await fetch(this.authenticateURL, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
            });
            return res.ok;
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