const EventModel = require('../models/eventModel');

class EventService {
  async createEvent(data) {
    const { name, description } = data;

    if (!name) {
      throw new Error('El nombre del evento es requerido');
    }

    return await EventModel.create({ name, description });
  }

  async listEvents(page = 1, limit = 10) {
    return await EventModel.findAll(page, limit);
  }

  async searchEvents(query, page = 1, limit = 10) {
    if (!query) {
      throw new Error('El término de búsqueda es requerido');
    }

    return await EventModel.search(query, page, limit);
  }

  async getEventById(id) {
    const event = await EventModel.findById(id);
    
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return event;
  }

  async updateEvent(id, data) {
    const { name, description } = data;

    if (!name) {
      throw new Error('El nombre del evento es requerido');
    }

    const event = await EventModel.update(id, { name, description });
    
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return event;
  }

  async partialUpdateEvent(id, data) {
    const event = await EventModel.partialUpdate(id, data);
    
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return event;
  }

  async updateEventStatus(id, active) {
    if (typeof active !== 'boolean') {
      throw new Error('El estado debe ser un valor booleano');
    }

    const event = await EventModel.updateStatus(id, active);
    
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return event;
  }

  async deleteEvent(id) {
    const event = await EventModel.delete(id);
    
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return event;
  }
}

module.exports = new EventService();
