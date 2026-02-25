const GroceryList = require('../models/GroceryList');

const getLists = async (req, res) => {
  try {
    const lists = await GroceryList.find({ user: req.user.id });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListById = async (req, res) => {
  try {
    const list = await GroceryList.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (list) {
      res.json(list);
    } else {
      res.status(404).json({ message: 'Lista no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createList = async (req, res) => {
  try {
    const { name, items } = req.body;

    const list = await GroceryList.create({
      user: req.user.id,
      name: name || 'Mi lista de compras',
      items: items || []
    });

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateList = async (req, res) => {
  try {
    const list = await GroceryList.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (list) {
      list.name = req.body.name || list.name;
      
      if (req.body.items) {
        list.items = req.body.items;
      }

      const updatedList = await list.save();
      res.json(updatedList);
    } else {
      res.status(404).json({ message: 'Lista no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addItem = async (req, res) => {
  try {
    const list = await GroceryList.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (list) {
      const { name, quantity, unit } = req.body;
      list.items.push({
        name,
        quantity: quantity || 1,
        unit: unit || 'unidad'
      });

      const updatedList = await list.save();
      res.json(updatedList);
    } else {
      res.status(404).json({ message: 'Lista no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleItem = async (req, res) => {
  try {
    const list = await GroceryList.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (list) {
      const item = list.items.id(req.params.itemId);
      
      if (item) {
        item.completed = !item.completed;
        const updatedList = await list.save();
        res.json(updatedList);
      } else {
        res.status(404).json({ message: 'Item no encontrado' });
      }
    } else {
      res.status(404).json({ message: 'Lista no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const list = await GroceryList.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (list) {
      list.items.pull(req.params.itemId);
      const updatedList = await list.save();
      res.json(updatedList);
    } else {
      res.status(404).json({ message: 'Lista no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const list = await GroceryList.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (list) {
      await list.deleteOne();
      res.json({ message: 'Lista eliminada' });
    } else {
      res.status(404).json({ message: 'Lista no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLists,
  getListById,
  createList,
  updateList,
  addItem,
  toggleItem,
  deleteItem,
  deleteList
};
