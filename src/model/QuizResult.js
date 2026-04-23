const mongoose = require('mongoose');
const { Schema } = mongoose;

const userQuiz = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'User' },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', unique: true },
    score: { type: Number, default: 0, min: 0, max: 100 },

}, {timestamps: true});

const UserQuiz = mongoose.model('UserQuiz', userQuiz);
module.exports = UserQuiz;