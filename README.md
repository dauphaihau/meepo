# Meepo
![Screenshot](./public/preview.png)
Meepo is a free social networking site where people converse with each other in short messages

<a href="https://meepo-app.onrender.com">Try it now</a>

## Stack
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Vue](https://vuejs.org/) - The Progressive JavaScript Framework
- [Vue Query](https://vuejs.org/) - Managing and caching asynchronous data
- [Pinia](https://pinia.vuejs.org/) - State management library for Vue
- [Typescript](https://www.typescriptlang.org/) - Static Type Checking
- [Ruby on Rails](https://www.typescriptlang.org/) - Full-stack Framework, use to build server-side
- [Postgresql](https://www.postgresql.org/) - Relational Database
- [Redis](https://redis.io/) - In-memory data structure store, use to cache data

## Features
- Log in, sign up, sign out, forgot password
- User can update profile
- User can create, delete, update, like, reply, pin post
- Users can see their and other followers and the following list
- Users can follow/unfollow other user
- Realtime update likes, reply
- Search posts/users based on followers, likes, image, where user reply 
- Search trends based on hashtags 
- Chat
- Limit edit post
- Responsive design for mobile, tablet, and desktop

## Known Bugs
Feel free to email me at dauphaihau@gmail.com if you run into any issues or have questions, ideas or concerns. Please enjoy
and feel free to share your opinion, constructive criticism, or comments about my work. Thank you! 🙂

And More ! There's always room for improvement!

## Installation Guide
### Client-side
> **Note**
> Requirements: [Node.js](https://nodejs.org) >= 16.2.x
 
1. **Clone the GitHub repository**
```bash
https://github.com/dauphaihau/meepo.git
```
2. **Install dependencies**
```bash
yarn
```
3. **Copy .env.example to .env and update the variables**
 

4. **Launches a dev server**
```bash
yarn dev
```
### Server-side

Source backend: <a href="https://github.com/dauphaihau/meepo-be">link</a>
> **Note**
> Requirements: [Ruby](https://www.ruby-lang.org/en/) >= 3.0.0

1. **Clone the GitHub repository**
```bash
https://github.com/dauphaihau/meepo-be.git
```

2. **Configure Database**
 
    set your database url into config/database.yml 
 

3. **Configure Cache store**
 
    set your redis url into config/cable.yml 
 

4. **Install gems**
```bash
bundle install
```

5. **Runs migrations**
```bash
rails db:migrate
```
6. **Launches a web server**
```bash
rails s
```
