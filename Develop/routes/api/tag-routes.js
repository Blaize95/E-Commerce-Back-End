const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// find all tags
// be sure to include its associated Product data
router.get('/', async (req, res) => {
  try {
    const tagData= await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: 'tagsForProducts' }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// find a single tag by its `id`
// be sure to include its associated Product data
router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'tagsForProducts' }],
    });

    if(!tagData) {
      res.status(404).json({ message: 'No tag found with that id!' });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create a new tag
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      tag_name: "test"
    } 
  */

    Tag.create(req.body)
      .then((tag) => {
        if (req.body.productIds.length) {
          const tagProductIdArr = req.body.productIds.map((product_id) => {
            return {
              tag_id: tag.id,
              product_id,
            };
          });
          return ProductTag.bulkCreate(tagProductIdArr);
        }
        res.status(200).json(tag);
      })
      .then((ProductTagIds) => res.status(200).json(ProductTagIds))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
  .then((tag) => {
    return ProductTag.findAll({ where: { tag_id: req.params.id } });
  })
  .then((productTags) => {
    const productTagIds = productTags.map(({ product_id }) => product_id);
    const newProductTags = req.body.productIds
      .filter((product_id) => !productTagIds.includes(product_id))
      .map((product_id) => {
        return {
          tag_id: req.params.id,
          product_id,
        };
      });
    const productTagsToRemove = productTags
      .filter(({ product_id }) => !req.body.productIds.includes(product_id))
      .map(({ id }) => id);
      return Promise.all([
        ProductTag.destroy({ where: { id:
        productTagsToRemove} }),
        ProductTag.bulkCreate(newProductTags),
      ]);
  })
  .then((updatedProductTags) => res.json(updatedProductTags))
  .catch((err) => {
    res.status(400).json(err);
  });
});

// delete on tag by its `id` value
router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: {
      tag_id: req.params.tag_id,
    },
  })
    .then((deletedTag) => {
      res.json(deletedTag);
    })
    .catch((err) => res.json(err));
});

module.exports = router;
