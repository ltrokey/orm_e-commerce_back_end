const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

//GET All Categories
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["id", "ASC"]],
      include: [{ model: Category }, { model: Tag }],
    });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET Product by id
router.get("/:id", async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    if (!productData) {
      return res.status(404).json({ message: "Product not found." });
    } else {
      return res.status(200).json(productData);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// CREATE
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const [numRowsUpdated] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (numRowsUpdated === 0) {
      return res
        .status(404)
        .json({ message: "Update unsuccessful, please update one item." });
    }

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));

      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    const updatedProduct = await Product.findByPk(req.params.id);

    return res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error:", err);

    if (err.message.includes("Product not found.")) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await Product.destroy({
      where: {
        id: productId,
      },
    });
    return res.status(200).json({ message: "Successfully deleted product." });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
