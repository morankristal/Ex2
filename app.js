require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const postRouter = require('./routes/post.router');
const commentRouter = require('./routes/comment.router');
const userRouter = require('./routes/user.router');

const app = express();

app.use(bodyParser.json());
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/users', userRouter);

mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT;
const initApp = () => {
    return app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

module.exports = initApp;
