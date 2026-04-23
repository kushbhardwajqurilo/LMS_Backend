const mongoose = require('mongoose');
const { Schema } = mongoose;

// Option sub-schema
const OptionSchema = new Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
}, { _id: false });

// Question sub-schema
const QuestionSchema = new Schema({
    text: { type: String, required: true },
    type: { type: String, enum: ['single', 'multiple'], required: true },  // single = single choice answer, multiple = multiple choice answers
    options: { type: [OptionSchema], required: true },
    explanation: { type: String },
}, { _id: false });

// Quiz schema
const QuizSchema = new Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String },
    durationInMinutes: { type: Number, default: 60 },
    questions: { type: [QuestionSchema], required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizStart: { type: Date, default: Date.now },
    quizEnd: { type: Date, default: function () { return new Date(Date.now() + 24 * 60 * 60 * 1000)} },

}, { timestamps: true });

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;