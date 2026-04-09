import express from 'express';
import 
{ 
    getCommerceType, 
    getCommerceTypeSave, 
    postCommerceTypeSave, 
    getCommerceTypeEdit, 
    postCommerceTypeEdit,
    postCommerceTypeDelete 

} from '../controllers/CommerceTypeController.js';

const router = express.Router();

router.get('/commerceType', getCommerceType);

router.get('/commerceType/save', getCommerceTypeSave);
router.post('/commerceType/save', postCommerceTypeSave);

router.get('/commerceType/edit/:id', getCommerceTypeEdit);
router.post('/commerceType/edit', postCommerceTypeEdit);

router.post('/commerceType/delete', postCommerceTypeDelete);

export default router;