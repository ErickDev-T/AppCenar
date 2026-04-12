import { body, param } from "express-validator";

export const validateGetEdit = [
  param("addressId")
    .trim()
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID format")
    .escape(),
];

export const validatePostCreate = [
  body("Name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .escape(),
  body("Description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .escape(),
];

export const validatePostEdit = [
  body("Name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .escape(),
  body("Description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .escape(),
  body("AddressId")
    .trim()
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID format")
    .escape(),
];

export const validateDelete = [
  body("AddressId")
    .trim()
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID format")
    .escape(),
];