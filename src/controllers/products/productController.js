import {
  Product,
  Package,
  ProductCategory,
  ProductPackage,
  PetitStockSale,
  PetitStock,
  User,
  PetitStockSaleDetail,
  PetitStockItem,
  Account,
  CashFlow,
} from "../../models";
import { printThermal } from "../../utils/HardPrint";
import generateId from "../../utils/generateChonologicId";

import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";

const CreateProduct = asyncWrapper(async (req, res) => {
  if (!req.body?.name) {
    return res
      .status(400)
      .json({ status: "error", message: "name and Category is required" });
  }

  if (!req.body?.packages || !req.body?.packages[0].price) {
    return res.status(400).json({
      status: "error",
      message: " Packages and Price per package are required",
    });
  }

  if (await Product.findOne({ where: { name: req.body.name } })) {
    return res.status(409).json({
      status: `error`,
      message: `Product '${req.body.name}' already  exists`,
    });
  }

  for (let element of req.body.packages) {
    if (!(await Package.findByPk(element.packageId))) {
      return res.status(404).json({
        status: "error",
        message: `Package ${element.packageId} not found`,
      });
    }
  }

  const product = await Product.create({
    name: req.body.name,
  });

  for (let element of req.body.packages) {
    await ProductPackage.create({
      ProductId: product.id,
      PackageId: element.packageId,
      price: element.price,
      items: element.items,
      unit: element.unit,
    });
  }
  const data = await Product.findByPk(product.id, {
    include: [
      {
        model: Package,
        include: [
          {
            model: ProductCategory,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });

  return res.status(200).json({ status: "ok", data });
});

const UpdateProduct = asyncWrapper(async (req, res) => {
  if (!req.body.productId) {
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });
  }

  const product = Product.findByPk(req.body.id);
  if (!product)
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });

  for (let element of req.body.packages) {
    const product = Product.findByPk(req.body.id, {});
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });

    await ProductPackage.create({
      ProductId: product.id,
      PackageId: element.packageId,
      price: element.price,
      items: element.items,
      unit: element.unit,
    });
  }
  const data = await Product.findByPk(product.id, {
    include: [
      {
        model: Package,
        include: [
          {
            model: ProductCategory,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });

  product.set({
    name: req.body.name ? req.body.name : product.name,
  });

  await product.save();

  return res
    .status(200)
    .json({ status: "success", message: "Product updated successfully" });
});

const UpdateProductPackage = asyncWrapper(async (req, res) => {
  if (!req.body.product_id) {
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });
  }

  if (!req.body.package_id) {
    return res
      .status(404)
      .json({ status: "error", message: "Package not found" });
  }

  if (!req.body.price) {
    return res
      .status(404)
      .json({ status: "error", message: "Price not found" });
  }

  const product = await Product.findByPk(req.body.product_id, {
    include: [{ model: Package, where: { id: req.body.package_id } }],
  });
  if (!product)
    return res.status(404).json({
      status: "error",
      message: "We dont have that sccociation product and package",
    });

  const productPackage = await ProductPackage.findOne({
    where: { PackageId: req.body.package_id, ProductId: req.body.product_id },
  });

  if (productPackage) {
    // Update the price of the first matching package
    productPackage.set({price :req.body.price});
    await productPackage.save();
  }



  const data = await Product.findByPk(req.body.product_id, {
    include: [
      {
        model: Package,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });


  return res
    .status(200)
    .json({ status: "success", message: "Product updated successfully", product });
});

const DeleteProduct = asyncWrapper(async (req, res) => {
  if (!req.params.id || isNaN(req.params.id)) {
    return res
      .status(404)
      .json({ status: "error", message: "Product Id is required" });
  }

  const product = await Product.findByPk(req.params.id);

  if (!product)
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });

  await product.destroy();
  return res.status(200).json({ status: "ok", message: "Product deleted" });
});

