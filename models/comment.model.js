const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
    },
    content:
        { type: String,
            required: true
        },
    sender:
        { type: String,
            required: true
        },
    createdAt:
        { type: Date,
            default: Date.now
        },
});

module.exports = mongoose.model('Comment', commentSchema);
