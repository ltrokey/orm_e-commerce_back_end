const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

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

router.delete("/:id", (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
