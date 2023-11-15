const router = require("express").Router();
const { Category, Product } = require("../../models");

// GET All Categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["id", "ASC"]],
      include: { model: Product, order: [["id", "ASC"]] },
    });
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET Category by id
router.get("/:id", async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: { model: Product, order: [["id", "ASC"]] },
    });
    if (!categoryData) {
      return res.status(404).json({ message: "Category not found." });
    } else {
      return res.status(200).json(categoryData);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const { category_name } = req.body;

    const existingCategory = await Category.findOne({
      where: { category_name: category_name },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category with the same name already exists.",
      });
    }

    const newCategory = await Category.create({
      category_name: category_name,
    });

    return res.status(201).json({
      message: "Category created successfully.",
      category: newCategory,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const updatedCategory = await Category.update(req.body, {
      where: { id: categoryId },
    });

    const fetchedUpdatedCategory = await Category.findByPk(categoryId);

    return res.status(200).json({
      message: "Category updated successfully.",
      category: fetchedUpdatedCategory,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json(err.message || "Internal Server Error");
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    await Category.destroy({
      where: {
        id: categoryId,
      },
    });

    return res.status(200).json({ message: "Category deleted successfully." });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
