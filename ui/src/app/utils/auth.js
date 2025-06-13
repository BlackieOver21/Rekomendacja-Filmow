
class UserAuth {
    constructor(storageKey = 'user', tokenKey = 'token') {
        this.storageKey = storageKey;
        this.tokenKey = tokenKey;

        this.loginURL = "http://192.168.94.12:5000/api/login";
        this.registerURL = "http://192.168.94.12:5000/api/register" ;
        this.authenticateURL = "http://192.168.94.12:5000/api/check-auth";
    }

    async register(username, password) {
        const res = await fetch(this.registerURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
  
        if (res.ok) {
            const data = await res.json();
            this.setToken(data.token); // Assuming 'data.user' contains user information
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
            this.setUser(data.user); // Assuming 'data.user' contains user information
            this.setToken(data.token); // Assuming 'data.user' contains user information
            return data.user;
        } else {
            this.logout();
            const data = await res.json();
            throw new Error(data.message);
        }
    }
  
    async isLoggedIn() {
        const user = this.getUser();
        const token = this.getToken();

        const res = await fetch(this.authenticateURL, {
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        });
  
        return res.ok;
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

    logout() {
        if (typeof window !== "undefined") {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.tokenKey);
        }
    }
  }
  
export default UserAuth;