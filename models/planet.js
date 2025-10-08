const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true }
  },
  { collection: 'planets' }
);

module.exports = mongoose.models.Planet || mongoose.model('Planet', planetSchema);
