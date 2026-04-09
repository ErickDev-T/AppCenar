import express from 'express';
import 
{ 
    getConfigurations, 
    getConfigurationSave, 
    postConfigurationSave, 
    getConfigurationEdit, 
    postConfigurationEdit
    
} from '../controllers/ConfigurationController.js';

const router = express.Router();

router.get('/configuration', getConfigurations);

router.get('/configuration/save', getConfigurationSave);
router.post('/configuration/save', postConfigurationSave);

router.get('/configuration/edit/:id', getConfigurationEdit);
router.post('/configuration/edit', postConfigurationEdit);