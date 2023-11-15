const router = require("express").Router();
const { Tag, Product, ProductTag, Category } = require("../../models");

//GET All Tags
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

//GET Tag by id
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

// CREATE
router.post("/", async (req, res) => {
  try {
    const { tag_name } = req.body;

    const existingTag = await Tag.findOne({
      where: { tag_name: tag_name },
    });

    if (existingTag) {
      return res.status(400).json({
        message: "Tag with the same name already exists.",
      });
    }

    const NewTag = await Tag.create({
      tag_name: tag_name,
    });

    return res.status(201).json({
      message: "Tag created successfully.",
      category: NewTag,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const tagId = req.params.id;

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found." });
    }

    const [numRowsUpdated] = await Tag.update(req.body, {
      where: { id: tagId },
    });

    if (numRowsUpdated === 0) {
      return res
        .status(404)
        .json({ message: "Update unsuccessful, please update an item." });
    }

    const fetchedUpdatedTag = await Tag.findByPk(tagId);

    return res.status(200).json({
      message: "Tag updated successfully.",
      category: fetchedUpdatedTag,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json(err.message || "Internal Server Error");
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const tagId = req.params.id;

    const tag = await Category.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found." });
    }

    await Tag.destroy({
      where: {
        id: tagId,
      },
    });

    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
