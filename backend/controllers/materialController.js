const Material = require('../models/Material');

// @route   GET /api/materials
exports.getMaterials = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.active) filter.isActive = req.query.active === 'true';

    const materials = await Material.find(filter).sort({ category: 1, name: 1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/materials
exports.createMaterial = async (req, res) => {
  try {
    const material = await Material.create({ ...req.body, userId: req.user._id });
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/materials/:id
exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/materials/:id
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/materials/:id
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
