const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username": "test_user", "password": "test_password"}];

const isValid = (username)=>{ //returns boolean
    let filteredUsers = users.filter((user) => {
        return user.username === username;
    });
    if (filteredUsers.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUsers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validUsers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Check if the user is authenticated
    const username = req.session?.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Add or modify the review under the username
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review successfully added/modified." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if the user is authenticated
    const username = req.session?.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the user has a review to delete
    if (books[isbn].reviews.hasOwnProperty(username)) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review successfully deleted." });
    } else {
        return res.status(404).json({ message: "Review by this user not found." });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
