import { ProductCategory, Package } from "../models";

const CreateProductCategory = async (req, res) => {
  if (!req.body?.name) {
    return res
      .status(400)
      .json({ status: "error", message: "Name is required" });
  }
  const category = await ProductCategory.create(req.body);
  return res.status(201).json({ status: "ok", data: category });
};

const UpdateProductCategory = async (req, res) => {
  if (!req.body?.id || !req.body?.name) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid request" });
  }

  const category = await ProductCategory.findByPk(req.body.id);
  if (!category) {
    return res
      .status(400)
      .json({ status: "error", message: "category not found" });
  }

  category.set({
    name: req.body.name,
  });

  await category.save();

  return res.status(200).json({ status: "ok", data: category });
};

const DeleteProductCategory = async (req, res) => {
  if (!req.params?.id) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid request" });
  }
  const category = await ProductCategory.findByPk(req.params.id);
  if (!category)
    return res
      .status(400)
      .json({ status: "error", message: "category not found" });
  await category.destroy();
  return res.status(200).json({ status: "ok", message: "category deleted" });
};

const GetProductCategory = async (req, res) => {
  if (!req.params?.id) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid request" });
  }
  const category = await ProductCategory.findByPk(req.params.id,{include: [{model: Package}]});
  if (!category)
    return res
      .status(400)
      .json({ status: "error", message: "category not found" });

  return res.status(200).json({ status: "ok", data: category });
};

const GetProductCategories = async (req, res) => {
  const categories = await ProductCategory.findAll({include: [{model: Package}]});
  return res.status(200).json({ status: "ok", data: categories });
};

export default {
  CreateProductCategory,
  UpdateProductCategory,
  DeleteProductCategory,
  GetProductCategory,
  GetProductCategories,
};
