import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { carControllers } from './car.controller';
import { carValidation } from './car.validation';
import { upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  upload.array('images', 5),
  auth('seller'),
  validateRequest(carValidation.createCarValidation),
  carControllers.createCar
);

router.patch('/:id/status', auth('admin'), carControllers.updateCarStatus);
router.delete('/:id', auth('seller', 'admin'), carControllers.deleteCar);

router.get('/my-cars', auth('seller'), carControllers.getMyCars);

export const carRoutes = router;