const GetAllProducts = asyncWrapper(async (req, res) => {
  let data = await Product.findAll({
    order: [["id", "DESC"]],
    include: [
      {
        model: Package,
        include: [
          {
            model: ProductCategory,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "PackageId",
            "ProductId",
            "categoryId",
          ],
        },
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });

  let data2 = await Package.findAll({
    order: [["id", "DESC"]],
    include: [
      {
        model: Product,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },

      {
        model: ProductCategory,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "PackageId",
            "ProductId",
            "categoryId",
          ],
        },
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });

  return res.status(200).json({ status: "ok", data, data2 });
});

const GetProductById = asyncWrapper(async (req, res) => {
  if (!req.params.id)
    return res
      .status(400)
      .json({ status: "error", message: "Product id is required" });

  const product = await Product.findByPk(req.params.id, {
    include: [
      {
        model: Package,
        include: [
          {
            model: ProductCategory,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "PackageId",
            "ProductId",
            "categoryId",
          ],
        },
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  if (!product) {
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });
  }
  return res.status(200).json({ status: "ok", data: product });
});

const sell = asyncWrapper(async (req, res) => {
  if (!req.body.packages) {
    return res
      .status(404)
      .json({ status: "error", message: "packages key is required" });
  }

  let amount = 0;
  for (let element of req.body.packages) {
    if (!(await PetitStock.findOne({ where: { name: element.petitStock } }))) {
      return res.status(400).json({
        status: "error",
        message: `no stock named ${element.petitStock}`,
      });
    }

    // let pkg = await ProductPackage.findOne({include : [ { model : Product}, { model: Package, where : { id :  }} ] })
    let pkg = await Package.findByPk(element.packageId, {
      include: [{ model: Product }],
    });

    if (!pkg) {
      return res.status(404).json({
        status: "error",
        message: ` Package related to ${element.packageId} not found`,
      });
    }
    let productOne = pkg.toJSON().Products.filter((prod) => {
      return Number(prod.id) == Number(element.productId);
    });

    amount =
      amount + Number(productOne[0].ProductPackage.price * element.quantity);
  }

  const petitStockRow = await PetitStock.findOne({
    where: { name: req.body.packages[0].petitStock },
  });

  const petitStockSale = await PetitStockSale.create({
    status: "PENDING",
    userId: req.user.id,
    petiStockId: petitStockRow.id,
    amount,
    salesId: `PS_${await generateId(PetitStockSale)}`,
    date: new Date(),
  });

  if (petitStockSale) {
    for (let element of req.body.packages) {
      await PetitStockSaleDetail.create({
        packageId: element.packageId,
        productId: element.productId,
        quantity: element.quantity,
        petitStockSaleId: petitStockSale.id,
      });
    }
  }

  const data = await PetitStockSale.findByPk(petitStockSale.id, {
    include: [
      {
        model: PetitStockSaleDetail,
        include: [{ model: Product }, { model: Package }],
      },
    ],
  });

  if (data) {
    await printThermal(data, "EPSON");
  }

  return res
    .status(200)
    .json({ status: "success", data, message: " Successfully Product sold " });
});

const allSalles = asyncWrapper(async (req, res) => {
  const data = await PetitStockSale.findAll({
    include: [
      {
        model: PetitStockSaleDetail,
        include: [
          {
            model: Package,
            include: [
              {
                model: Product,
                attributes: { exclude: ["createdAt", "updatedAt"] },
              },
            ],
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "packageId", "petitStockSaleId"],
        },
      },
      {
        model: PetitStock,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: User,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "refreshToken",
            "password",
            "verifiedAT",
          ],
        },
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });

  let newData = [];
  let newArray = [];
  for (let item of data) {
    let details = [];

    let detail = item.PetitStockSaleDetails.map((el) => ({
      ...el.toJSON(),
      Package: {
        ...el.toJSON().Package,
        Products: el
          .toJSON()
          .Package.Products.find((prod) => prod.id == el.productId)[0],
      },
    }));

    let { PetitStockSaleDetails, ...otherKeys } = item;

    details.push(detail);
    newData.push({ ...otherKeys });
  }

  newArray = data.map((item) => ({
    id: item.dataValues.id,
    date: item.dataValues.date,
    petiStockId: item.dataValues.petiStockId,
    userId: item.dataValues.userId,
    amount: item.dataValues.amount,
    status: item.dataValues.status,
    petitStockSaleDetails: item.dataValues.PetitStockSaleDetails,
    petitStock: item.PetitStock.dataValues,
    user: item.User.dataValues,
  }));

  const filteredData = newArray.map((item) => {
    const filteredProducts = item.petitStockSaleDetails.map((detail) => {
      const filteredPackages = detail
        .toJSON()
        .Package.Products.find((product) => {
          return product.id == detail.toJSON().productId;
        });
      return {
        ...detail.toJSON(),
        Package: {
          ...detail.toJSON().Package,
          Products: filteredPackages,
        },
      };
    });
    return {
      ...item,
      petitStockSaleDetails: filteredProducts,
    };
  });

  return res
    .status(200)
    .json({ status: "success", data: filteredData, message: "All sales" });
});

const approve = asyncWrapper(async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ status: "error", message: "Id is required" });
  }

  const petitSales = await PetitStockSale.findByPk(req.body.id);

  if (!petitSales) {
    return res.status.json({
      status: "error",
      message: "There is no sales related to Id",
    });
  }

  petitSales.set({ status: "COMFIRMED" });
  await petitSales.save();

  const { account, amount, description, doneTo } = req.body;

  let accountInfo = await Account.findOne({ where: { name: "CASH" } });

  if (!accountInfo) {
    accountInfo = await Account.create({ name: "CASH", balance: 0 });
  }

  const cash_flow = await CashFlow.create({
    prevBalance: accountInfo.balance,
    newBalance: Number(accountInfo.balance) + Number(petitSales.amount),
    date: new Date(),
    description: `Payment of sales completed, Id: ${petitSales.id} `,
    amount: Number(petitSales.amount),
    account: "CASH",
    accountType: "DEBIT",
    doneBy: req.user.id,
    doneTo: req.user.id,
    status: "SUCCESS",
  });

  if (cash_flow) {
    accountInfo.set({ balance: cash_flow.newBalance });
    await accountInfo.save();
  }

  const data = await PetitStockSale.findAll({
    include: [
      {
        model: PetitStockSaleDetail,
        include: [
          {
            model: Package,
            include: [
              {
                model: Product,
                attributes: { exclude: ["createdAt", "updatedAt"] },
              },
            ],
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "packageId", "petitStockSaleId"],
        },
      },
      {
        model: PetitStock,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: User,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "refreshToken",
            "password",
            "verifiedAT",
          ],
        },
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: {
      id: req.body.id,
    },
  });

  let newData = [];
  let newArray = [];
  for (let item of data) {
    let details = [];

    let detail = item.PetitStockSaleDetails.map((el) => ({
      ...el.toJSON(),
      Package: {
        ...el.toJSON().Package,
        Products: el
          .toJSON()
          .Package.Products.find((prod) => prod.id == el.productId)[0],
      },
    }));

    let { PetitStockSaleDetails, ...otherKeys } = item;

    details.push(detail);
    newData.push({ ...otherKeys });
  }

  newArray = data.map((item) => ({
    id: item.dataValues.id,
    date: item.dataValues.date,
    petiStockId: item.dataValues.petiStockId,
    userId: item.dataValues.userId,
    amount: item.dataValues.amount,
    status: item.dataValues.status,
    petitStockSaleDetails: item.dataValues.PetitStockSaleDetails,
    petitStock: item.PetitStock.dataValues,
    user: item.User.dataValues,
  }));

  const filteredData = newArray.map((item) => {
    const filteredProducts = item.petitStockSaleDetails.map((detail) => {
      const filteredPackages = detail
        .toJSON()
        .Package.Products.find((product) => {
          return product.id == detail.toJSON().productId;
        });
      return {
        ...detail.toJSON(),
        Package: {
          ...detail.toJSON().Package,
          Products: filteredPackages,
        },
      };
    });
    return {
      ...item,
      petitStockSaleDetails: filteredProducts,
    };
  });

  for (let itemsTodeduct of filteredData[0].petitStockSaleDetails) {
    for (let item of itemsTodeduct.Package.Products.ProductPackage.items) {
      let petitStock = await PetitStockItem.findOne({
        where: {
          itemId: item.itemId,
          petitstockId: filteredData[0].petiStockId,
        },
      });

      if (petitStock) {
        petitStock.set({
          quantinty:
            petitStock.quantinty - item.quantity * itemsTodeduct.quantity,
        });
        petitStock.save();
      }
    }
  }

  return res.status(200).json({
    status: "success",
    message: `succesffuly confirmed and  ${petitSales.amount} Debited on ${accountInfo.name} account`,
    data: filteredData[0],
  });
});

