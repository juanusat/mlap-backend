const express = require('express');
const router = express.Router();
const DocumentTypeModel = require('../models/documentTypeModel');

// Public endpoint to retrieve active document types (no auth required)
router.get('/document-types', async (req, res) => {
  try {
    // Request a reasonably large page so we get all standard document types
    const result = await DocumentTypeModel.findAll(1, 100);
    const types = (result.data || []).filter(t => t.active).map(t => ({ id: t.id, name: t.name, code: t.code }));

    res.status(200).json({
      message: 'Tipos de documento obtenidos exitosamente',
      data: types,
      error: null,
      traceback: null
    });
  } catch (error) {
    console.error('Error fetching public document types:', error);
    res.status(500).json({
      message: 'Error al obtener tipos de documento',
      data: [],
      error: error.message,
      traceback: error.stack
    });
  }
});

module.exports = router;
