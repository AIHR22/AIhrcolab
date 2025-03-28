const mongoose = require("mongoose")

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['monthly', 'yearly', 'category', 'tax'],
    required: true
  },
  dateRange: {
    start: {
      type: Date,\
      required: true  'tax'],
    required: true
  },
  dateRange: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  data: {
    type: Object,
    required: true
  },
  summary: {
    type: Object,
    required: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Report", ReportSchema)

