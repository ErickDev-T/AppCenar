import { body, param} from "express-validator";

export const validatePostCreate = [
  body("CommerceId")
    .trim()
    .notEmpty()
    .withMessage("Commerce ID is required")
    .isMongoId()
    .withMessage("Invalid commerce ID format")
    .escape(),
  body("AddressId")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isMongoId()
    .withMessage("Invalid address ID format")
    .escape(),
  body("Products")
    .trim()
    .notEmpty()
    .withMessage("Products are required")
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("At least one product is required");
        }
        return true;
      } catch {
        throw new Error("Invalid products format");
      }
    }),
];

export const validateGetDetail = [
  param("orderId")
    .trim()
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID format")
    .escape(),
];