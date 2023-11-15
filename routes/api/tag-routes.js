const router = require("express").Router();
const { Tag, Product, ProductTag, Category } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [["id", "ASC"]],
      include: [{ model: Product, through: ProductTag }],
    });
    return res.status(200).json(tags);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }],
    });
    if (!tagData) {
      return res.status(404).json({ message: "Tag not found." });
    }
    return res.status(200).json(tagData);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/", (req, res) => {
  // create a new tag
});

router.put("/:id", (req, res) => {
  // update a tag's name by its `id` value
});

router.delete("/:id", async (req, res) => {
  try {
    const tagId = req.params.id

    const tag = await Category.findByPk(tagId)
    if(!tag) {
      return res.status(404).json({message: "Tag not found."})
    }

    await Tag.destroy({
      where: {
        id: tagId,
      },
    })

    return res.status(200).json({message: "Tag deleted successfully"})
  } catch (err) {
    return res.status(500).json(err)
  }
});

module.exports = router;
