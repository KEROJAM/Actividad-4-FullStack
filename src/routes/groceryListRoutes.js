const express = require('express');
const router = express.Router();
const {
  getLists,
  getListById,
  createList,
  updateList,
  addItem,
  toggleItem,
  deleteItem,
  deleteList
} = require('../controllers/groceryListController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getLists)
  .post(protect, createList);

router.route('/:id')
  .get(protect, getListById)
  .put(protect, updateList)
  .delete(protect, deleteList);

router.route('/:id/items')
  .post(protect, addItem);

router.route('/:id/items/:itemId')
  .put(protect, toggleItem)
  .delete(protect, deleteItem);

module.exports = router;