const sellsByWaiter = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res
      .status(400)
      .json({ status: "error", message: " Waiter Id is required" });
  const waiter = await User.findByPk(id);

  if (!waiter)
    return res
      .status(404)
      .json({ status: "error", message: "No User/Waiter found" });

  const data = await PetitStockSale.findAll({
    include: [
      {
        model: PetitStockSaleDetail,
        include: [
          {
            model: Package,
            include: [
              {
                model: Product,
                attributes: { exclude: ["createdAt", "updatedAt"] },
              },
            ],
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "packageId", "petitStockSaleId"],
        },
      },
      {
        model: PetitStock,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: User,
        where: {
          id: waiter.id,
        },
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "refreshToken",
            "password",
            "verifiedAT",
          ],
        },
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });

  let newData = [];
  let newArray = [];
  for (let item of data) {
    let details = [];

    let detail = item.PetitStockSaleDetails.map((el) => ({
      ...el.toJSON(),
      Package: {
        ...el.toJSON().Package,
        Products: el
          .toJSON()
          .Package.Products.find((prod) => prod.id == el.productId)[0],
      },
    }));

    let { PetitStockSaleDetails, ...otherKeys } = item;

    details.push(detail);
    newData.push({ ...otherKeys });
  }

  newArray = data.map((item) => ({
    id: item.dataValues.id,
    date: item.dataValues.date,
    petiStockId: item.dataValues.petiStockId,
    userId: item.dataValues.userId,
    amount: item.dataValues.amount,
    status: item.dataValues.status,
    petitStockSaleDetails: item.dataValues.PetitStockSaleDetails,
    petitStock: item.PetitStock.dataValues,
    user: item.User.dataValues,
  }));

  const filteredData = newArray.map((item) => {
    const filteredProducts = item.petitStockSaleDetails.map((detail) => {
      const filteredPackages = detail
        .toJSON()
        .Package.Products.find((product) => {
          return product.id == detail.toJSON().productId;
        });
      return {
        ...detail.toJSON(),
        Package: {
          ...detail.toJSON().Package,
          Products: filteredPackages,
        },
      };
    });
    return {
      ...item,
      petitStockSaleDetails: filteredProducts,
    };
  });

  return res
    .status(200)
    .json({ status: "success", data: filteredData, message: "All sales" });
});
export default {
  CreateProduct,
  UpdateProduct,
  UpdateProductPackage,
  DeleteProduct,
  GetAllProducts,
  GetProductById,
  sell,
  allSalles,
  approve,
  sellsByWaiter,
};
