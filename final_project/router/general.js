const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const fetchBooks = () => {
            return new Promise((resolve, reject) => {
                resolve(books);
            });
        };

        const response = await fetchBooks();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if username already exists
    const userExists = users.some(user => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists." });
    }
  
    // Add the new user
    users.push({ username, password });
  
    return res.status(201).json({ message: "User registered successfully." });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params['isbn'];
  
      const fetchBookDetails = (isbn) => {
        return new Promise((resolve, reject) => {
          if (Object.keys(books).includes(isbn)) {
            resolve(books[isbn]);
          } else {
            resolve({});
          }
        });
      };
  
      const bookDetails = await fetchBookDetails(isbn);
  
      return res.status(200).json(bookDetails);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book details" });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const author = req.params['author'].toLowerCase();
  
      const fetchBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
          const filteredBooks = Object.values(books).filter(book =>
            book.author.toLowerCase().includes(author)
          );
          resolve(filteredBooks);
        });
      };
  
      const filteredBooks = await fetchBooksByAuthor(author);
  
      return res.status(200).json(filteredBooks);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by author" });
    }
  });

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
      const title = req.params['title'].toLowerCase();
  
      const fetchBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
          const filteredBooks = Object.values(books).filter(book =>
            book.title.toLowerCase().includes(title)
          );
          resolve(filteredBooks);
        });
      };
  
      const filteredBooks = await fetchBooksByTitle(title);
  
      console.log(filteredBooks);
      return res.status(200).json(filteredBooks);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by title" });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params['isbn'];
  const bookReview = Object.keys(books).includes(isbn) ? books[isbn].reviews : {}
  return res.status(200).json(bookReview);
});

module.exports.general = public_users;
