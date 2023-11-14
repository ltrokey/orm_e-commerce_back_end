const router = require("express").Router();
const { Category, Product } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["id", "ASC"]],
      include: { model: Product, order: [["id", "ASC"]] }, // Order within the Product model
    });
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: { model: Product, order: [["id", "ASC"]] }, // Order within the Product model
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


router.post("/", (req, res) => {
  // create a new category
});

router.put("/:id", (req, res) => {
  // update a category by its `id` value
});

router.delete("/:id", (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
