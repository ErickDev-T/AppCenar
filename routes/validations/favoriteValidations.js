import { body, param } from "express-validator";

export const validateToggleFavorite = [
  body("comercioId")
    .trim()
    .notEmpty()
    .withMessage("Comercio ID is required")
    .isMongoId()
    .withMessage("Invalid comercio ID format")
    .escape(),
];

export const validateDeleteFavorite = [
  body("favoriteId")
    .trim()
    .notEmpty()
    .withMessage("Favorite ID is required")
    .isMongoId()
    .withMessage("Invalid favorite ID format")
    .escape(),
];

