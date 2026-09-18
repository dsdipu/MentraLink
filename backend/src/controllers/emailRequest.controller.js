const EmailRequest = require("../models/EmailRequest");

// Public — anyone can submit a request for help getting their student email
const createEmailRequest = async (req, res) => {
  try {
    const { name, personalEmail, phone, admissionInfo, message } = req.body;
    if (!name || !personalEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    const request = await EmailRequest.create({ name, personalEmail, phone, admissionInfo, message });
    res.status(201).json({ message: "Request submitted", request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin — view all requests
const getEmailRequests = async (req, res) => {
  try {
    const requests = await EmailRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin — update status as they follow up
const updateEmailRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await EmailRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createEmailRequest, getEmailRequests, updateEmailRequestStatus };