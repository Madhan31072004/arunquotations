const Client = require('../models/Client');
const { logActivity } = require('./auditController');
const { getAccessibleUserIds } = require('../utils/accessControl');

// @route   GET /api/clients
exports.getClients = async (req, res) => {
  try {
    const accessibleUserIds = await getAccessibleUserIds(req.user);
    const clients = await Client.find({ userId: { $in: accessibleUserIds } }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/clients
exports.createClient = async (req, res) => {
  try {
    const client = await Client.create({ ...req.body, userId: req.user._id });
    res.status(201).json(client);
    logActivity(req.user._id, 'create_client', 'client', client._id, `Created client ${client.name}`, req);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/clients/:id
exports.getClient = async (req, res) => {
  try {
    const accessibleUserIds = await getAccessibleUserIds(req.user);
    const client = await Client.findOne({ _id: req.params.id, userId: { $in: accessibleUserIds } });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/clients/:id
exports.updateClient = async (req, res) => {
  try {
    const accessibleUserIds = await getAccessibleUserIds(req.user);
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: { $in: accessibleUserIds } },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
    logActivity(req.user._id, 'update_client', 'client', client._id, `Updated client ${client.name}`, req);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const accessibleUserIds = await getAccessibleUserIds(req.user);
    const client = await Client.findOneAndDelete({ _id: req.params.id, userId: { $in: accessibleUserIds } });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    logActivity(req.user._id, 'delete_client', 'client', client._id, `Deleted client ${client.name}`, req);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
