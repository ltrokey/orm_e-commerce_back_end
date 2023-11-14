const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection.js");

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "category",
  },
  {
    hooks: {
      beforeUpdate: async (updatedCategory) => {
        const { category_name, id } = updatedCategory;

        const existingCategory = await Category.findOne({
          where: {
            category_name,
            id: { [sequelize.Op.not]: id },
          },
        });

        if (existingCategory) {
          throw new Error("Category with the updated name already exists.");
        }

        const [numRowsUpdated] = await Category.update(updatedCategory, {
          where: {
            id,
          },
        });

        if (numRowsUpdated === 0) {
          throw new Error("Category not updated. Internal Server Error.");
        }
      },
    },
  }
);

module.exports = Category;
