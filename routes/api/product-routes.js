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
router.post("/", async (req, res) => {
  try {
    const { product_name, price, stock, tagIds, category_id } = req.body;

    const product = await Product.create({
      product_name,
      price,
      stock,
      category_id,
    });

    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    if (category_id) {
      await product.setCategory(category_id);
    }

    const createdProduct = await Product.findByPk(product.id, {
      include: [{ model: Category }, { model: Tag }],
    });

    res.status(200).json({
      message: "Product successfully created.",
      product: createdProduct,
    });
  } catch (err) {
    console.error(err);

    if (err.name === "SequelizeValidationError") {
      res.status(400).json({
        message: "Validation error. Please check your input.",
        error: err.message,
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error. Something went wrong.",
        error: err.message,
      });
    }
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { product_name, price, stock, tagIds } = req.body;

    const updatedFields = {};
    if (product_name) updatedFields.product_name = product_name;
    if (price) updatedFields.price = price;
    if (stock) updatedFields.stock = stock;

    const [numRowsUpdated] = await Product.update(updatedFields, {
      where: {
        id: req.params.id,
      },
    });

    if (numRowsUpdated === 0) {
      return res
        .status(404)
        .json({ message: "Update unsuccessful, please update an item." });
    }

    if (tagIds && tagIds.length) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));

      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !tagIds.includes(tag_id))
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
