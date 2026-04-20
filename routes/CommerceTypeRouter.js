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

router.get('/', getCommerceType);

router.get('/save', getCommerceTypeSave);
router.post('/save', postCommerceTypeSave);

router.get('/edit/:id', getCommerceTypeEdit);
router.post('/edit', postCommerceTypeEdit);

router.post('/delete/:id', postCommerceTypeDelete);

export default router;