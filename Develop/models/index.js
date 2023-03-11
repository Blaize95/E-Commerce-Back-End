// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category, {
  foreignKey: 'product_id',
});
// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});
// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tags, {
  through: {
    model: ProductTag,
    unique: false
  },
  as: 'productsForTags'
});
// Tags belongToMany Products (through ProductTag)
Tags.belongsToMany(Product, {
  through: {
    model: ProductTag,
    unqiue: false
  },
  as: 'tagsForProducts'
});

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
